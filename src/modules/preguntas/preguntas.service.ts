import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
import { ModificarPreguntaDto } from './dto/modificar-pregunta.dto';
import { CrearPreguntaDto } from './dto/crear-pregunta.dto';
import { CrearPreguntasDto } from './dto/crear-preguntas.dto';
import { DimensionesEvaluativasService } from '../dimensiones-evaluativas/dimensiones-evaluativas.service';

@Injectable()
export class PreguntasService {
    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _dimensionesService: DimensionesEvaluativasService
    ){}


    public async crearPregunta(pregunta: CrearPreguntaDto){
        try {
            if(!await this._databaseService.subDimensionesEvaluativas.findUnique({
                where: {
                    id_dimension: pregunta.id_dimension,
                }
            })){
                throw new BadRequestException('No existe la subdimension seleccionada para crear la pregunta');
            }
            if(!await this.existePregunta(pregunta.enunciado_pregunta)){
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
            throw new InternalServerErrorException('Error Interno al momento de crear una pregunta');
        }
    }

    public async obtenerPreguntaById(id_pregunta: number){
        const pregunta = await this._databaseService.preguntas.findUnique({
            where: {
                id_pregunta: id_pregunta,
            }
        })

        return pregunta;
    }
    public async crearPreguntas(preguntas: CrearPreguntasDto){
        try {
            const nuevasPreguntas = await this._databaseService.preguntas.createMany({
                data: preguntas.preguntas,
            })
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

            if(!nuevaPregunta){
                throw new BadRequestException('Error al modificar la pregunta, posiblemente no exista o el enunciado ya existe');
            }

            return nuevaPregunta;
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }

            throw new InternalServerErrorException('Error interno al momento de modificar la pregunta')
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

    public async obtenerPreguntasPorDimension(id_dimension: number){
        try {
            const dimension = await this._dimensionesService.obtenerSubdimension(id_dimension);
            if(!dimension){
                throw new BadRequestException('La subdimension que busca no existe en el sistema')
            };

            const preguntas = await this._databaseService.preguntas.findMany({
                where: {
                    id_dimension: id_dimension,
                }
            })

            return preguntas;
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }

            throw new InternalServerErrorException('Error interno al momento de obtener las preguntas por subdimension')
        }
    }
}
