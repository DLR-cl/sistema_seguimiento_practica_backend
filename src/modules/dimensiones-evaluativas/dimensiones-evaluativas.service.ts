import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
import { CrearDimensionDto } from './dto/crear-dimension.dto';

@Injectable()
export class DimensionesEvaluativasService {
    constructor(
        private readonly _databaseService: DatabaseService
    ){}

    public async crearDimension(dimension: CrearDimensionDto){
        try {
            const crearDimension = await this._databaseService.dimensionesEvaluativas.create({
                data: dimension
            });

            return crearDimension;
        } catch (error) {
            
        }
    }

    public async getPreguntasByDimension(id_dimension: number){
        try {
            const preguntas = await this._databaseService.preguntas.findMany({
                where: {
                    id_dimension: id_dimension
                }
            });

            return preguntas;
        } catch (error) {
        }
    }

    public async getPuntajeByDimension(id_dimension: number){
        try {
            const preguntas = await this._databaseService.preguntas.findMany({
                where: {
                    id_dimension: id_dimension
                },
                include: {
                    preguntas_implementadas_confidencial: {
                        include: {
                            respuesta: true,

                        }
                    }
                }
            })
            let puntaje: number = 0;
            for(let preg of preguntas){
                for(let impl of preg.preguntas_implementadas_confidencial){
                    for(let punt of impl.respuesta){
                        if(punt.puntos !== null){
                            puntaje += punt.puntos;
                        }
                    }
                }
            };
            
        } catch (error) {
            
        }
    }
}
