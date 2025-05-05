import { Estado_informe, TipoPractica } from "@prisma/client";

export interface DataAprobacionPracticas {
    tipo_practica: TipoPractica;
    informe_alumno: {
        estado: Estado_informe,
    }
}

