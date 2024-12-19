import { Estado_informe } from "@prisma/client";
import { IsEAN, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateInformeAlumnoDto {
    @IsNotEmpty()
    @IsNumber()
    id_practica: number;
    
    @IsNotEmpty()
    @IsNumber()
    id_alumno: number;
}