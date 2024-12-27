import { Tipo_asignatura, Tipo_pregunta } from "@prisma/client";

export class crearAsignaturaDto {

    nombre: string;

    codigo: string;


    semestre: number;


    tipo_asignatura: Tipo_asignatura;
}
export class crearAsignaturasDto {

    asignaturas: crearAsignaturaDto[];
}


export class AsignarPreguntaDto {

    id_pregunta: number;
    
}

export class CrearPreguntaDto {



    enunciado_pregunta: string;


    tipo_pregunta: Tipo_pregunta;


    id_dimension: number;

}