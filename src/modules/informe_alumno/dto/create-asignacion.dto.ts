import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateAsignacionDto{
    @IsNotEmpty()
    @IsNumber()
    id_informe_alumno: number;

    @IsNotEmpty()
    @IsNumber()
    id_informe_confidencial: number;


    @IsNotEmpty()
    @IsNumber()
    id_academico: number;

    @IsNotEmpty()
    @IsNumber()
    id_practica: number;
}