import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database/database.service';
import { obtenerTamanoEmpresas } from '@prisma/client/sql';
import { DatosEmpresasTamano, RespuestaConfidencial } from '../interface/dashboard.interface';
import { TipoPractica } from '@prisma/client';

@Injectable()
export class AnaliticaService {

    constructor(
        private readonly _databaseService: DatabaseService,
    ) { }

    async obtenerTotalHistoricoRespuestasInformeEvaluacion() {
        // Obtener todas las respuestas y los nombres de las preguntas
        const respuestas = await this._databaseService.preguntasImplementadasInformeEvaluacion.findMany({
            include: {
                respuestas: true, // Suponiendo que 'respuestas' es un array relacionado
                pregunta: true,   // Incluye el modelo relacionado 'pregunta'
            },
        });

        // Agrupar las respuestas por el nombre de la pregunta y contar cada tipo
        const resultado = respuestas.reduce((acc, item) => {
            const nombrePregunta = item.pregunta?.enunciado_pregunta || 'Pregunta desconocida';

            // Si las respuestas son un array, procesarlas
            item.respuestas.forEach((respuestaItem) => {
                const respuesta = respuestaItem.respuesta_texto; // Ajusta según la estructura de 'respuesta'

                if (!acc[nombrePregunta]) {
                    acc[nombrePregunta] = {
                        Total: 0,
                        Suficiente: 0,
                        Deficiente: 0,
                        Regular: 0,
                    };
                }

                // Incrementar el contador correspondiente
                acc[nombrePregunta][respuesta] = (acc[nombrePregunta][respuesta] || 0) + 1;
            });

            return acc;
        }, {});

        return resultado;
    }

    async obtenerIntervalo(id_academico: number, fecha_ini: Date, fecha_fin: Date) {
        const informes = await this._databaseService.informeEvaluacionAcademicos.findMany({
            where: {
                id_academico: id_academico,
                fecha_revision: {
                    gte: fecha_ini,
                    lte: fecha_fin,
                },
            },
            include: {
                respuestas: {
                    include: {
                        pregunta_implementada: {
                            include: {
                                pregunta: true,
                            },
                        },
                    },
                },
            },
        });

        // Inicializar el resultado
        const resultado = {};

        // Iterar sobre los informes y contabilizar las respuestas
        informes.forEach((informe) => {
            informe.respuestas.forEach((respuesta) => {
                const pregunta = respuesta.pregunta_implementada.pregunta?.enunciado_pregunta || 'Pregunta desconocida';
                const tipoRespuesta = respuesta.respuesta_texto; // Cambiar si el campo tiene otro nombre

                if (!resultado[pregunta]) {
                    resultado[pregunta] = {
                        Total: 0,
                        Suficiente: 0,
                        Deficiente: 0,
                        Regular: 0,
                    };
                }

                // Incrementar el contador del tipo de respuesta
                if (resultado[pregunta][tipoRespuesta] !== undefined) {
                    resultado[pregunta][tipoRespuesta]++;
                } else {
                    console.warn(`Tipo de respuesta desconocido: ${tipoRespuesta}`);
                }
            });
        });

        return resultado;
    }




    async obtenerCantidadTipoEmpresa() {
        const empresasPrivadas = await this._databaseService.empresas.count({
            where: { caracter_empresa: "PRIVADA" }
        });

        const empresasPublicas = await this._databaseService.empresas.count({
            where: { caracter_empresa: "PUBLICA" }
        })


        return {
            privada: empresasPrivadas,
            publica: empresasPublicas
        };
    }

