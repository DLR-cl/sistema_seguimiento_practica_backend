import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
import { CreateRespuestaInformAlumnoDto, ListaRespuestaDto } from './dto/create-respuesta-informe-alumno.dto';
import { InformeAlumnoService } from '../informe_alumno/informe_alumno.service';

import { PreguntasImplementadasInformeAlumnoService } from '../preguntas-implementadas-informe-alumno/preguntas-implementadas-informe-alumno.service';

@Injectable()
export class RespuestasInformeAlumnoService {
    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _informeAlumnoService: InformeAlumnoService,
        private readonly _preguntasAlumnoService: PreguntasImplementadasInformeAlumnoService
    ){}

    public async crearRespuesta(respuesta: ListaRespuestaDto){
        try {
            
            if(!await this.validarRespuestas(respuesta.respuestas[0])){
                throw new BadRequestException('No existe pregunta o informe asociado a la respuesta');
            }
            const nuevaRespuesta = await this._databaseService.respuestasInformeAlumno.createMany({
                data: respuesta.respuestas
            });

            return "creado con éxito";
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
        }
    }

    public async validarRespuestas(respuesta: CreateRespuestaInformAlumnoDto){
        const informe = await this._informeAlumnoService.existeInforme(respuesta.id_informe);

        const pregunta = await this._preguntasAlumnoService.existePregunta(respuesta.id_pregunta);

        if(!(informe || pregunta)){
            return false;
        }

        return true
    }

    public async getAllRespuestas(){
        return await this._databaseService.respuestasInformeAlumno.findMany();
    }

    public async getAllRespuestasConAsignaturas(){
        try {
            const respuestasAsignaturas = await this._databaseService.respuestasInformeAlumno.findMany({
                where: {
                    NOT: {
                        asignaturas: null
                    }
                },
                include:{
                    asignaturas: true,
                }
            });

            return respuestasAsignaturas;
        } catch (error) {
            
        }
    }

    public async getRespuestasInforme(id_informe){
        try {
            const respuestas = await this._databaseService.respuestasInformeAlumno.findMany({
                where:{
                    id_informe: id_informe,
                },
                include:
                {
                    asignaturas: true,
                }
            });

            return respuestas;
        } catch (error) {
        }
    };


}
