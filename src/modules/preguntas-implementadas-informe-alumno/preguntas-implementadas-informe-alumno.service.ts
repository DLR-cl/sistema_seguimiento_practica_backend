import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
import { AsignarPreguntaDto, AsignarPreguntasDto } from './dto/asignar-preguntas.dto';
import { Preguntas } from '@prisma/client';
import { PreguntasService } from '../preguntas/preguntas.service';

@Injectable()
export class PreguntasImplementadasInformeAlumnoService {
    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _preguntaService: PreguntasService,
    ){ }

    public async asignarPreguntas(asignarPreguntas: AsignarPreguntasDto){
        try {
            
            for(let preg of asignarPreguntas.preguntas){
                const existe = await this._preguntaService.obtenerPreguntaById(preg.id_pregunta);
                if(!existe){
                    throw new BadRequestException('Pregunta no existe');
                    }
                }

            const preguntasAsignadas = await this._databaseService.preguntasImplementadasInformeAlumno.createMany({
                    data: asignarPreguntas.preguntas,
            });

            return preguntasAsignadas;

        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
        }
    }

    public async asignarPregunta(pregunta: AsignarPreguntaDto){
        try {
            const existe = await this._preguntaService.obtenerPreguntaById(pregunta.id_pregunta);
            if(!existe){
                throw new BadRequestException('No existe pregunta a relacionar')
            }
            const implementacion = await this._databaseService.preguntasImplementadasInformeAlumno.create({
                data: pregunta,
            });
            return implementacion;
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }

            throw new InternalServerErrorException('Error interno al asignar la pregunta al informe');
        }
    }


    public async obtenerPreguntas(){
        return await this._databaseService.preguntasImplementadasInformeAlumno.findMany(
            {
                include: {
                    preguntas: true,
                }
            }
        );
    }

    public async obtenerPreguntaImplementada(id_pregunta: number){
        return await this._databaseService.preguntasImplementadasInformeAlumno.findUnique({
            where: {
                id_pregunta: id_pregunta
            },
        });
        
    }
}
