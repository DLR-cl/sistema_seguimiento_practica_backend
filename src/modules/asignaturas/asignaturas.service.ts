import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../database/database/database.service';
import { crearAsignaturaDto, crearAsignaturasDto } from './dto/crear-asignatura.dto';
import { Asignaturas } from '@prisma/client';

@Injectable()
export class AsignaturasService {
    constructor(
        private readonly _databaseService: DatabaseService,
    ){}

    public async crearAsignatura(asignatura: crearAsignaturaDto){
        try {
            const nuevaAsignatura = await this._databaseService.asignaturas.create({
                data: asignatura
            });
            
            return nuevaAsignatura;
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
        }
    }

    public async createAsignaturas(asignaturas: crearAsignaturaDto[]) {
        try {
            // Obtener todas las asignaturas existentes
            const asignaturasExistentes = await this._databaseService.asignaturas.findMany({
                select: { nombre: true }
            });
    
            // Crear un Set con los nombres de las asignaturas existentes
            const asignaturasExistentesSet = new Set(
                asignaturasExistentes.map(asig => asig.nombre)
            );
    
            // Filtrar asignaturas que no estén en la base de datos
            // Verificar si hay asignaturas nuevas para insertar

    
            // Insertar solo las asignaturas filtradas
            const listaAsignaturas = await this._databaseService.asignaturas.createMany({
                data: asignaturas,
            });
    
            return {
                message: 'Asignaturas creadas con éxito',
                total: listaAsignaturas.count
            };
        } catch (error) {
            console.error('Error al crear asignaturas:', error.message);
            throw new InternalServerErrorException('Error interno del servidor al crear las asignaturas');
        }
    }
    

    public async existeAsignatura(nombre: string){
        const asignatura = await this._databaseService.asignaturas.findUnique({
            where: {
                nombre: nombre,
            }
        });
        
        if(!asignatura){
            return false;
        }
        return true;
    }

    public async getAllAsignaturas(){
        try {
            const asignaturas: Asignaturas[] = await this._databaseService.asignaturas.findMany({
                orderBy: {
                    semestre: 'asc'
                }
            });
            return asignaturas;1
        } catch (error) {
            throw error;
        }
    }
}
