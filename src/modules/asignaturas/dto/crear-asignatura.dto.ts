import { IsNotEmpty, IsString } from "class-validator";

export class crearAsignaturaDto {
    @IsNotEmpty()
    @IsString()
    nombre: string;
}

export class crearAsignaturasDto {
    @IsNotEmpty()
    @IsString()
    asignaturas: crearAsignaturaDto[];
}