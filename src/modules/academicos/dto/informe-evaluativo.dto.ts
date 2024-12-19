import { IsArray, IsDate, IsNotEmpty, IsNumber } from "class-validator";

export class InformeEvaluativoDto {

    @IsNotEmpty()
    @IsNumber()
    id_academico: number;
 
    @IsNotEmpty()
    @IsNumber()
    id_informe_alumno: number;
    
    @IsNotEmpty()
    @IsNumber()
    id_informe_confidencial: number;
    
    @IsNotEmpty()
    @IsDate()
    fecha_revision: Date;

    @IsNotEmpty()
    @IsArray()
    respuestas: RespuestasInformeEvaluativo[]
}


export class RespuestasInformeEvaluativo{
    respuesta_texto: string;
    pregunta_id: number;
    informe_id: number = 0;
}