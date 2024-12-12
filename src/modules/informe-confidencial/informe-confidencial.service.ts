import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
import { CreateInformeConfidencialDto } from './dto/create-informe-confidencial.dto';
import { AlumnoPracticaService } from '../alumno_practica/alumno_practica.service';
import { JefeAlumnoService } from '../jefe_alumno/jefe_alumno.service';
import { PracticasService } from '../practicas/practicas.service';
import { Estado_informe, Estado_practica } from '@prisma/client';

@Injectable()
export class InformeConfidencialService {
    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _practicaService: PracticasService
    ){}



    public async getInformeConfidencial(id_informe: number){
        try {
            const informe = await this._databaseService.informeConfidencial.findUnique({
                where: {
                    id_informe_confidencial: id_informe
                }
            });
            if(!informe){
                throw new BadRequestException('No existe informe');
            }
            return informe;
        } catch (error) {  
            if(error instanceof BadRequestException){
                throw error
            }
            throw new InternalServerErrorException('Error interno al obtener informe')
        }

    }
    
    public async asignarInformeConfidencial(id_informe:number, id_academico: number){
        try {
            const asignacion = await this._databaseService.informeConfidencial.update({
                where: {
                    id_informe_confidencial: id_informe,
                },
                data: {
                    id_academico: id_academico
                }
            });

            return 'Se realizó la asignación correctamente';
        } catch (error) {
            throw error;
        }
    }

    public async getInformesConfidenciales(id_supervisor: number){
        try {
            const informes = await this._databaseService.informeConfidencial.findMany({
                where: {
                    id_supervisor: id_supervisor,
                }
            });

            return informes;
        } catch (error) {
            
        }
    }

    
}
