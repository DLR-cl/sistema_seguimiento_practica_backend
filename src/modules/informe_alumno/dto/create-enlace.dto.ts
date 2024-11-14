import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateEnlaceDto{
    @IsNotEmpty()
    @IsNumber()
    id_informe: number;

    @IsNotEmpty()
    @IsNumber()
    id_practica: number;
}