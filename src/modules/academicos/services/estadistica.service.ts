import { Injectable } from '@nestjs/common';
import { Estado_informe, Estado_practica, TipoPractica } from '@prisma/client';
import { DatabaseService } from '../../../database/database/database.service';

@Injectable()
export class EstadisticaService {

    constructor(
        private readonly _databaseService: DatabaseService
    ) { }


    async cantidadReprobadosAprobadosPorAcademico(id_academico: number) {
        const resultados = await this._databaseService.informesAlumno.groupBy({
            by: ['estado'],
            where: {
                id_academico: id_academico,
                estado: { in: [Estado_informe.APROBADA, Estado_informe.DESAPROBADA] },
            },
            _count: {
                estado: true,
            },
        });

        // Transformar el resultado en un objeto más claro
        const resumen = resultados.reduce(
            (acc, item) => {
                if (item.estado === Estado_informe.APROBADA) {
                    acc.aprobados = item._count.estado;
                } else if (item.estado === Estado_informe.DESAPROBADA) {
                    acc.reprobados = item._count.estado;
                }
                return acc;
            },
            { aprobados: 0, reprobados: 0 }, // Valores iniciales
        );

        return resumen;
    }
    public async obtenerConteoInformesAcademicosPorPractica(
        fecha_in: Date,
        fecha_fin: Date,
        tipo_practica: TipoPractica // PRACTICA_UNO o PRACTICA_DOS
    ) {
        try {
            // Obtiene los académicos con sus respectivos informes agrupados
            const conteoPorAcademico = await this._databaseService.informesAlumno.groupBy({
                by: ['id_academico'],
                where: {
                    fecha_inicio_revision: {
                        gte: fecha_in, // Fecha de inicio de la revisión mayor o igual al límite inferior
                    },
                    fecha_termino_revision: {
                        lte: fecha_fin, // Fecha de término de la revisión menor o igual al límite superior
                    },
                    practica: {
                        tipo_practica: tipo_practica, // Filtra por tipo de práctica
                    },
                },
            });

            // Procesa los datos de cada académico
            const resultados = await Promise.all(
                conteoPorAcademico.map(async (conteo) => {
                    // Obtiene el nombre y correo del académico
                    const academico = await this._databaseService.academico.findUnique({
                        where: {
                            id_user: conteo.id_academico,
                        },
                        select: {
                            usuario: {
                                select: {
                                    nombre: true,
                                    correo: true,
                                },
                            },
                        },
                    });

                    // Conteo de informes aprobados
                    const aprobados = await this._databaseService.informesAlumno.count({
                        where: {
                            id_academico: conteo.id_academico,
                            estado: 'APROBADA', // Estado aprobado
                            fecha_inicio_revision: {
                                gte: fecha_in, // Fecha dentro del rango
                            },
                            fecha_termino_revision: {
                                lte: fecha_fin, // Fecha dentro del rango
                            },
                            practica: {
                                tipo_practica: tipo_practica, // Filtra por tipo de práctica
                            },
                        },
                    });

                    // Conteo de informes reprobados
                    const reprobados = await this._databaseService.informesAlumno.count({
                        where: {
                            id_academico: conteo.id_academico,
                            estado: 'DESAPROBADA', // Estado reprobado
                            fecha_inicio_revision: {
                                gte: fecha_in, // Fecha dentro del rango
                            },
                            fecha_termino_revision: {
                                lte: fecha_fin, // Fecha dentro del rango
                            },
                            practica: {
                                tipo_practica: tipo_practica, // Filtra por tipo de práctica
                            },
                        },
                    });

                    // Retorna los resultados en el formato solicitado
                    return {
                        nombre_academico: academico?.usuario?.nombre || 'Sin nombre',
                        correo_academico: academico?.usuario?.correo || 'Sin correo',
                        cantidad_informes_aprobados: aprobados,
                        cantidad_informes_reprobados: reprobados,
                    };
                })
            );

            // Retorna el resultado final
            return resultados;
        } catch (error) {
            console.error('Error al obtener conteo de informes académicos:', error);
            throw error;
        }
    }


}
