import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
import { CrearDimensionDto } from './dto/crear-dimension.dto';
import { RespuestasInformeAlumno } from '@prisma/client';

@Injectable()
export class DimensionesEvaluativasService {
    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _respuestasInformeAlumno: RespuestasInformeAlumno,
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
}
