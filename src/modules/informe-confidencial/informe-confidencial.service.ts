import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database/database.service';
import { ActualizarInformeConfidencialDto, CreateInformeConfidencialDto } from './dto/create-informe-confidencial.dto';
import { AlumnoPracticaService } from '../alumno_practica/alumno_practica.service';
import { JefeAlumnoService } from '../jefe_alumno/jefe_alumno.service';
import { PracticasService } from '../practicas/practicas.service';
import { Estado_informe, Estado_practica, InformeConfidencial } from '@prisma/client';

@Injectable()
export class InformeConfidencialService {
    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _practicaService: PracticasService
    ){}


    public async actualizarInforme(id_informe: number, update: ActualizarInformeConfidencialDto){
        try {
            console.log(update.fecha_fin_practica)
            const total = update.horas_practicas_extraordinarias + update.horas_practicas_regulares - update.horas_inasistencia
            const informes = await this._databaseService.informeConfidencial.update({
                where: {
                    id_informe_confidencial:id_informe
                },
                data: {
                    horas_practicas_regulares: update.horas_practicas_regulares,
                    horas_practicas_extraordinarias: update.horas_practicas_extraordinarias,
                    horas_inasistencia: update.horas_inasistencia,
                    horas_semanales: update.horas_semanales,
                    total_horas: total,
                    fecha_inicio_practica: new Date(update.fecha_inicio_practica),
                    fecha_fin_practica: new Date(update.fecha_fin_practica),
                    estado: Estado_informe.ENVIADA
                }
            })
            return {
                message: 'Actualización del informe realizada',
                status: HttpStatus.OK
            }
            console.log(informes)
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
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

            const informeConfidencial = await this._databaseService.informeConfidencial.findUnique({
                where: {
                    id_informe_confidencial: id_informe,
                    estado: Estado_informe.ENVIADA
                }
            });

            if(!informeConfidencial){
                throw new BadRequestException('El informe confidencial no existe o aun no ha sido enviado');
            }
            
            const asignacion = await this._databaseService.informeConfidencial.update({
                where: {
                    id_informe_confidencial: id_informe,
                },
                data: {
                    id_academico: id_academico
                }
            });

            return {
                message: 'Informe Confidencial Asignado con éxito',
                status: HttpStatus.OK,
                data: asignacion
            }
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
            throw new InternalServerErrorException('Error interno al asignar informe confidencial');
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
            throw error;
        }
    }


    
}
