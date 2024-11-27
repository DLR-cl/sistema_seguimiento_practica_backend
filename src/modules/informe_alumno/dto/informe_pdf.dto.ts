import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class InformeDto {

    @IsNotEmpty()
    @IsNumber()
    id_informe: number;
}