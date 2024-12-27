import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database/database.service';
import { obtenerTamanoEmpresas } from '@prisma/client/sql';
import { DatosEmpresasTamano } from '../interface/dashboard.interface';

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



}
