export class AsociarPreguntasDto {
    asignaturas: AsignaturasRespuestasDto[];
}

export class AsignaturasRespuestasDto{
    id_informe: number;
    id_pregunta: number;
    nombre_asignatura: string;
}