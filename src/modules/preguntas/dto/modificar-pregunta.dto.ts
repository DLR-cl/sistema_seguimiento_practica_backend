import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ModificarPreguntaDto {

    @IsNumber()
    @IsNotEmpty()
    id_pregunta: number;

    @IsString()
    @IsNotEmpty()
    texto: string;
}