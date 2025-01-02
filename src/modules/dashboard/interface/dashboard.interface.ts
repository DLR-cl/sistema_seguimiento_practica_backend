export interface EmpresaGroupByResult {
    _count: {
        caracter_empresa: number;
    };
    caracter_empresa: string;
}

export interface EmpresaTipoCantidad {
    [caracterEmpresa: string]: number; // Ejemplo: { PUBLICA: 1, PRIVADA: 2 }
}

export interface DatosEmpresasTamano {
    tipo_empresa: String;
    tamano_categoria: String;
    total: BigInt;
}

export interface RespuestaConfidencial {
    tipo: string; // Tipo de pregunta (e.g., CERRADA, HABILIDADES_TECNICAS, etc.)
    pregunta: string; // Enunciado de la pregunta
    respuestas: Record<string, number>; // Respuestas donde la clave es el texto y el valor es el conteo
}

export type RespuestasConfidenciales = RespuestaConfidencial[];