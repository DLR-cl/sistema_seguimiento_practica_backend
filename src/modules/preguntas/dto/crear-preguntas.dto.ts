import { IsArray, IsNotEmpty } from "class-validator";
import { CrearPreguntaDto } from "./crear-pregunta.dto";

export class CrearPreguntasDto {
    @IsArray()
    @IsNotEmpty()
    preguntas: CrearPreguntaDto[];
}