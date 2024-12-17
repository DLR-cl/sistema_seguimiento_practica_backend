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

    public async validarIdsDimension(subDimensiones: CrearSubDimensionDto[]): Promise<void> {
        const ids = subDimensiones.map(sub => sub.idDimensionPadre);
        const dimensionesExistentes = await this._databaseService.dimensionesEvaluativas.findMany({
            where: { id_dimension: { in: ids } },
            select: { id_dimension: true }
        });
    
        const idsExistentes = dimensionesExistentes.map(dim => dim.id_dimension);
        for (const sub of subDimensiones) {
            if (!idsExistentes.includes(sub.idDimensionPadre)) {
                throw new Error(`El idDimensionPadre ${sub.idDimensionPadre} no existe en DimensionesEvaluativas.`);
            }
        }
    }
    public async crearVariasSubDimensiones(subDimensiones: CrearSubDimensionDto[]) {
        try {
            // Validar que los idDimensionPadre existan
            await this.validarIdsDimension(subDimensiones);
    
            // Obtener los nombres y idDimensionPadre ya existentes
            const nombresExistentes = await this._databaseService.subDimensionesEvaluativas.findMany({
                select: { nombre: true, idDimensionPadre: true }
            });
    
            // Filtrar las subdimensiones que aún no existen
            const subDimensionesFiltradas = subDimensiones.filter(sub => {
                return !nombresExistentes.some(existente => 
                    existente.nombre === sub.nombre && existente.idDimensionPadre === sub.idDimensionPadre
                );
            });
    
            // Verificar si hay subdimensiones nuevas para insertar
            if (subDimensionesFiltradas.length === 0) {
                console.log("No hay subdimensiones nuevas para insertar.");
                return { count: 0 };
            }
    
            // Insertar las subdimensiones filtradas
            const crear = await this._databaseService.subDimensionesEvaluativas.createMany({
                data: subDimensionesFiltradas
            });
    
            return crear;
        } catch (error) {
            console.error("Error al crear subdimensiones:", error.message);
            throw new Error(error.message);
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
