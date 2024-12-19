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

export class PracticaDetalle {
    id_practica: number; // ID de la práctica
    tipo_practica: string; // Tipo de práctica (e.g., "PRACTICA_UNO", "PRACTICA_DOS")
    estado_practica: string; // Estado de la práctica
    cantidad_horas: number; // Total de horas de la práctica
    horas_semanales: number; // Horas semanales de la práctica
    fecha_inicio: Date; // Fecha de inicio de la práctica
    fecha_termino: Date; // Fecha de término de la práctica
    modalidad: string; // Modalidad de la práctica (e.g., "PRESENCIAL", "REMOTO")
  
    alumno_nombre: string; // Nombre del alumno
    alumno_correo: string; // Correo del alumno
    alumno_rut: string; // RUT del alumno
    alumno_tipo_usuario: string; // Tipo de usuario del alumno (e.g., "ALUMNO_PRACTICA")
  
    id_informe_alumno?: number; // ID del informe del alumno (puede ser null)
    estado_informe_alumno?: string; // Estado del informe del alumno
    informe_alumno_archivo?: string; // Archivo asociado al informe del alumno
  
    id_informe_confidencial?: number; // ID del informe confidencial (puede ser null)
    horas_practicas_regulares?: number; // Horas prácticas regulares
    horas_practicas_extraordinarias?: number; // Horas prácticas extraordinarias
    total_horas?: number; // Total de horas
    horas_inasistencia?: number; // Horas de inasistencia
    nota_evaluacion?: Decimal; // Nota de evaluación del informe confidencial
    estado_informe_confidencial?: string; // Estado del informe confidencial
  
    supervisor_nombre: string; // Nombre del supervisor
    supervisor_rut: string; // RUT del supervisor
    supervisor_correo: string; // Correo del supervisor
  
    academico_nombre?: string; // Nombre del académico (puede ser null)
    academico_rut?: string; // RUT del académico (puede ser null)
  }
  
