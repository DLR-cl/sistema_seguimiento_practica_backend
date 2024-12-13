import { Decimal } from "@prisma/client/runtime/library";
import { IsArray, IsDecimal, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateRespuestaInformConfidencialDto {
    @IsNotEmpty()
    @IsNumber()
    id_informe: number;

    @IsNotEmpty()
    @IsNumber()
    id_pregunta: number;

    @IsOptional()
    @IsString()
    respuesta_texto?: string;

    @IsOptional()
    @IsNumber()
    puntos?: number;
}