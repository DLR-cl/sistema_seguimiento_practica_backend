import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
import { AsignarPreguntasDto } from './dto/asignar-preguntas.dto';
import { Preguntas } from '@prisma/client';

@Injectable()
export class PreguntasImplementadasInformeAlumnoService {
    constructor(
        private readonly _databaseService: DatabaseService,
    ){}

    public async asignarPreguntas(asignarPreguntas: AsignarPreguntasDto){
        try {
            
            for(let preg of asignarPreguntas.preguntas){
                if(!await this.existePregunta(preg.id_pregunta)){
                    throw new BadRequestException('Pregunta no existe');
                }
            }

            const pregunta = await this._databaseService.preguntasImplementadasInformeAlumno.createMany({
                data: asignarPreguntas.preguntas
            });


        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
        }
    }

    public async existePregunta(id_pregunta: number){
        try {
            const exist = await this._databaseService.preguntas.findUnique({
                where: {
                    id_pregunta: id_pregunta
                }
            })

            if(!exist){
                return false;
            }

            return true;
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
        }
    }
}
