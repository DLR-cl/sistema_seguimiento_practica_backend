import { BadRequestException, Injectable, NotFoundException, Param } from '@nestjs/common';
import { CreateInformeAlumnoDto } from './dto/create-informe-alumno.dto';
import { DatabaseService } from '../../database/database/database.service';
import { Estado_informe, Estado_practica, InformesAlumno, TipoPractica } from '@prisma/client';
import { AlumnoPracticaService } from '../alumno_practica/alumno_practica.service';
import { PracticasService } from '../practicas/practicas.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { CreateEnlaceDto } from './dto/create-enlace.dto';
import { file } from 'googleapis/build/src/apis/file';
import * as path from 'path';
import { info } from 'console';
import { EmailAvisosService } from '../email-avisos/email-avisos.service';

@Injectable()
export class InformeAlumnoService {
    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _practicaService: PracticasService,
        private readonly _emailService: EmailAvisosService,
        
    ){
    }


    private async existeInformeRegistrado(id_alumno: number, id_pract: number) {
        const informe = await this._databaseService.informesAlumno.findFirst({
            where: {
                id_alumno: id_alumno,
                id_practica: id_pract
            }
        });

        if(!informe){
            return true;
        }
        return false;
    
    }
    public async asignarInformeAlAcademico(asignacion: CreateAsignacionDto){
        try{
            // asignar informe al academico, debe existir academico e informe

            const fechaInicio = new Date();
            const fechaFin = new Date(fechaInicio);
            fechaFin.setDate(fechaInicio.getDate() + 14 );

            const asignarInforme = await this._databaseService.informesAlumno.update({
                where:{
                    id_informe: asignacion.id_informe
                },
                data: {
                    id_academico: asignacion.id_academico,
                    estado: Estado_informe.REVISION,
                    fecha_inicio_revision: fechaInicio,
                    fecha_termino_revision: fechaFin,
                }
            });

            // notificar alumno
            // this._emailService.notificacionAsignacion(asignarInforme.id_academico, asignarInforme.id_informe);
            return asignarInforme;
        }catch(error){
            if(error instanceof BadRequestException){
                throw error;
            }
        }
    }

    public async aprobarInforme(id_informe: number ,aprobacion: Estado_informe){
        const informe = await this._databaseService.informesAlumno.update(
            {
                where: {
                    id_informe: id_informe
                },
                data: {
                    estado: aprobacion,
                }
            }
        )
    }

    public async existeInforme(id_informe: number){
        try {
            const informe = await this._databaseService.informesAlumno.findUnique({
                where:{
                    id_informe: id_informe,
                    estado: Estado_informe.ENVIADA
                }
            });

            return informe;
        }catch(error){
            if(error instanceof BadRequestException){
                throw error;
            }
        }
    }

    public async asociarArchivoAlumno(id: number, fileName: string){
        try {
            console.log(id);
            const informe = await this._databaseService.informesAlumno.update({
                where: {id_informe: id},
                data: { archivo: fileName},
            });
            const getInforme = await this._databaseService.informesAlumno.findUnique({
                where: {
                    id_informe: id
                }
            });
            console.log(getInforme)
            const updatePractica = await this._databaseService.practicas.update({
                where:{
                    id_practica: getInforme.id_practica,
                },
                data: {
                    estado: Estado_practica.REVISION_GENERAL
                }
            })

            return informe;
        } catch (error) {
            throw error;
        }
    }

    public async getArchivo(id_informe: number) {
        const informe = await this.getInformePorId(id_informe);
        
        if(!informe || !informe.archivo){
            throw new NotFoundException('No se encontro el informe');
        }
        const uploadPath = path.resolve(__dirname, '..', '..', 'uploads');
        console.log(typeof uploadPath, uploadPath); 

        const filePath = path.join(uploadPath, informe.archivo);
        if(!filePath){
            throw new NotFoundException('El archivo no existe en el sistema de archivos');
        }
        console.log(filePath); 
        


        return filePath;
    }

    private async getInformePorId(id_informe: number) {
        const informe = await this._databaseService.informesAlumno.findUnique({
            where: {id_informe: id_informe},
        });

        return informe;
    }

    public async existeRespuestaInforme(id_practica: number){
        try {
            const practica = await this._practicaService.getPractica(id_practica);
            if(practica.informe_alumno){
                return practica.informe_alumno;
            }else {
                return {};
            }
        } catch (error) {
            throw error;
        }
    }
}
