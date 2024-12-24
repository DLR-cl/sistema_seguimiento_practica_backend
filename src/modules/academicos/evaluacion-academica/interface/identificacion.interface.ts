import { TipoPractica } from "@prisma/client";

export interface IdentificacionInterface {
    nombre_alumno: string;
    tipo_practica: TipoPractica,
    nombre_empresa: string;
    profesor_revisor: string;
}