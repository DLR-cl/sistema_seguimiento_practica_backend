import { IsDateString } from "class-validator";

import { IsNotEmpty } from "class-validator";

export class ReporteConfidencialDto {
    @IsNotEmpty()
    @IsDateString()
    fechaInicio: Date;

    @IsNotEmpty()
    @IsDateString()
    fechaFin: Date;
}