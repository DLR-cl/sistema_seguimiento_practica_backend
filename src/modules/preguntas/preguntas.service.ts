import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
import { ModificarPreguntaDto } from './dto/modificar-pregunta.dto';
import { CrearPreguntaDto } from './dto/crear-pregunta.dto';
import { CrearPreguntasDto } from './dto/crear-preguntas.dto';

@Injectable()
export class PreguntasService {
    constructor(
        private readonly _databaseService: DatabaseService
    ){}


    public async crearPregunta(pregunta: CrearPreguntaDto){
        try {
            if(! await this.existePregunta(pregunta.enunciado_pregunta)){
                throw new BadRequestException('Ya existe ese enunciado para la pregunta');
            }
            const nuevaPregunta = await this._databaseService.preguntas.create({
                data: pregunta
            });

            return nuevaPregunta;
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
        }
    }

    public async crearPreguntas(preguntas: CrearPreguntasDto){
        try {
            console.log(preguntas);
            const nuevasPreguntas = await this._databaseService.preguntas.createMany({
                data: preguntas.preguntas,
            })
            console.log(preguntas.preguntas);
            return nuevasPreguntas;
        } catch (error) {
            throw error;
        }
    }
    public async getAllPreguntas(){
        try {
            const preguntas = await this._databaseService.preguntas.findMany();
            return preguntas;
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
        }
    }

    public async modificarPregunta(pregunta: ModificarPreguntaDto){
        try {
            const nuevaPregunta = await this._databaseService.preguntas.update({
                where: {
                    id_pregunta: pregunta.id_pregunta,
                },
                data: {
                    enunciado_pregunta: pregunta.texto,
                }
            });

            return nuevaPregunta;
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
        }
    }

    public async existePregunta(enunciado: string){
        const pregunta = await this._databaseService.preguntas.findUnique({
            where: {
                enunciado_pregunta: enunciado,
            }
        })

        if(!enunciado){
            return false;
        }

        return true;
    }
}
