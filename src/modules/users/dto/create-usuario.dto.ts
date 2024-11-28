import { ApiProperty } from "@nestjs/swagger";
import { Tipo_usuario } from "@prisma/client";
import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreateUsuarioDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password: string;

    
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    correo: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    rut: string;

    @ApiProperty()
    @IsEnum(Tipo_usuario)
    @IsNotEmpty()
    tipo_usuario: Tipo_usuario

}