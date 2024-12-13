import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
import { CrearDimensionDto, CrearSubDimensionDto } from './dto/crear-dimension.dto';
import { SubDimensionesEvaluativas } from '@prisma/client';
import internal from 'stream';

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

    public async crearSubDimension(subDimension: CrearSubDimensionDto){
        try {
            const existDimension = await this._databaseService.dimensionesEvaluativas.findUnique({
                where: {
                    id_dimension: subDimension.idDimensionPadre,
                }
            });
            
            if(!existDimension){
                throw new BadRequestException('No existe la dimension padre para la pregunta');
            }

            const crearDim = await this._databaseService.subDimensionesEvaluativas.create({
                data: subDimension,
            });

            return {
                message: 'Subdimension creada con éxito',
                status: HttpStatus.OK,
                data: crearDim,
            }
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }

            throw new InternalServerErrorException('Error interno al crear una dimension');
        }
    }

    public async crearVariasSubDimensiones(subDimensiones: CrearSubDimensionDto[]){
        try {
            const crear = await this._databaseService.subDimensionesEvaluativas.createMany({
                data: subDimensiones
            });

            return {
                message: 'Subdimensiones creadas con éxito',
                statud: HttpStatus.OK,
                data: crear
            }
        } catch (error) {
            throw new InternalServerErrorException('Error interno al crear varias subdimensiones');
        }
    }

    public async obtenerSubdimensiones(){
        return await this._databaseService.subDimensionesEvaluativas.findMany();
    }

    public async obtenerSubdimension(id_subdimension: number){
        const subDimension = await this._databaseService.subDimensionesEvaluativas.findUnique({
            where: {
                id_dimension: id_subdimension,
            }
        });

        if(!subDimension){
            throw new BadRequestException('La dimension seleccionada no existe');
        }

        return subDimension;
    }
    public async getDimension(id_dimension: number){
        return await this._databaseService.dimensionesEvaluativas.findUnique({
            where: { id_dimension: id_dimension}
        })
    }
    // mover a respuestasInforme
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
