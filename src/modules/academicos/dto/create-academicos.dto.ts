import { Tipo_usuario } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreateAcademicoDto{
    
    @IsNotEmpty()
    @IsString()
    correo: string;

    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsNotEmpty()
    @IsString()
    rut: string;

    @IsNotEmpty()
    @IsEnum(Tipo_usuario)
    tipo_usuario: Tipo_usuario
}