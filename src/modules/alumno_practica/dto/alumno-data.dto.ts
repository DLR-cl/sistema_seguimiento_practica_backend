import { Tipo_usuario } from "@prisma/client";


export class AlumnoDataDto {

    correo: string;
    nombre: string;
    tipo_usuario: Tipo_usuario;
    primer_practica: boolean;
    segunda_practica: boolean;
}