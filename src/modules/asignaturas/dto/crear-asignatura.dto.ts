import { Tipo_asignatura } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class crearAsignaturaDto {
    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsNotEmpty()
    @IsString()
    codigo: string;

    @IsNotEmpty()
    @IsNumber()
    semestre: number;

    @IsNotEmpty()
    @IsEnum(Tipo_asignatura)
    tipo_asignatura: Tipo_asignatura;xx
}
export class crearAsignaturasDto {
    @IsNotEmpty()
    @IsString()
    asignaturas: crearAsignaturaDto[];
}