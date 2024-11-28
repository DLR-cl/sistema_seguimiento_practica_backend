import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AuthLoginDto{

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Correo del usuario',
        type: String,
    })
    correo: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    password: string;
}