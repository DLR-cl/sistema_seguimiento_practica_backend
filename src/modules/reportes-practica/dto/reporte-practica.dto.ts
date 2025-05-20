import { TipoPractica } from "@prisma/client";
import { IsDateString, IsEnum, IsNotEmpty } from "class-validator";

export class ReportePracticaQueryDto {

    @IsNotEmpty()
    @IsDateString()
    fechaInicio: Date;

    @IsNotEmpty()
    @IsDateString()
    fechaFin: Date;
    
}