import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
import { CrearDimensionDto } from './dto/crear-dimension.dto';

@Injectable()
export class DimensionesEvaluativasService {
    constructor(
        private readonly _databaseService: DatabaseService,
    ){}

    public async crearDimension(dimension: CrearDimensionDto){
        try {
            if(await this.existeDimension(dimension.nombre)){
                throw new BadRequestException('Ya existe una dimension con ese nombre');
            }
            const crearDimension = await this._databaseService.dimensionesEvaluativas.create({
                data: dimension
            });

            return crearDimension;
        } catch (error) {
            throw error;
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
            const totalPuntajeAlumnos = await this._databaseService.respuestasInformeAlumno.aggregate({
                _sum: {
                    puntaje: true,
                },
                where: {
                    pregunta: {
                        preguntas:{
                            id_dimension: id_dimension,
                        }
                    }
                }
            });

            
            return totalPuntajeAlumnos;

        } catch (error) {
            
        }
    }

    public async existeDimension(nombre: string){
        const dimension = await this._databaseService.dimensionesEvaluativas.findFirst({
            where: {
                nombre: nombre,
            }
        });

        if(!dimension){
            return false;
        }
        return true;
    }

    public async obtenerDimensiones(){
        return this._databaseService.dimensionesEvaluativas.findMany();
    }
}
