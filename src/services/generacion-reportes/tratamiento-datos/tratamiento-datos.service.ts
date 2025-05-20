import { Injectable } from '@nestjs/common';
import { RecopilacionDatosService } from '../recopilacion-datos/informe-confidencial/recopilacion-datos-confidencial.service';
import { DimensionesEvaluativas, Estado_informe, Practicas, Preguntas, PreguntasImplementadasInformeConfidencial, RespuestasInformeConfidencial, TipoPractica } from '@prisma/client';
import { DataInformeConfidencial, ResultadosInformeConfidencial, ResultadosPregunta } from 'services/types/data-informe-confidencial.interface';
import { RespuestaConfidencial } from 'modules/dashboard/interface/dashboard.interface';
import { ResultadosPracticaService } from '../recopilacion-datos/resultados-practica/resultados-practica.service';
import { IConteoEmpresas, IConteoInformes, IDataResultadoPractica, IDataResultadoPracticaExcel } from 'services/types/data-resultado-practica.interface';
@Injectable()
export class TratamientoDatosService {


    constructor(
        private readonly _recopilacionDatosService: RecopilacionDatosService,
        private readonly _resultadosPracticaService: ResultadosPracticaService
    ) { }

    async tratarDatosInformeConfidencial(fechaInicio: Date, fechaFin: Date, tipoPractica: TipoPractica): Promise<ResultadosInformeConfidencial[]> {
        // Obtengo los datos  (id de informes según la fecha)
        const datos: DataInformeConfidencial[] = await this._recopilacionDatosService.obtenerIdsInformeConfidencial(fechaInicio, fechaFin, tipoPractica);

        // Procesar los datos: Buscar identificadores de informes
        const identificadores: number[] = datos.map(dato => dato.id_informe_confidencial);

        // Obtengo las respuestas de los informes
        const respuestas: RespuestasInformeConfidencial[] = await this._recopilacionDatosService.obtenerRespuestasInformeConfidencial(identificadores);
        
        // Busco los identificadores de las preguntas asociadas a las respuestas
        const preguntas_asociadas: number[] = respuestas.map(respuesta => respuesta.pregunta_id);

        // Obtengo las preguntas implementadas de los informes según los identificadores de las respuestas
        const preguntasImplementadas: PreguntasImplementadasInformeConfidencial[] = await this._recopilacionDatosService.obtenerPreguntasImplementadasInformeConfidencial(preguntas_asociadas);

        // Procesar las respuestas
        const identificadores_preguntas: number[] = preguntasImplementadas.map(pregunta => pregunta.id_pregunta);

        // Obtengo las preguntas según los identificadores de las preguntas
        const preguntas: Preguntas[] = await this._recopilacionDatosService.obtenerPreguntas(identificadores_preguntas);

        const dimensiones: DimensionesEvaluativas[] = await this._recopilacionDatosService.obtenerDimensionPreguntas();
        // unir las preguntas y las respuestas: Las respuestas pueden ser texto o puntos  ( busco todas las respuestas asociadas a cada pregunta )         
        const lista_respuestas: {
            respuesta: string | number;
            pregunta: string;
            dimension: string;
        }[] = respuestas.map(respuesta => {
            const preguntaEncontrada = preguntas.find(pregunta => pregunta.id_pregunta === respuesta.pregunta_id);
            const dimensionEncontrada = dimensiones.find(dimension => dimension.id_dimension === preguntaEncontrada?.id_dimension);
            return {
                respuesta: respuesta.respuesta_texto || respuesta.puntos,
                pregunta: preguntaEncontrada?.enunciado_pregunta || 'Pregunta no encontrada',
                dimension: dimensionEncontrada?.nombre || 'Dimension no encontrada'
            };
        });

        // Agrupar por dimensión y contabilizar las respuestas
        const respuestasPorDimension = lista_respuestas.reduce((acc, curr) => {
            if (!acc[curr.dimension]) {
                acc[curr.dimension] = {};
            }
            const key = `${curr.pregunta} - ${curr.respuesta}`;
            acc[curr.dimension][key] = (acc[curr.dimension][key] || 0) + 1;
            return acc;
        }, {} as Record<string, Record<string, number>>);

        // Transformar el resultado al formato deseado
        const objeto_devuelto: ResultadosInformeConfidencial[] = Object.entries(respuestasPorDimension).map(([dimension, respuestas]) => {
            const respuestasProcesadas: ResultadosPregunta[] = Object.entries(respuestas).map(([key, cantidad]) => {
                const [pregunta, respuesta] = key.split(' - ');
                const respuestaNumero = Number(respuesta);
                return {
                    pregunta,
                    respuesta: isNaN(respuestaNumero) ? respuesta : respuestaNumero,
                    cantidad
                };
            });

            return {
                dimension,
                respuestas: respuestasProcesadas
            };
        });
        return objeto_devuelto;
    }

 // Contabiliza los informes aprobados y reprobados
 async contarInformesPorEstado(resultadoPractica: IDataResultadoPractica[]): Promise<IConteoInformes> {
    
    const conteo: IConteoInformes = {
        aprobados: 0,
        reprobados: 0
    };

    resultadoPractica.forEach(practica => {
        if (practica.informe_alumno.estado === Estado_informe.APROBADA) {
            conteo.aprobados++;
        } else if (practica.informe_alumno.estado === Estado_informe.DESAPROBADA) {
            conteo.reprobados++;
        }
    });

    return conteo;
}

// Contabiliza los tipos de empresas por práctica
async contarEmpresasPorTipo(resultadoPractica: IDataResultadoPractica[]): Promise<IConteoEmpresas> {
    
    const conteo: IConteoEmpresas = {};

    resultadoPractica.forEach(practica => {
        const tipoEmpresa = practica.jefe_supervisor.empresa.caracter_empresa;
        if (tipoEmpresa) {
            conteo[tipoEmpresa] = (conteo[tipoEmpresa] || 0) + 1;
        }
    });

    return conteo;
}
    // informe Alumno
    async tratarDatosResultadosPractica(fechaInicio: Date, fechaFin: Date, tipoPractica: TipoPractica): Promise<IDataResultadoPracticaExcel> {
        const resultadoPractica: IDataResultadoPractica[] = await this._resultadosPracticaService.obtenerPracticas(tipoPractica, fechaInicio, fechaFin);
        const conteoInformes: IConteoInformes = await this.contarInformesPorEstado(resultadoPractica);
        const conteoEmpresas: IConteoEmpresas = await this.contarEmpresasPorTipo(resultadoPractica);
    
        return {
            conteoInformes,
            conteoEmpresas
        };
    }
}
