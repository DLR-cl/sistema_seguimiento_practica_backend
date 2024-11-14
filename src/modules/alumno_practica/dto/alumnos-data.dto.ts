import { AlumnosPractica, Tipo_pregunta, Tipo_usuario, TipoPractica } from "@prisma/client"

export class AlumnosDataDto {
    id_usuario: number;
    nombre: string;
    correo: string;
    rut: string;
    tipo_usuario: Tipo_usuario;
    alumno_practica: AlumnosPractica;
}