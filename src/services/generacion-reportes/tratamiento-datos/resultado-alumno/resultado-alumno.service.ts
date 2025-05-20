import { Injectable } from '@nestjs/common';
import { ResultadoAlumnoDataService } from '../../recopilacion-datos/resultado-alumno/resultado-alumno.service';
import { TipoPractica } from '@prisma/client';
import { DataResultadosPracticas } from 'services/types/data-resultados-practicas.interface';
import { retry } from 'rxjs';

@Injectable()
export class TratamientoDatosResultadosPracticasAlumnosService {

    constructor(
        private readonly _resultadoAlumnoDataService: ResultadoAlumnoDataService
    ){}

    async tratarDatosResultadosPracticasAlumnos(fechaInicio: Date, fechaFin: Date, tipoPractica: TipoPractica){
        const practicasFinalizadas = await this._resultadoAlumnoDataService.obtenerPracticasFinalizadas(fechaInicio, fechaFin, tipoPractica);
        const informes = await this._resultadoAlumnoDataService.obtenerInformesPracticasFinalizadas(practicasFinalizadas);
        const datos: DataResultadosPracticas[] = informes.map(informe => {
            return {
                rut: informe.alumno.usuario.rut,
                nombre: informe.alumno.usuario.nombre,
                resultado_practica: informe.estado,
                tipo_practica: tipoPractica
            }
        }); 
        return datos;
    }
    
}
