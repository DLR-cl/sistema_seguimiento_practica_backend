import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';

@Injectable()
export class AnaliticaService {

    constructor(
        private readonly _databaseService: DatabaseService,
    ){}

    async obtenerTotalHistoricoRespuestasInformeAlumno() {
        // Obtener todas las respuestas y los nombres de las preguntas
        const respuestas = await this._databaseService.preguntasImplementadasInformeAlumno.findMany({
            select: {
                id_pregunta: true,
                respuestas: true,
                preguntas: {
                    select: {
                        enunciado_pregunta: true, // Trae el nombre de la pregunta relacionada
                    },
                },
            },
        });
    
        // Agrupar las respuestas por el nombre de la pregunta y contar cada tipo
        const resultado = respuestas.reduce((acc, item) => {
            const nombrePregunta = item.preguntas?.enunciado_pregunta || 'Pregunta desconocida';
            const respuesta = item.respuestas;
    
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
    
            return acc;
        }, {});
    
        return resultado;
    }
    
    async obtenerTotalHistoricoRespuestasInformeConfidencial(){
        
    }
}
