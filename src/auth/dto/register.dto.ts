import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RegisterDTO {

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsEmail()
    @IsNotEmpty()
    correo: string;
    
    @IsString()
    @IsNotEmpty()
    nombre: string;
    
    @IsString()
    @IsNotEmpty()
    rut: string;

    @IsString()
    @IsNotEmpty()
    tipo_usuario: string;
}