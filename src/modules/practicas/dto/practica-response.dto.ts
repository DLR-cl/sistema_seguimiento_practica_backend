import { HttpStatus } from "@nestjs/common";
import { Practicas } from "@prisma/client";

export class PracticaResponseDto {
    message: 'Practica Creada con Éxito';
    statusCode: HttpStatus.OK;
    object: Practicas;
    
    constructor(object: Practicas){
        this.object = object;
    }
}