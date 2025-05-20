import { Estado_informe, TipoPractica } from "@prisma/client";

export interface DataResultadosPracticas {
    rut: string;
    nombre: string;
    resultado_practica: Estado_informe;
    tipo_practica: TipoPractica;
}