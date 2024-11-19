import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
import { AsociarPreguntasDto } from './dto/asociar-preguntas.dto';
import { RespuestasInformeAlumnoService } from '../respuestas-informe-alumno/respuestas-informe-alumno.service';


@Injectable()
export class AsignaturasRespuestaAlumnoService {
    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _respuestasInformeAlumnoService: RespuestasInformeAlumnoService,
    ){}

    public async asociarAsignaturas(preguntas: AsociarPreguntasDto){
        try {
            if(!await this._respuestasInformeAlumnoService.validarRespuestas(preguntas.asignaturas[0])){
                throw new BadRequestException('No existe informe o pregunta asociada');
            }

            const generateRespuestas = await this._databaseService.asignaturasEnRespuestasInforme.createMany({
                data: preguntas.asignaturas
            });

            return "todo ok";
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error
            }else{
                throw new InternalServerErrorException('Ocurrio un error en el servidor');
            }
        }
    }

    public async getAllRespuestasAsignaturas(){
        try {
            const asignaturas = await this._databaseService.asignaturasEnRespuestasInforme.findMany();
        } catch (error) {
            
        }
    }

    public async getAllIncidenciasAsignaturas(nombre_asignatura: string){
        try {
            const cantIncidencia = await this._databaseService.asignaturasEnRespuestasInforme.count({
                where: {
                    nombre_asignatura: nombre_asignatura,
                }
            });

            return cantIncidencia;
        } catch (error) {
            
        }
    }
}
