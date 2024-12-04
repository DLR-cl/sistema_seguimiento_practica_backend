import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
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

    public async createAsignaturas(asignaturas: crearAsignaturasDto){
        try {
            for(let asig of asignaturas.asignaturas){
                if(await this.existeAsignatura(asig.nombre)){
                    throw new BadRequestException('Ya existe la asignatura');
                }
            };

            const listaAsignaturas = await this._databaseService.asignaturas.createMany({
                data: asignaturas.asignaturas,
            });

            return listaAsignaturas;
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
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
            const asignaturas: Asignaturas[] = await this._databaseService.asignaturas.findMany();
            return asignaturas;
        } catch (error) {
            throw error;
        }
    }
}
