export interface EmpresaGroupByResult {
    _count: {
        caracter_empresa: number;
    };
    caracter_empresa: string;
}

export interface EmpresaTipoCantidad {
    [caracterEmpresa: string]: number; // Ejemplo: { PUBLICA: 1, PRIVADA: 2 }
}