export interface DataEvaluacionInterface {

    nombre_alumno: string;
    profesor_revisor: string;
    fecha_revision: Date;
    tipo_practica: string;
    empresa: string;

    respuestas: RespuestasEvaluacionInterface[];

}

export interface RespuestasEvaluacionInterface {
    aspecto: string; // Dimension
    item: ItemEvaluacionInterface[]; // Preguntas asociadas
}

export interface ItemEvaluacionInterface {
    nombre_item: string; // Pregunta
    respuesta: string; // Respuesta
}
