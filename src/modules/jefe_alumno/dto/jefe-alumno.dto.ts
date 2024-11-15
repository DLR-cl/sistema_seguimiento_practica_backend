import { IsEmail, IsNotEmpty, IsString, IsEnum } from "class-validator";
import { Tipo_usuario } from "@prisma/client";
export class JefeAlumnoDto {

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

    @IsString()
    @IsNotEmpty()
    cargo: string;

    @IsString()
    @IsNotEmpty()
    id_empresa: number;

}