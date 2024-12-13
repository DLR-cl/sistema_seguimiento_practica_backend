import { HttpStatus } from "@nestjs/common";
import { Practicas } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export class PracticaResponseDto {
    message: 'Practica Creada con Éxito';
    statusCode: HttpStatus.OK;
    object: Practicas;

    constructor(object: Practicas) {
        this.object = object;
    }
}

export class PracticaInfo {
    id_practica: number;
    tipo_practica: string;
    estado_practica: string;
    cantidad_horas: number;
    horas_semanales: number;
    fecha_inicio: Date;
    fecha_termino: Date;
    modalidad: string;
    alumno_nombre: string;
    alumno_correo: string;
    alumno_rut: string;
    alumno_tipo_usuario: string;
    primer_practica: number;
    segunda_practica: number;
    estado_informe_alumno: string;
    informe_alumno_archivo?: string;
    academico_nombre?: string;
    academico_rut?: string;
    horas_practicas_regulares?: number;
    horas_practicas_extraordinarias?: number;
    total_horas?: number;
    horas_inasistencia?: number;
    nota_evaluacion?: Decimal;
    supervisor_nombre?: string;
    supervisor_rut?: string;
    supervisor_correo?: string;
}

export class PracticasInfo {
    practicas: PracticaInfo[];
}