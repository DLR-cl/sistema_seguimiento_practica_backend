export interface EstadisticaAprobacionPorPractica {
    practica_uno: ContabilizadorAprobacion;
    practica_dos: ContabilizadorAprobacion;
}

interface ContabilizadorAprobacion {
    aprobadas: number;
    desaprobadas: number;
}
