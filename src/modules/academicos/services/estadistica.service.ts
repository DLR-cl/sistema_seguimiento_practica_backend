import { Injectable } from '@nestjs/common';
import { Estado_informe, Estado_practica } from '@prisma/client';
import { DatabaseService } from '../../../database/database/database.service';

@Injectable()
export class EstadisticaService {

    constructor(
        private readonly _databaseService: DatabaseService
    ){}


    async cantidadReprobadosAprobadosPorAcademico(id_academico: number) {
        const resultados = await this._databaseService.informesAlumno.groupBy({
            by: ['estado'],
            where: {
                id_academico: id_academico,
                estado: { in: [Estado_informe.APROBADA, Estado_informe.DESAPROBADA] },
            },
            _count: {
                estado: true,
            },
        });
    
        // Transformar el resultado en un objeto más claro
        const resumen = resultados.reduce(
            (acc, item) => {
                if (item.estado === Estado_informe.APROBADA) {
                    acc.aprobados = item._count.estado;
                } else if (item.estado === Estado_informe.DESAPROBADA) {
                    acc.reprobados = item._count.estado;
                }
                return acc;
            },
            { aprobados: 0, reprobados: 0 }, // Valores iniciales
        );
    
        return resumen;
    }
    
}
