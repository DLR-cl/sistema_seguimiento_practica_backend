import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database/database.service';

@Injectable()
export class AnaliticaService {

    constructor(
        private readonly _databaseService: DatabaseService,
    ){}

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

   
    
    

    async obtenerCantidadTipoEmpresa() {
        const empresasPrivadas = await this._databaseService.empresas.count({
            where: { caracter_empresa: "PRIVADA"}
        });

        const empresasPublicas = await this._databaseService.empresas.count({
            where: { caracter_empresa: "PUBLICA"}
        })
    
    
        return {
            privada: empresasPrivadas,
            publica: empresasPublicas
        };
    }
    
    
}
