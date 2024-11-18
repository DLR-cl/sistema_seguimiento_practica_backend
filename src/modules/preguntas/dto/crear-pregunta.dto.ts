import { Tipo_pregunta } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CrearPreguntaDto {

    @IsNotEmpty()
    @IsNumber()
    id_informe: number;

    @IsNotEmpty()
    @IsString()
    enunciado_pregunta: string;

    @IsEnum(Tipo_pregunta)
    @IsNotEmpty()
    tipo_pregunta: Tipo_pregunta

    @IsNotEmpty()
    @IsNumber()
    id_dimension: number;

}