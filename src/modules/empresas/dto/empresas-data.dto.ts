import { JefesAlumno } from "@prisma/client";

export class EmpresasDataDto {

    id_empresa: number;
    nombre_razon_social: string;
    ubicacion: string;
    rubro: string;
    nombre_gerente: string;
    
    jefe_supervisor: JefesAlumno[];
}