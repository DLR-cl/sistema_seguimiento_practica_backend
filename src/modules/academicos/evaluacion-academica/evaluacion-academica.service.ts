import { BadRequestException, Body, HttpStatus, Injectable, Post } from '@nestjs/common';
import { InformeEvaluativoDto, RespuestasInformeEvaluativo } from '../dto/informe-evaluativo.dto';
import { DatabaseService } from '../../../database/database/database.service';
import { Estado_informe, Estado_practica, Prisma, TipoPractica } from '@prisma/client';
import { AsignarPreguntaDto } from '../../../modules/preguntas-implementadas-informe-alumno/dto/asignar-preguntas.dto';

@Injectable()
export class EvaluacionAcademicaService {

    constructor(
        private readonly _databaseService: DatabaseService,
    ) { }


    async crearInformeEvaluacionAcademicos(informe: InformeEvaluativoDto) {
        if (!informe.respuestas || informe.respuestas.length === 0) {
            throw new BadRequestException('El informe evaluativo debe incluir respuestas.');
        }
    
        return this._databaseService.$transaction(async (prisma) => {
            const informe_alumno = await prisma.informesAlumno.findUnique({
                where: { id_informe: informe.id_informe_alumno },
                include: { practica: true, respuestas: true },
            });
    
            if (!informe_alumno) {
                throw new BadRequestException('No se encuentra el informe del alumno disponible');
            }
    
            if (informe_alumno.estado !== Estado_informe.REVISION) {
                throw new BadRequestException('El informe no está en estado de revisión');
            }
    
            const respuestasDeficientes = informe.respuestas.some(
                (respuesta) => respuesta.respuesta_texto.toUpperCase() === "DEFICIENTE",
            );
            
            if (respuestasDeficientes) {
                const intentosRestantes = informe_alumno.intentos - 1;
    
                if (intentosRestantes > 0) {
                    await prisma.informesAlumno.update({
                        where: { id_informe: informe.id_informe_alumno },
                        data: { estado: Estado_informe.CORRECCION, intentos: intentosRestantes },
                    });

                    await prisma.practicas.update({
                        where: { id_practica: informe_alumno.id_practica },
                        data: { estado: Estado_practica.REVISION_GENERAL },
                    })
                } else {
                    await prisma.informesAlumno.update({
                        where: { id_informe: informe.id_informe_alumno },
                        data: { estado: Estado_informe.DESAPROBADA },
                    });
    
                    const practica = await prisma.practicas.update({
                        where: { id_practica: informe_alumno.id_practica },
                        data: { estado: Estado_practica.FINALIZADA },
                    });
                    await this._databaseService.informeConfidencial.update({
                        where: { id_informe_confidencial: informe.id_informe_confidencial},
                        data: { estado: Estado_informe.APROBADA }
                    })
                    // se desactiva la practica del alumno (el )
                    if(practica.tipo_practica == TipoPractica.PRACTICA_UNO){
                        await prisma.alumnosPractica.update({
                            where: { id_user: informe_alumno.id_alumno },
                            data: { segunda_practica: false }
                        });
                    }else {
                        await prisma.alumnosPractica.update({
                            where: { id_user: informe_alumno.id_alumno },
                            data: { primer_practica: false }
                        })
                    }
                }
    
                return {
                    message: 'El informe tiene respuestas deficientes. Informe actualizado.',
                    status: HttpStatus.OK,
                };
            }
    
            const informeEvaluativo = await prisma.informeEvaluacionAcademicos.create({
                data: {
                    id_academico: informe.id_academico,
                    id_informe_alumno: informe.id_informe_alumno,
                    id_informe_confidencial: informe.id_informe_confidencial,
                    fecha_revision: informe.fecha_revision,
                },
            });
    
            informe.respuestas.forEach((res) => (res.informe_id = informeEvaluativo.id_informe));
            await this.crearRespuestasInformeEvaluativo(prisma, informe.respuestas);
    
            await prisma.informesAlumno.update({
                where: { id_informe: informeEvaluativo.id_informe_alumno },
                data: { estado: Estado_informe.APROBADA },
            });
    
            await prisma.informeConfidencial.update({
                where: { id_informe_confidencial: informe.id_informe_confidencial },
                data: { estado: Estado_informe.APROBADA },
            });
    
            const practica = await prisma.practicas.update({
                where: { id_practica: informe_alumno.practica.id_practica },
                data: { estado: Estado_practica.FINALIZADA },
            });

            if(practica.tipo_practica == TipoPractica.PRACTICA_UNO){
                await prisma.alumnosPractica.update({
                    where: { id_user: informe_alumno.id_alumno },
                    data: { segunda_practica: false }
                });
            }else {
                await prisma.alumnosPractica.update({
                    where: { id_user: informe_alumno.id_alumno },
                    data: { primer_practica: false }
                })
            }
    
            return {
                message: 'Registro del informe exitoso',
                id_informe: informeEvaluativo.id_informe,
                status: HttpStatus.OK,
            };
        });
    }
    
    private async crearRespuestasInformeEvaluativo(prisma: Prisma.TransactionClient, respuestas: RespuestasInformeEvaluativo[]) {
        const respuestasInvalidas = respuestas.filter(
            (res) => !res.respuesta_texto || !res.pregunta_id,
        );
    
        if (respuestasInvalidas.length > 0) {
            throw new BadRequestException('Algunas respuestas no contienen los campos requeridos.');
        }
    
        return prisma.respuestasInformeEvaluacion.createMany({
            data: respuestas,
        });
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
