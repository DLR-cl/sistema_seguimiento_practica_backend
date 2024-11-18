import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
import { CreateRespuestaInformAlumnoDto } from './dto/create-respuesta-informe-alumno.dto';
import { InformeAlumnoService } from '../informe_alumno/informe_alumno.service';

import { PreguntasImplementadasInformeAlumnoService } from '../preguntas-implementadas-informe-alumno/preguntas-implementadas-informe-alumno.service';

@Injectable()
export class RespuestasInformeAlumnoService {
    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _informeAlumnoService: InformeAlumnoService,
        private readonly _preguntasAlumnoService: PreguntasImplementadasInformeAlumnoService
    ){}

    public async crearRespuesta(respuesta: CreateRespuestaInformAlumnoDto){
        try {
            if(!await this._informeAlumnoService.existeInforme(respuesta.id_informe)){
                throw new BadRequestException('No existe informe asociado')
            }

            if(!await this._preguntasAlumnoService.existePregunta(respuesta.id_pregunta)){
                throw new BadRequestException('No existe pregunta');
            }
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
        }
    }
}
