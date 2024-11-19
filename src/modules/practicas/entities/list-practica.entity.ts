import { TipoPractica } from "@prisma/client";

export class InforPractica {
    id_practica: number;
    nombre_alumno: string;
    estado_entrega: boolean;
    tipo_practica: TipoPractica;

    
}

export class InformesPractica {
    informes_data: inforPractica[];
}