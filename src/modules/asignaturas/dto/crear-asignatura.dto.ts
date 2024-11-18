import { IsNotEmpty, IsString } from "class-validator";

export class crearAsignaturaDto {
    @IsNotEmpty()
    @IsString()
    nombre: string;
}