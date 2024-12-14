import { IsNotEmpty, IsString } from "class-validator";

export class BuscarAlumnoDto {
    @IsString()
    @IsNotEmpty()
    rut: string;
}

export class RetornoAlumno {
    rut: string;
    nombre: string;
    correo: string;
}