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
    public async crearPreguntas(preguntas: CrearPreguntaDto[]) {
        try {
            // Obtener las preguntas existentes con enunciado y id_dimension
            const preguntasExistentes = await this._databaseService.preguntas.findMany({
                select: { enunciado_pregunta: true, id_dimension: true }
            });
    
            // Crear un set para verificar duplicados rápidamente
            const preguntasExistentesSet = new Set(
                preguntasExistentes.map(
                    pregunta => `${pregunta.enunciado_pregunta}_${pregunta.id_dimension}`
                )
            );
    
            // Filtrar las preguntas que aún no existen
            const preguntasFiltradas = preguntas.filter(pregunta => 
                !preguntasExistentesSet.has(`${pregunta.enunciado_pregunta}_${pregunta.id_dimension}`)
            );
    
            // Si no hay preguntas nuevas, retornar un mensaje
            if (preguntasFiltradas.length === 0) {
                return {
                    message: 'No hay preguntas nuevas para insertar',
                    total: 0
                };
            }
    
            // Insertar solo las preguntas filtradas
            const nuevasPreguntas = await this._databaseService.preguntas.createMany({
                data: preguntasFiltradas,
            });
    
            return {
                message: 'Preguntas creadas con éxito',
                total: nuevasPreguntas.count,
            };
        } catch (error) {
            console.error('Error al crear preguntas:', error.message);
            throw new InternalServerErrorException('Error al crear preguntas');
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
