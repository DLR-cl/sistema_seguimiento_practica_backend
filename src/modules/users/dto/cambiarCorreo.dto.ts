import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CambiarCorreoDto {

    @IsNotEmpty()
    @IsEmail()
    correoActual: string;
    
    @IsNotEmpty()
    @IsEmail()
    correoAnterior: string;
}