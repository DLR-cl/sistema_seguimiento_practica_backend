import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../database/database/database.service';
import { AsignarPreguntaDto} from './dto/asignar-preguntas.dto';
import { Preguntas } from '@prisma/client';
import { PreguntasService } from '../preguntas/preguntas.service';
import { responsePreguntas } from './dto/response-preguntas.dto';

@Injectable()
export class PreguntasImplementadasInformeAlumnoService {
    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _preguntaService: PreguntasService,
    ){ }

    public async asignarPreguntas(asignarPreguntas: AsignarPreguntaDto[]){
        try {
            
            for(let preg of asignarPreguntas){
                const existe = await this._preguntaService.obtenerPreguntaById(preg.id_pregunta);
                if(!existe){
                    throw new BadRequestException('Pregunta no existe');
                    }
                };

            const preguntasAsignadas = await this._databaseService.preguntasImplementadasInformeAlumno.createMany({
                    data: asignarPreguntas,
            });

            return preguntasAsignadas;

        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
        }
    }

    public async asignarPregunta(pregunta_id: number){
        try {
            const existe = await this._preguntaService.obtenerPreguntaById(pregunta_id);
            const yaAsignado = await this._databaseService.preguntasImplementadasInformeAlumno.findUnique({
                where: {
                    id_pregunta: pregunta_id,
                }
            });

            if(yaAsignado){
                throw new BadRequestException('La pregunta ya se encuentra asignada');
            }

            if(!existe){
                throw new BadRequestException('No existe pregunta a relacionar')
            }
            const implementacion = await this._databaseService.preguntasImplementadasInformeAlumno.create({
                data: {
                    id_pregunta: pregunta_id
                },
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
        const preguntasWithoutMap = await this._databaseService.preguntasImplementadasInformeAlumno.findMany(
            {   
                include: {
                    preguntas: {
                        select: {
                            id_pregunta: true,
                            enunciado_pregunta: true,
                            tipo_pregunta: true,
                        }
                    },
                },
            }
        );
        const preguntas: responsePreguntas[] = preguntasWithoutMap.flatMap(implementada => implementada.preguntas);

        return preguntas
    }

    public async obtenerPreguntaImplementada(id_pregunta: number){
        const preguntaImplementada = await this._databaseService.preguntasImplementadasInformeAlumno.findUnique({
            where: {
                id_pregunta: id_pregunta,
            },
            include: {
                preguntas: true,
            }
        });
        const pregunta: responsePreguntas = preguntaImplementada.preguntas;
        return pregunta;
    }
}
