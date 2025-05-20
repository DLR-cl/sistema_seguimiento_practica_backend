import { Injectable } from '@nestjs/common';
import { Estado_practica, Practicas, TipoPractica } from '@prisma/client';
import { DatabaseService } from '../../../../database/database/database.service';

@Injectable()
export class ResultadoAlumnoDataService {

    constructor(
        private readonly _databaseService: DatabaseService
    ){}

    async obtenerPracticasFinalizadas(fechaInicio: Date, fechaFin: Date, tipoPractica: TipoPractica){
        /*
        1. Obtener los alummos que participaron en una práctica finalizada.
        2. De estos podemos obtenerlos por las prácticas ya finalizadas segun fecha.
        */

        const practicasFinalizadas = await this._databaseService.practicas.findMany({
            where: {
                fecha_termino: {
                    gte: fechaInicio,
                    lte: fechaFin
                },
                estado: Estado_practica.FINALIZADA,
                tipo_practica: tipoPractica
            }
        });

        return practicasFinalizadas;
    }
    
    async obtenerInformesPracticasFinalizadas(practicasFinalizadas: Practicas[]){
        const informes = await this._databaseService.informesAlumno.findMany({
            where: {
                id_practica: {
                    in: practicasFinalizadas.map(practica => practica.id_practica)
                }
            },
            include: {
                alumno: {
                    include: {
                        usuario: true
                    }
                },
            }
        });
        
        return informes;
    }
}
