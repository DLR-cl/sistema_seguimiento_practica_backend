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

        const prisma = new PrismaClient({
            log: ['query', 'info', 'warn', 'error'],
        });
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
            return respuesta; // Detiene la ejecución si hay respuestas deficientes
        }

        // Registrar el informe evaluativo
        const informeEvaluativo = await this.registrarInformeEvaluativo(informe);


        // Registrar respuestas
        if (!informeEvaluativo) {
            throw new BadRequestException('No existe informe evaluativo o no se creo correctamente');
        }
        await this.crearRespuestasInformeEvaluativo(informe.respuestas, informeEvaluativo.id_informe);

        // Actualizar estados
        await this.actualizarEstados(informe, informeAlumno, informeEvaluativo);

        return {
            message: 'Registro del informe exitoso',
            id_informe: informeEvaluativo.id_informe,
            status: HttpStatus.OK,
        };
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
                await this._databaseService.informesAlumno.update({
                    where: { id_informe: informe.id_informe_alumno },
                    data: { estado: Estado_informe.CORRECCION, intentos: intentosRestantes },
                });

                await this._databaseService.practicas.update({
                    where: { id_practica: informeAlumno.id_practica },
                    data: { estado: Estado_practica.REVISION_GENERAL },
                });
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
            }

            return {
                message: 'El informe tiene respuestas deficientes. Informe actualizado.',
                status: HttpStatus.OK,
            };
        }

        return null; // Continua si no hay respuestas deficientes
    }
    async registrarInformeEvaluativo(
        informe: InformeEvaluativoDto,
    ): Promise<any> {
        // Verificar existencia de un informe asociado
        try {

            const informeExistente = await this._databaseService.informeEvaluacionAcademicos.findFirst({
                where: {
                    OR: [
                        { id_informe_alumno: informe.id_informe_alumno },
                        { id_informe_confidencial: informe.id_informe_confidencial },
                    ],
                },
            });

            if (informeExistente) {
                throw new ConflictException(
                    `Ya existe un informe evaluativo relacionado con el informe alumno ${informe.id_informe_alumno} o el informe confidencial ${informe.id_informe_confidencial}.`,
                );
            }

            // Crear el informe evaluativo
            const informeBase = await this._databaseService.informeEvaluacionAcademicos.create({
                data: {
                    id_academico: +informe.id_academico,
                    id_informe_confidencial: +informe.id_informe_confidencial,
                    fecha_revision: informe.fecha_revision,
                },
            });

            return this._databaseService.informeEvaluacionAcademicos.update({
                where: { id_informe: informeBase.id_informe },
                data: {
                    id_informe_alumno: +informe.id_informe_alumno,
                },
            });
            
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                console.log("hola soy un error inutil")
            }
        }
    }


    private async actualizarEstados(
        informe: InformeEvaluativoDto,
        informeAlumno: any,
        informeEvaluativo: any,
    ) {
        await this._databaseService.informesAlumno.update({
            where: { id_informe: +informeEvaluativo.id_informe_alumno },
            data: { estado: Estado_informe.APROBADA },
        });

        await this._databaseService.informeConfidencial.update({
            where: { id_informe_confidencial: +informe.id_informe_confidencial },
            data: { estado: Estado_informe.APROBADA },
        });

        await this._databaseService.practicas.update({
            where: { id_practica: +informeAlumno.practica.id_practica },
            data: { estado: Estado_practica.FINALIZADA },
        });
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
