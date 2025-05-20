import { RespuestasInformeConfidencial } from "@prisma/client";

export interface DataInformeConfidencial {
    id_informe_confidencial: number;
}

export interface ResultadosInformeConfidencial {
    dimension: string;
    respuestas: ResultadosPregunta[];
}

export interface ResultadosPregunta {
    pregunta: string;
    respuesta: string | number;
    cantidad: number;
}



