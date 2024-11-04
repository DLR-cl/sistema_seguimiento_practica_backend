import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AuthLoginDto{

    @IsEmail()
    @IsNotEmpty()
    correo: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}