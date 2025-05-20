import { Injectable } from '@nestjs/common';
import { ResultadoAcademicoDataService } from '../../recopilacion-datos/resultado-academico/resultado-academico.service';
import { TipoPractica } from '@prisma/client';
import { DataInformesRevisadosAcademicos } from 'services/types/data-informes-revisados-academicos.interface';

@Injectable()
export class TratamientoDatosResultadoAcademicoService {

    constructor(
        private readonly _resultadoAcademicoDataService: ResultadoAcademicoDataService
    ){}


    async tratarDatosResultadoAcademico(fechaInicio: Date, fechaFin: Date, tipoPractica: TipoPractica): Promise<DataInformesRevisadosAcademicos[]>{
        const practicas = await this._resultadoAcademicoDataService.obtenerPracticasFinalizadas(fechaInicio, fechaFin, tipoPractica);
        
       
        const data: DataInformesRevisadosAcademicos[] = practicas.map(practica => {
            return {
                nombre_academico: practica.informe_alumno.academico.usuario.nombre,
                nombre_alumno: practica.informe_alumno.alumno.usuario.nombre,
                rut_alumno: practica.informe_alumno.alumno.usuario.rut,
                fecha_revision: practica.informe_alumno.fecha_inicio_revision,
                fecha_termino_revision: practica.informe_alumno.informe_academico.fecha_revision,
                dias_demora: (new Date(practica.informe_alumno.informe_academico.fecha_revision).getTime() - new Date(practica.informe_alumno.fecha_inicio_revision).getTime()) / (1000 * 60 * 60 * 24),
                tipo_practica: tipoPractica,
                empresa: practica.jefe_supervisor.empresa.nombre_razon_social
            }
        })

        return data;
    }
}
