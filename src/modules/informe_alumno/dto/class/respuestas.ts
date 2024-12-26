import { Decimal } from "@prisma/client/runtime/library";
import { IsArray, IsDecimal, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateRespuestaInformAlumnoDto {
    @IsNotEmpty()
    @IsNumber()
    id_informe: number;

    @IsNotEmpty()
    @IsNumber()
    id_pregunta: number;

    @IsOptional()
    @IsString()
    texto?: string;

    @IsOptional()
    @IsNumber()
    puntaje?: number;

    @IsOptional()
    @IsDecimal()
    nota?: Decimal;

    @IsOptional()
    @IsArray()
    asignaturas?: string[];
}