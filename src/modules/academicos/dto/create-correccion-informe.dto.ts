import { TipoPractica } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CrearInformeCorreccion {
    @IsNotEmpty()
    @IsNumber()
    id_informe_alumno: number;

    @IsNotEmpty()
    @IsNumber()
    id_informe_evaluativa: number;

    @IsNotEmpty()
    @IsNumber()
    id_academico: number;

    @IsNotEmpty()
    @IsString()
    nombre_alumno: string;

    @IsNotEmpty()
    @IsEnum(TipoPractica)
    tipo_practica: TipoPractica;
}