import { IsArray, IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateRespuestaInformAlumnoDto {
    @IsNotEmpty()
    @IsNumber()
    id_informe: number;

    @IsNotEmpty()
    @IsNumber()
    id_pregunta: number;

    @IsOptional()
    @IsString()
    texto?: string;

    @IsOptional()
    @IsNumber()
    puntaje?: number;

    @IsOptional()
    @IsString()
    nombre_asignatura?: string;
}

export class ListaRespuestaDto {
    @IsArray()
    @IsNotEmpty()
    respuestas: CreateRespuestaInformAlumnoDto[];
}