import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../database/database/database.service';
import { Practicas, TipoPractica } from '@prisma/client';

@Injectable()
export class ResultadoAcademicoDataService {

    constructor(
        private readonly _databaseService: DatabaseService
    ){}

    async obtenerPracticasFinalizadas(fechaInicio: Date, fechaFin: Date, tipoPractica: TipoPractica){
        const practicas = await this._databaseService.practicas.findMany({
            where: {
                fecha_termino: { gte: fechaInicio, lte: fechaFin },
                tipo_practica: tipoPractica
            },
            include: {
                informe_alumno: {
                    include: {
                        academico: {
                            include: {
                                usuario: true
                            },
                        },
                        informe_academico: true,
                        alumno: {
                            include: {
                                usuario: true
                            }
                        }
                    }
                },
                jefe_supervisor: {
                    include: {
                        empresa: true
                    }
                }
            }
        });
        return practicas;
    }

}
