import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
import { CreateInformeConfidencialDto } from './dto/create-informe-confidencial.dto';
import { AlumnoPracticaService } from '../alumno_practica/alumno_practica.service';
import { JefeAlumnoService } from '../jefe_alumno/jefe_alumno.service';
import { PracticasService } from '../practicas/practicas.service';
import { Estado_practica } from '@prisma/client';

@Injectable()
export class InformeConfidencialService {
    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _practicaService: PracticasService
    ){}

    public async generarInformeConfidencial(informe: CreateInformeConfidencialDto){
        try {
            // si existe practica es porque existe supervisor y alumno
            if(!await this._practicaService.existePractica(informe.id_practica)){
                throw new BadRequestException('No existe practica para generar el informe');
            }

            const informeConfidencial = await this._databaseService.informeConfidencial.create({
                data: informe
            });

            const cambiarEstado = await this._practicaService.cambiarEstadoPractica(informe.id_practica, Estado_practica.REVISION_GENERAL);
            return informe;
            
        }catch(error){
            if(error instanceof BadRequestException){
                throw error;
            }
        }
    };


    public async getInformeConfidencialBySupervisor(id_supervisor: number){
        try {
            const informes = await this._databaseService.informeConfidencial.findMany({
                where: {
                    id_supervisor: id_supervisor,
                }
            });
        } catch (error) {

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

            return 'cambiazo';
        } catch (error) {
            
        }
    }

    
}
