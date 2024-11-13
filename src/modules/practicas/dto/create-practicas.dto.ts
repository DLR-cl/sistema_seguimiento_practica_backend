import { Modalidad_practica, TipoPractica } from "@prisma/client";
import { IsDate, IsEnum, IsNotEmpty, IsNumber } from "class-validator";

export class createPracticaDto {
    @IsNumber()
    @IsNotEmpty()
    cantidad_horas: number;
    
    @IsNumber()
    @IsNotEmpty()
    horas_semanales: number;

    @IsDate()
    @IsNotEmpty()
    fecha_inicio: Date;

    @IsDate()
    @IsNotEmpty()
    fecha_termino: Date;

    @IsEnum(TipoPractica)
    @IsNotEmpty()
    tipo_practica: TipoPractica;

    @IsEnum(Modalidad_practica)
    @IsNotEmpty()
    modalidad: Modalidad_practica;

    @IsNumber()
    @IsNotEmpty()
    id_alumno: number;

    @IsNumber()
    @IsNotEmpty()
    id_supervisor: number;
}