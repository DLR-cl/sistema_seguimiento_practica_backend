import { HttpStatus } from "@nestjs/common";
import { Tipo_usuario } from "@prisma/client";
export class ResponseAlumnoDto {

    message: string;
    status_code: HttpStatus;
    data: {
        id_usuario: number;
        correo: string;
        nombre: string;
        rut: string;
        tipo_usuario: Tipo_usuario;
    }
    
}