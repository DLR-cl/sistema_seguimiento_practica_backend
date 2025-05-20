import { Estado_informe, Estado_practica, Modalidad_practica, TipoEmpresa, TipoPractica } from "@prisma/client";

export interface IDataResultadoPractica {
    id_practica: number;
    tipo_practica: TipoPractica;
    estado: Estado_practica;
    cantidad_horas: number;
    horas_semanales: number;
    fecha_inicio: Date;
    fecha_termino: Date;
    modalidad: Modalidad_practica;
    id_alumno: number;
    id_supervisor: number;
    informe_alumno: IInformeAlumno;
    alumno: IAlumno;
    jefe_supervisor: IJefeSupervisor;
}

interface IAlumno {
    id_user: number;
    primer_practica: boolean;
    segunda_practica: boolean;
    usuario: IUsuario;
}

interface IJefeSupervisor {
    id_user: number;
    cargo: string;
    usuario: IUsuario;
    empresa: IEmpresa;
}

interface IEmpresa {
    id_empresa: number;
    nombre_razon_social: string;
    ubicacion: string;
    rubro?: string;
    tamano_empresa?: string;
    caracter_empresa?: TipoEmpresa;
}

interface IUsuario {
    id_user: number;
    correo: string;
    nombre: string;
    rut: string;
}

interface IInformeAlumno {
    id_informe: number;
    fecha_inicio: Date;
    fecha_inicio_revision?: Date;
    fecha_termino_revision?: Date;
    intentos: number;
    estado: Estado_informe;
    archivo_alumno?: string;
    archivo_correccion?: string;
}

export interface IConteoInformes {
    aprobados: number;
    reprobados: number;
}

export interface IConteoEmpresas {
    [key: string]: number;
}

export interface IDataResultadoPracticaExcel {
    conteoInformes: IConteoInformes;
    conteoEmpresas: IConteoEmpresas;
}

