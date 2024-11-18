import { Preguntas } from "@prisma/client";
import { IsArray, IsNotEmpty } from "class-validator";

export class AsignarPreguntasDto{
    @IsNotEmpty()
    @IsArray()
    preguntas: Preguntas[]
}