import { Injectable } from '@nestjs/common';
import { Estado_informe, Estado_practica, TipoPractica } from '@prisma/client';
import { DatabaseService } from 'database/database/database.service';
import type { EstadisticaAprobacionPorPractica } from 'modules/dashboard/interface/dashboard-estadistica.interface';
import type { DataAprobacionPracticas } from 'modules/dashboard/interface/data-estadistica-practicas.interface';

@Injectable()
export class DashboardEstadisticasPracticaService {
    constructor(
        private readonly _databaseService: DatabaseService,
    ) { }


    async obtenerEstadisticasAprobacionPorPractica(): Promise<EstadisticaAprobacionPorPractica>{
        try {
            const currentYear: number = new Date().getFullYear();
            const startOfYear = new Date(currentYear, 0, 1); // 1 de enero del año actual
            const endOfYear = new Date(currentYear, 11, 31); // 31 de diciembre del año actual

            const practicas: DataAprobacionPracticas[] = await this._databaseService.practicas.findMany({
                select: {
                    tipo_practica: true,
                    informe_alumno: { select: { estado: true, } }
                },
                where: {
                    estado: Estado_practica.FINALIZADA,
                    fecha_termino: { lte: endOfYear, },
                    fecha_inicio: { gte: startOfYear, },
                    NOT: [
                        { informe_alumno: null }, // Excluimos los casos donde informe_alumno es null 
                        {
                            informe_alumno: {
                                NOT: {
                                    estado: {
                                        in: [Estado_informe.APROBADA, Estado_informe.DESAPROBADA],
                                    },
                                },
                            },
                        },
                    ],
                }
            });

            return this.procesarEstadisticaPracticas(practicas);
        } catch (error) {

        }
    }

    private procesarEstadisticaPracticas(resultadosQuery: DataAprobacionPracticas[]): EstadisticaAprobacionPorPractica {
        const estadisticas: EstadisticaAprobacionPorPractica = {
            practica_uno: {
                aprobadas: 0,
                desaprobadas: 0,
            },
            practica_dos: {
                aprobadas: 0,
                desaprobadas: 0,
            },
        };

        // Procesar los resultados
        resultadosQuery.forEach((practica) => {
            const tipoPractica = practica.tipo_practica;
            const estadoInforme = practica.informe_alumno?.estado;

            if (tipoPractica === TipoPractica.PRACTICA_UNO) {
                if (estadoInforme === Estado_informe.APROBADA) {
                    estadisticas.practica_uno.aprobadas += 1;
                } else if (estadoInforme === Estado_informe.DESAPROBADA) {
                    estadisticas.practica_uno.desaprobadas += 1;
                }
            } else if (tipoPractica === TipoPractica.PRACTICA_DOS) {
                if (estadoInforme === Estado_informe.APROBADA) {
                    estadisticas.practica_dos.aprobadas += 1;
                } else if (estadoInforme === Estado_informe.DESAPROBADA) {
                    estadisticas.practica_dos.desaprobadas += 1;
                }
            }
        }
        );

        return estadisticas;
    }
}
