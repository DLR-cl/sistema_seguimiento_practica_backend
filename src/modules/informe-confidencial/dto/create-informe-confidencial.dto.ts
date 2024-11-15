import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateInformeConfidencialDto {

    @IsNotEmpty()
    @IsNumber()
    horas_practicas_regulares: number;
    
    @IsNotEmpty()
    @IsNumber()
    horas_practicas_extraordinarias: number;
    
    @IsNotEmpty()
    @IsNumber()
    total_horas: number;
    
    @IsNotEmpty()
    @IsNumber()
    horas_inasistencia: number;
    
    @IsNotEmpty()
    @IsNumber()
    id_supervisor: number;
    
    @IsNumber()
    @IsNotEmpty()
    id_alumno_evaluado: number;    
    
    @IsNumber()
    @IsNotEmpty()
    id_practica: number;    
    
}    
