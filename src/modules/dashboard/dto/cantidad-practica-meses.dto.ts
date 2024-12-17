import { TipoPractica } from "@prisma/client";
import { IsNotEmpty, IsNumber, Min } from "class-validator";

export class CantidadPracticaPorMesesDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(2019)
    year: number;
}

export interface CantidadPractica {
    mes_inicio?: string;
    tipo_practica?: string;
    total_practica?: BigInt | number;
}