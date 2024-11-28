import { Tipo_pregunta } from "@prisma/client";

export class responsePreguntas {
    id_pregunta: number;
    enunciado_pregunta: string;
    tipo_pregunta: Tipo_pregunta
}