import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../database/database/database.service';
import { CrearDimensionDto } from './dto/crear-dimension.dto';
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
    public async crearDimensiones(dimensiones: CrearDimensionDto[]) {
        try {
            // Obtener las dimensiones existentes por nombre
            const nombresExistentes = await this._databaseService.dimensionesEvaluativas.findMany({
                select: { nombre: true }
            });
    
            // Crear un array con los nombres existentes
            const nombresExistentesSet = new Set(nombresExistentes.map(dim => dim.nombre));
    
            // Filtrar las dimensiones que aún no existen
            const dimensionesFiltradas = dimensiones.filter(dimension => 
                !nombresExistentesSet.has(dimension.nombre)
            );
    
            // Verificar si hay dimensiones nuevas para insertar
            if (dimensionesFiltradas.length === 0) {
                return {
                    message: 'No hay dimensiones nuevas para insertar',
                    total: 0
                };
            }
    
            // Insertar las dimensiones filtradas
            const creados = await this._databaseService.dimensionesEvaluativas.createMany({
                data: dimensionesFiltradas
            });
    
            return {
                message: 'Dimensiones creadas con éxito',
                total: creados.count,
            };
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Error al crear dimensiones');
        }
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
