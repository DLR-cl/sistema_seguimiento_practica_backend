import { Estado_informe, TipoPractica } from '@prisma/client';
import { IsEnum, IsISO8601, IsNotEmpty } from 'class-validator';

export class GenerarReporteSemestralDto {
    @IsNotEmpty()
    @IsEnum(TipoPractica, { message: 'El tipo de práctica no es válido' })
    practica: TipoPractica;

    @IsNotEmpty()
    @IsISO8601()
    fecha_in: string;

    @IsNotEmpty()
    @IsISO8601()
    fecha_fin: string;
}
