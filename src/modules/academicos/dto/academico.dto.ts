import { Tipo_usuario } from "@prisma/client";

export class Academico {
    id_usuario: number;
    nombre: string;
    correo: string;
    rut: string;
    tipo_usuario: string;
}