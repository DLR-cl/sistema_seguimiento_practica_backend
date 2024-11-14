import { Tipo_usuario } from "@prisma/client";
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";

export class AlumnoPracticaDto {


    @IsEmail()
    @IsNotEmpty()
    correo: string;
    
    @IsString()
    @IsNotEmpty()
    nombre: string;
    
    @IsString()
    @IsNotEmpty()
    rut: string;

    @IsEnum(Tipo_usuario)
    @IsNotEmpty()
    tipo_usuario: Tipo_usuario;

}