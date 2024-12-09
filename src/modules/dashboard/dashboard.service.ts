import { Injectable } from '@nestjs/common';
import { obtenerCantidadAlumnosPractica } from '@prisma/client/sql';
import { DatabaseService } from 'src/database/database/database.service';

@Injectable()
export class DashboardService {
    constructor(private readonly _databaseService: DatabaseService){}
    
    public async obtenerCantidadEstudiantesEnPractica(){
        const data =  await this._databaseService.$queryRawTyped<any>(obtenerCantidadAlumnosPractica());
        const format = Number(data[0].cantidad_alumnos_practicas);
        return {
            cantidad_alumnos_practica: format
        };
    }
}
