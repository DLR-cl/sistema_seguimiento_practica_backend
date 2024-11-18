import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
import { crearAsignaturaDto } from './dto/crear-asignatura.dto';
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

    public async getAllAsignaturas(){
        try {
            const asignaturas: Asignaturas[] = await this._databaseService.asignaturas.findMany();

        } catch (error) {
            if(error instanceof InternalServerErrorException){
                throw error;
            }
        }
    }
}
