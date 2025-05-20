import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../database/database/database.service';
import { DimensionesEvaluativas, InformeEvaluacionAcademicos, InformesAlumno, Preguntas, PreguntasImplementadasInformeConfidencial, RespuestasInformeConfidencial, TipoPractica } from '@prisma/client';
import { DataInformeConfidencial } from '../../../types/data-informe-confidencial.interface';

@Injectable()
export class RecopilacionDatosService {
    constructor(
        private readonly _databaseService: DatabaseService
    ) { }

    async obtenerIdsInformeConfidencial(fechaInicio: Date, fechaFin: Date, tipoPractica: TipoPractica): Promise<DataInformeConfidencial[]> {
        return  await this._databaseService.informeConfidencial.findMany({
            select: {
                id_informe_confidencial: true,
            },
            where: {
                fecha_inicio: {
                    gte: fechaInicio,
                    lte: fechaFin
                },
                practica: {
                    tipo_practica: tipoPractica
                }
            },
        });

    } 

    async obtenerRespuestasInformeConfidencial(identificadores: number[]): Promise<RespuestasInformeConfidencial[]> {
        return this._databaseService.respuestasInformeConfidencial.findMany({
            where: {
                informe_id: {
                    in: identificadores
                }
            }
        });
    }

    async obtenerPreguntasImplementadasInformeConfidencial(identificadores: number[]): Promise<PreguntasImplementadasInformeConfidencial[]> {
        return this._databaseService.preguntasImplementadasInformeConfidencial.findMany({
            where: {
                id_pregunta: {
                    in: identificadores
                }
            }
        });
    }

    async obtenerPreguntas(identificadores: number[]): Promise<Preguntas[]> {
        return this._databaseService.preguntas.findMany({
            where: {
                id_pregunta: { in: identificadores }
            }
        });
    }

    async obtenerDimensionPreguntas(): Promise<DimensionesEvaluativas[]> {
        return this._databaseService.dimensionesEvaluativas.findMany({
        });
    }

    async obtenerRespuestasInformeAlumno(fechaInicio: Date, fechaFin: Date): Promise<InformesAlumno[]> {
        return this._databaseService.informesAlumno.findMany({
            where: {
                fecha_inicio: {
                    gte: fechaInicio,
                    lte: fechaFin
                }
            },
            include: {
                respuestas: true
            }
        });
    }

    async obtenerRespuestasInformeAcademico(fechaInicio: Date, fechaFin: Date): Promise<InformeEvaluacionAcademicos[]> {
        return this._databaseService.informeEvaluacionAcademicos.findMany({
            where: {
                fecha_revision: {
                    gte: fechaInicio,
                    lte: fechaFin
                }
            },
            include: {
                respuestas: true
            }
        });
    }

}
