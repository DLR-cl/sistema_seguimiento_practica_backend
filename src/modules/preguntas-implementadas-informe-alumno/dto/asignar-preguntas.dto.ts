import { Preguntas } from "@prisma/client";
import { IsArray, IsNotEmpty, IsNumber } from "class-validator";


export class AsignarPreguntaDto {
    @IsNotEmpty()
    @IsNumber()
    id_pregunta: number;
    
}