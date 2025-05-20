import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../../database/database/database.service';
import { DataEvaluacionInterface, ItemEvaluacionInterface } from '../../interface/data-evaluacion-academica.interface';
@Injectable()
export class DataGeneracionInformeService {

    constructor(
        private readonly _databaseService: DatabaseService
    ) { }

    async obtenerInformeEvaluacionPractica(idPractica: number) {

        const practica = await this._databaseService.practicas.findUnique({
            where: {
                id_practica: idPractica
            },
            include: {
                informe_alumno: {
                    include: {
                        informe_academico: {
                            include: {
                                respuestas: {
                                    include: {
                                        pregunta_implementada: {
                                            include: {
                                                pregunta: {
                                                    include: {
                                                        dimension: true
                                                    }
                                                },
                                            },
                                            
                                        }
                                    }
                                },
                                academico: {
                                    include: {
                                        usuario: true
                                    }
                                }
                            }
                        }
                    }
                },
                alumno: {
                    include: {
                        usuario: true
                    }
                },
                informe_confidencial: {
                    include: {
                        supervisor: {
                            include: {
                                usuario: true,
                                empresa: true
                            }
                        }
                    }
                }
            },
        })

        const dataEvaluacion: DataEvaluacionInterface = {
            nombre_alumno: practica.alumno.usuario.nombre,
            profesor_revisor: practica.informe_alumno.informe_academico.academico.usuario.nombre,
            fecha_revision: practica.informe_alumno.informe_academico.fecha_revision,
            tipo_practica: practica.tipo_practica,
            empresa: practica.informe_confidencial.supervisor.empresa.nombre_razon_social,
            respuestas: []
        }

        // Agrupar respuestas por dimensión
        const respuestasPorDimension = new Map<string, ItemEvaluacionInterface[]>();

        practica.informe_alumno.informe_academico.respuestas.forEach(respuesta => {
            const dimension = respuesta.pregunta_implementada.pregunta.dimension.nombre;
            const item: ItemEvaluacionInterface = {
                nombre_item: respuesta.pregunta_implementada.pregunta.enunciado_pregunta,
                respuesta: respuesta.respuesta_texto
            };

            if (!respuestasPorDimension.has(dimension)) {
                respuestasPorDimension.set(dimension, []);
            }
            respuestasPorDimension.get(dimension)?.push(item);
        });

        // Convertir el Map a la estructura requerida
        dataEvaluacion.respuestas = Array.from(respuestasPorDimension.entries()).map(([aspecto, items]) => ({
            aspecto,
            item: items
        }));
        // objeto necesita
        return dataEvaluacion;
    }

}