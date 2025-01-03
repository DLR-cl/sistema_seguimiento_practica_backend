import { BadRequestException, Body, ConflictException, HttpStatus, Injectable, InternalServerErrorException, Post } from '@nestjs/common';
import { InformeEvaluativoDto, RespuestasInformeEvaluativo } from '../dto/informe-evaluativo.dto';
import { DatabaseService } from '../../../database/database/database.service';
import { Estado_informe, Estado_practica, Prisma, PrismaClient, TipoPractica } from '@prisma/client';
import { AsignarPreguntaDto } from '../../../modules/preguntas-implementadas-informe-alumno/dto/asignar-preguntas.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class EvaluacionAcademicaService {

    constructor(
        private readonly _databaseService: DatabaseService,
    ) { }

    async crearInformeEvaluacionAcademicos(informe: InformeEvaluativoDto) {
        if (!informe.respuestas || informe.respuestas.length === 0) {
            throw new BadRequestException('El informe evaluativo debe incluir respuestas.');
        }

        // Validar informe del alumno
        const informeAlumno = await this.obtenerInformeAlumno(informe.id_informe_alumno);
        // Validar estado del informe
        this.validarEstadoInforme(informeAlumno);

        // Validar existencia de informe confidencial fuera de la transacción
        const informeConfidencial = await this._databaseService.informeConfidencial.findUnique({
            where: { id_informe_confidencial: informe.id_informe_confidencial },
        });
        if (!informeConfidencial) {
            throw new BadRequestException(`No se encuentra el informe confidencial con id ${informe.id_informe_confidencial}.`);
        }




        // Procesar respuestas deficientes
        const respuesta = await this.procesarRespuestasDeficientes(informe, informeAlumno);
        if (respuesta) {
            return respuesta // retornará algo solo si se echó la práctica.
        }

        // Registrar el informe evaluativo
        const informeEval = await this._databaseService.informeEvaluacionAcademicos.findFirst({
            where: {
                id_informe_alumno: informe.id_informe_alumno,
                id_informe_confidencial: informe.id_informe_confidencial
            }
        });
        if (informeEval) {
            await this.actualizarRespuestas(informe.respuestas, informeEval.id_informe, informe.id_informe_alumno)

            // Actualizar estados
            if (!respuesta) {
                await this.actualizarEstados(informe.id_informe_confidencial, informeAlumno.id_informe, informeAlumno.id_practica);
            }
            return {
                message: 'Actualización del informe exitoso',
                status: HttpStatus.OK,
            };
        }
        const informeEvaluativo: number = await this.registrarInformeEvaluativo(informe);


        // Registrar respuestas
        if (!informeEvaluativo) {
            throw new BadRequestException('No existe informe evaluativo o no se creo correctamente');
        }
        console.log('Se creo tu informe')
        await this.crearRespuestasInformeEvaluativo(informe.respuestas, informeEvaluativo);

        // Actualizar estados
        if (!respuesta) {
            await this.actualizarEstados(informe.id_informe_confidencial, informeAlumno.id_informe, informeAlumno.id_practica);
        }

        return {
            message: 'Registro del informe exitoso',
            id_informe: informeEvaluativo,
            status: HttpStatus.OK,
        };
    }

    private async actualizarRespuestas(respuestas: RespuestasInformeEvaluativo[], id_informe_evaluativo: number, id_informe_alumno: number) {
        const informeAlumno = await this._databaseService.informesAlumno.findUnique({
            where: { id_informe: id_informe_alumno },
            include: {
                informe_academico: true,
            }
        });
        console.log(informeAlumno)

        const respuestasInvalidas = respuestas.filter(
            (res) => !res.respuesta_texto || !res.pregunta_id,
        );

        if (respuestasInvalidas.length > 0) {
            throw new BadRequestException('Algunas respuestas no contienen los campos requeridos.');
        }

        const respuestasConIdInforme = respuestas.map((respuesta) => ({
            ...respuesta,
            informe_id: informeAlumno.informe_academico.id_informe,
        }));


        for (let i of respuestas) {
            await this._databaseService.respuestasInformeEvaluacion.update({
                where: {
                    pregunta_id_informe_id: {
                        informe_id: id_informe_evaluativo,
                        pregunta_id: i.pregunta_id
                    }
                },
                data: {
                    respuesta_texto: i.respuesta_texto
                }
            })
        }


    }
    private async obtenerInformeAlumno(id_informe_alumno: number) {
        const informeAlumno = await this._databaseService.informesAlumno.findUnique({
            where: { id_informe: id_informe_alumno },
            include: { practica: true, respuestas: true },
        });

        if (!informeAlumno) {
            throw new BadRequestException('No se encuentra el informe del alumno disponible');
        }

        return informeAlumno;
    }

    private validarEstadoInforme(informeAlumno: any) {
        if (informeAlumno.estado !== Estado_informe.REVISION) {
            throw new BadRequestException('El informe no está en estado de revisión');
        }
    }
    private async procesarRespuestasDeficientes(
        informe: InformeEvaluativoDto,
        informeAlumno: any,
    ) {
        const respuestasDeficientes = informe.respuestas.some(
            (respuesta) => respuesta.respuesta_texto.toUpperCase() === 'DEFICIENTE',
        );

        if (respuestasDeficientes) {
            const intentosRestantes = informeAlumno.intentos - 1;

            if (intentosRestantes > 0) {
                console.log('Actualizando retante')
                await this._databaseService.informesAlumno.update({
                    where: { id_informe: informe.id_informe_alumno },
                    data: { estado: Estado_informe.CORRECCION, intentos: intentosRestantes },
                });

                await this._databaseService.practicas.update({
                    where: { id_practica: informeAlumno.id_practica },
                    data: { estado: Estado_practica.REVISION_GENERAL },
                });
                return {
                    ultimo: false
                }
            } else {
                await this._databaseService.informesAlumno.update({
                    where: { id_informe: informe.id_informe_alumno },
                    data: { estado: Estado_informe.DESAPROBADA },
                });

                await this._databaseService.practicas.update({
                    where: { id_practica: informeAlumno.id_practica },
                    data: { estado: Estado_practica.FINALIZADA },
                });

                await this.finalizarPractica(informeAlumno);
                return {
                    message: 'El informe tiene respuestas deficientes, REPROBADO por intentos fallidos.',
                    ultimo: true,
                }
            }
        }

        return null; // Continua si no hay respuestas deficientes
    }

    async registrarInformeEvaluativo(informe: InformeEvaluativoDto): Promise<number> {


        try {

            // Validar si ya existe un informe con id_informe_confidencial
            const existeConfidencial = await this._databaseService.informeEvaluacionAcademicos.findFirst({
                where: { id_informe_confidencial: informe.id_informe_confidencial },
            });

            if (existeConfidencial) {
                throw new ConflictException(`El id_informe_confidencial ${informe.id_informe_confidencial} ya está en uso.`);
            }

            // Validar si ya existe un informe con id_informe_alumno (si está presente)
            if (informe.id_informe_alumno) {
                const existeAlumno = await this._databaseService.informeEvaluacionAcademicos.findFirst({
                    where: { id_informe_alumno: informe.id_informe_alumno },
                });

                if (existeAlumno) {
                    throw new ConflictException(`El id_informe_alumno ${informe.id_informe_alumno} ya está en uso.`);
                }
            }

            // Crear el informe evaluativo
            const data = await this._databaseService.informeEvaluacionAcademicos.create({
                data: {
                    id_academico: +informe.id_academico,
                    id_informe_confidencial: +informe.id_informe_confidencial,
                    id_informe_alumno: informe.id_informe_alumno ? +informe.id_informe_alumno : null,
                    fecha_revision: informe.fecha_revision,
                },
            });
            return data.id_informe;
        } catch (error) {
            throw error;
        }
    }


    private async actualizarEstados(
        id_informe_confidencial: number,
        id_informe_alumno: number,
        id_practica: number
    ) {
        const informeAlumno = await this._databaseService.informesAlumno.update({
            where: { id_informe: id_informe_alumno },
            data: { estado: Estado_informe.APROBADA },
        });

        await this._databaseService.informeConfidencial.update({
            where: { id_informe_confidencial: id_informe_confidencial },
            data: { estado: Estado_informe.APROBADA },
        });

        await this._databaseService.practicas.update({
            where: { id_practica: id_practica },
            data: { estado: Estado_practica.FINALIZADA },
        });
        await this.finalizarPractica(informeAlumno);
    }
    private async finalizarPractica(informeAlumno: any) {
        const practica = await this._databaseService.practicas.update({
            where: { id_practica: informeAlumno.id_practica },
            data: { estado: Estado_practica.FINALIZADA },
        });

        await this._databaseService.alumnosPractica.update({
            where: { id_user: informeAlumno.id_alumno },
            data:
                practica.tipo_practica === TipoPractica.PRACTICA_UNO
                    ? { segunda_practica: false }
                    : { primer_practica: false },
        });
    }


    async crearRespuestasInformeEvaluativo(
        respuestas: RespuestasInformeEvaluativo[],
        id_informe: number,
    ): Promise<any> {
        try {

            const respuestasInvalidas = respuestas.filter(
                (res) => !res.respuesta_texto || !res.pregunta_id,
            );

            if (respuestasInvalidas.length > 0) {
                throw new BadRequestException('Algunas respuestas no contienen los campos requeridos.');
            }

            const respuestasConIdInforme = respuestas.map((respuesta) => ({
                ...respuesta,
                informe_id: id_informe,
            }));

            return this._databaseService.respuestasInformeEvaluacion.createMany({
                data: respuestasConIdInforme,
            });
        } catch (error) {
            console.log(error)
            console.log('me caí acá')
        }
    }


    public async obtenerPreguntasImplementadas() {
        const preguntasImplementadas = await this._databaseService.preguntasImplementadasInformeEvaluacion.findMany({
            include: {
                pregunta: {
                    include: {
                        dimension: true,
                    }
                }
            }
        });

        return preguntasImplementadas;
    }

    async obtenerResultados(id_informe: number) {
        const resultados = await this._databaseService.respuestasInformeEvaluacion.findMany({
            where: { informe_id: id_informe },
            include: {
                pregunta_implementada: {
                    include: {
                        pregunta: true,
                    },
                },
            },
        });

        if (!resultados || resultados.length === 0) {
            throw new BadRequestException('No se encontraron resultados para este informe evaluativo.');
        }

        return resultados.map(res => ({
            respuesta_texto: res.respuesta_texto,
            pregunta: res.pregunta_implementada.pregunta.enunciado_pregunta,
        }));
    }

    async asociarPreguntasInforme(preguntas: AsignarPreguntaDto[]) {
        if (!Array.isArray(preguntas) || preguntas.length === 0) {
            throw new BadRequestException('Debe proporcionar al menos una pregunta para asociar.');
        }

        try {
            // Preparar datos para insertar
            const datosParaInsertar = preguntas.map((pregunta) => ({
                id_pregunta: pregunta.id_pregunta,
            }));

            // Insertar las preguntas en la tabla de preguntas implementadas
            const resultado = await this._databaseService.preguntasImplementadasInformeEvaluacion.createMany({
                data: datosParaInsertar,
                skipDuplicates: true, // Evita errores si ya existe una asignación duplicada
            });

            return {
                message: `${resultado.count} pregunta(s) asociada(s) exitosamente al informe evaluativo.`,
                status: 200,
            };
        } catch (error) {
            console.error('Error al asociar preguntas al informe:', error);
            throw new BadRequestException('Hubo un error al asociar las preguntas al informe.');
        }
    }

}
