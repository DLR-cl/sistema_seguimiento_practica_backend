import { HttpStatus } from "@nestjs/common";
import { Tipo_usuario } from "@prisma/client";
export class ResponseDto {

    message: string;
    status_code: HttpStatus;
    data: {
        id_alumno: number;
        correo: string;
        nombre: string;
        rut: string;
        tipo_usuario: Tipo_usuario;
    }
    
}