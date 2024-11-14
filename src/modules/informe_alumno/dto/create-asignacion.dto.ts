import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateAsignacionDto{
    @IsNotEmpty()
    @IsNumber()
    id_informe: number;

    @IsNotEmpty()
    @IsNumber()
    id_academico: number;
}