    async obtenerRespuestasHistoricasByDimensionConfidencial(id_dimension: number) {
        const respuestas = await this._databaseService.dimensionesEvaluativas.findUnique({
            where: { id_dimension },
            include: {
                lista_preguntas: {
                    include: {
                        preguntas_implementadas_confidencial: {
                            include: { respuesta: true }
                        }
                    }
                }
            }
        });

        if (!respuestas) {
            throw new Error(`No se encontraron respuestas para la dimensión con ID ${id_dimension}`);
        }

        // Tipos de preguntas que pueden estar presentes
        const tiposPreguntasProcesar = ['CERRADA', 'HABILIDADES_TECNICAS', 'VINCULACION_MEDIO', 'SALARIO_ESTIMADO'];

        // Filtrar preguntas por tipo
        const preguntasFiltradas = respuestas.lista_preguntas.filter((pregunta) =>
            tiposPreguntasProcesar.includes(pregunta.tipo_pregunta)
        );

        // Contenedores para los conteos
        const conteoCerradas: Record<number, number> = {};
        const conteoHabilidadesTecnicas: Record<string, number> = {};
        const conteoVinculacionMedio: Record<string, number> = {};
        const conteoSalarioEstimado: Record<string, number> = {};

        // Procesar respuestas según el tipo de pregunta
        preguntasFiltradas.forEach((pregunta) => {
            const respuestas = pregunta.preguntas_implementadas_confidencial.respuesta;

            if (pregunta.tipo_pregunta === 'CERRADA') {
                respuestas.forEach((respuesta) => {
                    const valor = respuesta.puntos;
                    if (valor) {
                        conteoCerradas[valor] = (conteoCerradas[valor] || 0) + 1;
                    }
                });
            } else if (pregunta.tipo_pregunta === 'HABILIDADES_TECNICAS') {
                respuestas.forEach((respuesta) => {
                    const valor = respuesta.respuesta_texto?.toUpperCase(); // Normalizar a mayúsculas
                    if (valor) {
                        conteoHabilidadesTecnicas[valor] = (conteoHabilidadesTecnicas[valor] || 0) + 1;
                    }
                });
            } else if (pregunta.tipo_pregunta === 'VINCULACION_MEDIO') {
                respuestas.forEach((respuesta) => {
                    const valor = respuesta.respuesta_texto?.toUpperCase(); // Normalizar a mayúsculas
                    if (valor) {
                        conteoVinculacionMedio[valor] = (conteoVinculacionMedio[valor] || 0) + 1;
                    }
                });
            } else if (pregunta.tipo_pregunta === 'SALARIO_ESTIMADO') {
                respuestas.forEach((respuesta) => {
                    const valor = respuesta.respuesta_texto?.toUpperCase(); // Normalizar a mayúsculas
                    if (valor) {
                        conteoSalarioEstimado[valor] = (conteoSalarioEstimado[valor] || 0) + 1;
                    }
                });
            }
        });

        // Resultado final
        return {
            conteoCerradas,
            conteoHabilidadesTecnicas,
            conteoVinculacionMedio,
            conteoSalarioEstimado,
        };
    }

