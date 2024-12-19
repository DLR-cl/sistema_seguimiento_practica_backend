import { TipoPractica } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class InformeDto {

    @IsNotEmpty()
    @IsNumber()
    id_informe: number;

    @IsNotEmpty()
    @IsString()
    nombre_alumno: string;

    @IsNotEmpty()
    @IsNumber()
    id_alumno: number;

    @IsNotEmpty()
    @IsEnum(TipoPractica)
    tipo_practica: TipoPractica
}