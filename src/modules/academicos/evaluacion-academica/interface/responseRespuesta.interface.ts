export interface FormatoRespuestaEvaluativaInterface {
    dimension: string;
    pregunta: string;
    respuesta: string;
}

export interface EvaluacionInforme {
    [pregunta: string]: {
        Total: number;
        Suficiente: number;
        Deficiente: number;
        Regular: number;
        Si?: number; // Campo opcional
    };
}

export interface RespuestaConfidencial {
    conteoCerradas: Record<number, number>; // Claves numéricas (por puntaje) y valores como cantidad
    conteoHabilidadesTecnicas: Record<string, number>; // Claves como texto y valores como cantidad
    conteoVinculacionMedio: Record<string, number>; // Claves como texto y valores como cantidad
    conteoSalarioEstimado: Record<string, number>; // Claves como texto y valores como cantidad
}

export interface PracticaResultado {
    aprobados: number; // Número de prácticas aprobadas
    reprobados: number; // Número de prácticas reprobadas
}

export interface ConteoPracticas {
    PRACTICA_UNO: PracticaResultado; // Resultados para PRACTICA_UNO
    PRACTICA_DOS: PracticaResultado; // Resultados para PRACTICA_DOS
}