    async obtenerRespuestasFechasByDimensionConfidencial(id_dimension: number, fecha_ini: Date, fecha_fin: Date) {
        const respuestas = await this._databaseService.dimensionesEvaluativas.findUnique({
            where: { id_dimension },
            include: {
                lista_preguntas: {
                    include: {
                        preguntas_implementadas_confidencial: {
                            include: {
                                respuesta: {
                                    include: {
                                        informe: true // Incluimos el informe para acceder a las fechas
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!respuestas) {
            throw new Error(`No se encontraron respuestas para la dimensión con ID ${id_dimension}`);
        }

        // Tipos de preguntas que pueden estar presentes
        const tiposPreguntasProcesar = ['CERRADA', 'HABILIDADES_TECNICAS', 'VINCULACION_MEDIO', 'SALARIO_ESTIMADO'];

        // Filtrar preguntas por tipo
        const preguntasFiltradas = respuestas.lista_preguntas.filter((pregunta) =>
            tiposPreguntasProcesar.includes(pregunta.tipo_pregunta)
        );

        // Contenedores para los conteos
        const conteoCerradas: Record<number, number> = {};
        const conteoHabilidadesTecnicas: Record<string, number> = {};
        const conteoVinculacionMedio: Record<string, number> = {};
        const conteoSalarioEstimado: Record<string, number> = {};

        // Procesar respuestas según el tipo de pregunta
        preguntasFiltradas.forEach((pregunta) => {
            // Filtrar respuestas por rango de fechas
            const respuestasValidas = pregunta.preguntas_implementadas_confidencial.respuesta.filter((respuesta) => {
                const fecha = respuesta.informe.fecha_inicio_revision || respuesta.informe.fecha_inicio;
                return fecha >= fecha_ini && fecha <= fecha_fin; // Validar rango de fechas
            });

            // Procesar las respuestas válidas según el tipo de pregunta
            if (pregunta.tipo_pregunta === 'CERRADA') {
                respuestasValidas.forEach((respuesta) => {
                    const valor = respuesta.puntos;
                    if (valor) {
                        conteoCerradas[valor] = (conteoCerradas[valor] || 0) + 1;
                    }
                });
            } else if (pregunta.tipo_pregunta === 'HABILIDADES_TECNICAS') {
                respuestasValidas.forEach((respuesta) => {
                    const valor = respuesta.respuesta_texto?.toUpperCase(); // Normalizar a mayúsculas
                    if (valor) {
                        conteoHabilidadesTecnicas[valor] = (conteoHabilidadesTecnicas[valor] || 0) + 1;
                    }
                });
            } else if (pregunta.tipo_pregunta === 'VINCULACION_MEDIO') {
                respuestasValidas.forEach((respuesta) => {
                    const valor = respuesta.respuesta_texto?.toUpperCase(); // Normalizar a mayúsculas
                    if (valor) {
                        conteoVinculacionMedio[valor] = (conteoVinculacionMedio[valor] || 0) + 1;
                    }
                });
            } else if (pregunta.tipo_pregunta === 'SALARIO_ESTIMADO') {
                respuestasValidas.forEach((respuesta) => {
                    const valor = respuesta.respuesta_texto?.toUpperCase(); // Normalizar a mayúsculas
                    if (valor) {
                        conteoSalarioEstimado[valor] = (conteoSalarioEstimado[valor] || 0) + 1;
                    }
                });
            }
        });

        // Resultado final
        return {
            conteoCerradas,
            conteoHabilidadesTecnicas,
            conteoVinculacionMedio,
            conteoSalarioEstimado,
        };
    }



    async obtenerDatosGeneralEmpresas() {
        const datosEmpresas = await this._databaseService.$queryRawTyped<DatosEmpresasTamano>(obtenerTamanoEmpresas());
        const datosConvertidos = datosEmpresas.map((dato) => ({
            ...dato,
            total: Number(dato.total) // Convertir BigInt a number
        }));

        return datosConvertidos;
    }



    async obtenerTotalRespuestasPorPeriodoYPractica(
        practica: TipoPractica,
        fecha_ini: Date,
        fecha_fin: Date,
    ) {
        // Obtener todas las respuestas dentro del intervalo de fechas y tipo de práctica
        const respuestas = await this._databaseService.preguntasImplementadasInformeEvaluacion.findMany({
            where: {
                respuestas: {
                    some: {
                        informe_evaluacion: {
                            fecha_revision: {
                                gte: fecha_ini,
                                lte: fecha_fin,
                            },
                            informe_confidencial: {
                                practica: {
                                    tipo_practica: practica,
                                },
                            },
                        },
                    },
                },
            },
            include: {
                respuestas: {
                    include: {
                        informe_evaluacion: true,
                    },
                },
                pregunta: true,
            },
        });
    
        // Agrupar las respuestas por el nombre de la pregunta y contar cada tipo
        const resultado = respuestas.reduce((acc, item) => {
            const nombrePregunta = item.pregunta?.enunciado_pregunta || 'Pregunta desconocida';
    
            item.respuestas.forEach((respuestaItem) => {
                const respuesta = respuestaItem.respuesta_texto || 'Sin respuesta';
    
                if (!acc[nombrePregunta]) {
                    acc[nombrePregunta] = {
                        Total: 0,
                        Suficiente: 0,
                        Deficiente: 0,
                        Regular: 0,
                    };
                }
    
                // Incrementar el contador correspondiente
                acc[nombrePregunta][respuesta] = (acc[nombrePregunta][respuesta] || 0) + 1;
                acc[nombrePregunta].Total += 1; // Incrementar el total general
            });
    
            return acc;
        }, {});
    
        return resultado;
    }



    // async obtenerRespuestasConfidencialesPorPeriodoYPractica(
    //     fecha_ini: Date,
    //     fecha_fin: Date,
    //     tipoPractica: TipoPractica,
    // ) {
    //     // Realizar la consulta a Prisma
    //     const respuestas = await this._databaseService.dimensionesEvaluativas.findMany({
    //         where: {
    //             lista_preguntas: {
    //                 some: {
    //                     preguntas_implementadas_confidencial: {
    //                         respuesta: {
    //                             some: {
    //                                 informe: {
    //                                     // CAMBIAR POR FECHA DE ENVIO
    //                                     fecha_termino_revision: {
    //                                         gte: fecha_ini, // Mayor o igual a la fecha inicial
    //                                         lte: fecha_fin, // Menor o igual a la fecha final
    //                                     },
    //                                     practica: {
    //                                         tipo_practica: tipoPractica, // Filtrar por tipo de práctica
    //                                     },
    //                                 },
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         },
    //         include: {
    //             lista_preguntas: {
    //                 include: {
    //                     preguntas_implementadas_confidencial: {
    //                         include: { respuesta: true },
    //                     },
    //                 },
    //             },
    //         },
    //     });
    //     console.log(respuestas);
    //     if (!respuestas || respuestas.length === 0) {
    //         throw new Error(
    //             `No se encontraron respuestas confidenciales para el periodo ${fecha_ini} - ${fecha_fin} y la práctica ${tipoPractica}`,
    //         );
    //     }
    
    //     // Tipos de preguntas a procesar
    //     const tiposPreguntasProcesar = ['CERRADA', 'HABILIDADES_TECNICAS', 'VINCULACION_MEDIO', 'SALARIO_ESTIMADO'];
    
    //     // Contenedores para los conteos
    //     const conteoCerradas: Record<number, number> = {};
    //     const conteoHabilidadesTecnicas: Record<string, number> = {};
    //     const conteoVinculacionMedio: Record<string, number> = {};
    //     const conteoSalarioEstimado: Record<string, number> = {};
    
    //     // Procesar las respuestas según el tipo de pregunta
    //     respuestas.forEach((dimension) => {
    //         dimension.lista_preguntas.forEach((pregunta) => {
    //             if (tiposPreguntasProcesar.includes(pregunta.tipo_pregunta)) {
    //                 const respuestasConfidenciales =
    //                     pregunta.preguntas_implementadas_confidencial?.respuesta || [];
    
    //                 if (pregunta.tipo_pregunta === 'CERRADA') {
    //                     respuestasConfidenciales.forEach((respuesta) => {
    //                         const valor = respuesta.puntos;
    //                         if (valor) {
    //                             conteoCerradas[valor] = (conteoCerradas[valor] || 0) + 1;
    //                         }
    //                     });
    //                 } else if (pregunta.tipo_pregunta === 'HABILIDADES_TECNICAS') {
    //                     respuestasConfidenciales.forEach((respuesta) => {
    //                         const valor = respuesta.respuesta_texto?.toUpperCase(); // Normalizar a mayúsculas
    //                         if (valor) {
    //                             conteoHabilidadesTecnicas[valor] =
    //                                 (conteoHabilidadesTecnicas[valor] || 0) + 1;
    //                         }
    //                     });
    //                 } else if (pregunta.tipo_pregunta === 'VINCULACION_MEDIO') {
    //                     respuestasConfidenciales.forEach((respuesta) => {
    //                         const valor = respuesta.respuesta_texto?.toUpperCase();
    //                         if (valor) {
    //                             conteoVinculacionMedio[valor] =
    //                                 (conteoVinculacionMedio[valor] || 0) + 1;
    //                         }
    //                     });
    //                 } else if (pregunta.tipo_pregunta === 'SALARIO_ESTIMADO') {
    //                     respuestasConfidenciales.forEach((respuesta) => {
    //                         const valor = respuesta.respuesta_texto?.toUpperCase();
    //                         if (valor) {
    //                             conteoSalarioEstimado[valor] =
    //                                 (conteoSalarioEstimado[valor] || 0) + 1;
    //                         }
    //                     });
    //                 }
    //             }
    //         });
    //     });
    
    //     // Retornar los conteos finales
    //     return {
    //         conteoCerradas,
    //         conteoHabilidadesTecnicas,
    //         conteoVinculacionMedio,
    //         conteoSalarioEstimado,
    //     };
    // }
    
    async obtenerRespuestasConfidencialesPorPeriodoYPractica(
        fecha_ini: Date,
        fecha_fin: Date,
        tipoPractica: TipoPractica,
    ): Promise<RespuestaConfidencial[]> {
        // Realizar la consulta a Prisma
        const respuestas = await this._databaseService.dimensionesEvaluativas.findMany({
            where: {
                lista_preguntas: {
                    some: {
                        preguntas_implementadas_confidencial: {
                            respuesta: {
                                some: {
                                    informe: {
                                        fecha_envio: {
                                            gte: fecha_ini, // Mayor o igual a la fecha inicial
                                            lte: fecha_fin, // Menor o igual a la fecha final
                                        },
                                        practica: {
                                            tipo_practica: tipoPractica, // Filtrar por tipo de práctica
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            include: {
                lista_preguntas: {
                    include: {
                        preguntas_implementadas_confidencial: {
                            include: { respuesta: true },
                        },
                    },
                },
            },
        });
    
        // Si no hay respuestas, retornar un arreglo vacío
        if (!respuestas || respuestas.length === 0) {
            return [];
        }
    
        // Tipos de preguntas a procesar
        const tiposPreguntasProcesar = ['CERRADA', 'HABILIDADES_TECNICAS', 'VINCULACION_MEDIO', 'SALARIO_ESTIMADO'];
    
        // Resultado final con preguntas y respuestas
        const resultado: RespuestaConfidencial[] = [];
    
        // Escala Likert
        const getLikertText = (value: number): string => {
            switch (value) {
                case 1: return 'Muy en desacuerdo';
                case 2: return 'En desacuerdo';
                case 3: return 'Neutral';
                case 4: return 'De acuerdo';
                case 5: return 'Muy de acuerdo';
                default: return '';
            }
        };
    
        // Procesar las preguntas y respuestas
        respuestas.forEach((dimension) => {
            dimension.lista_preguntas.forEach((pregunta) => {
                if (tiposPreguntasProcesar.includes(pregunta.tipo_pregunta)) {
                    const respuestasConfidenciales =
                        pregunta.preguntas_implementadas_confidencial?.respuesta || [];
    
                    if (pregunta.tipo_pregunta === 'CERRADA') {
                        // Generar escala Likert del 1 al 5
                        const escalaLikert = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                        respuestasConfidenciales.forEach((respuesta) => {
                            const valor = respuesta.puntos;
                            if (valor && escalaLikert[valor] !== undefined) {
                                escalaLikert[valor]++;
                            }
                        });
    
                        // Mapear a texto
                        const respuestasMapeadas = Object.entries(escalaLikert).reduce((acc, [key, count]) => {
                            const texto = getLikertText(Number(key));
                            if (texto) {
                                acc[texto] = count;
                            }
                            return acc;
                        }, {});
    
                        // Agregar al resultado
                        resultado.push({
                            tipo: 'CERRADA',
                            pregunta: pregunta.enunciado_pregunta,
                            respuestas: respuestasMapeadas,
                        });
                    } else {
                        // Contabilizar respuestas para preguntas de texto
                        const conteoRespuestas = respuestasConfidenciales.reduce((acc, respuesta) => {
                            const texto = respuesta.respuesta_texto?.toUpperCase() || 'SIN RESPUESTA';
                            acc[texto] = (acc[texto] || 0) + 1;
                            return acc;
                        }, {});
    
                        resultado.push({
                            tipo: pregunta.tipo_pregunta,
                            pregunta: pregunta.enunciado_pregunta,
                            respuestas: conteoRespuestas,
                        });
                    }
                }
            });
        });
    
        // Retornar preguntas y respuestas
        return resultado;
    }
    
    
    
}
