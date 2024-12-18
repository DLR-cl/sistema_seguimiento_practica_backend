import { AlumnosPractica, Tipo_pregunta, Tipo_usuario, TipoPractica } from "@prisma/client"

export class AlumnosDataDto {
    id_user: number;
    primer_practica: boolean;
    segunda_practica: boolean;
    usuario : {
        nombre: string;
        correo: string;
        rut: string;
        tipo_usuario: Tipo_usuario;
    }
}