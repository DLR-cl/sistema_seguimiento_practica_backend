import { Tipo_pregunta } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, min } from "class-validator";

export class CrearPreguntaDto {


    @IsNotEmpty()
    @IsString()
    enunciado_pregunta: string;

    @IsEnum(Tipo_pregunta)
    @IsNotEmpty()
    tipo_pregunta: Tipo_pregunta

    @IsNotEmpty()
    @IsNumber()
    id_dimension: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    puntaje_respuestas?: number;
    

}