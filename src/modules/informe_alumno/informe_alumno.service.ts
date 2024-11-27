import { BadRequestException, Injectable, NotFoundException, Param } from '@nestjs/common';
import { CreateInformeAlumnoDto } from './dto/create-informe-alumno.dto';
import { DatabaseService } from '../../database/database/database.service';
import { Estado_informe, Estado_practica, TipoPractica } from '@prisma/client';
import { AlumnoPracticaService } from '../alumno_practica/alumno_practica.service';
import { PracticasService } from '../practicas/practicas.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { CreateEnlaceDto } from './dto/create-enlace.dto';
import { file } from 'googleapis/build/src/apis/file';
import * as path from 'path';
import { NotFoundError } from 'rxjs';
import { existsSync } from 'fs';
import { ElPepe } from 'uploads/hola';
@Injectable()
export class InformeAlumnoService {
    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _alumnoService: AlumnoPracticaService,
        private readonly _practicaService: PracticasService,
        
    ){
    }

    public async crearInformeAlumno(informe: CreateInformeAlumnoDto){
        try {
            if(!await this._alumnoService.existeAlumno(informe.id_alumno) || !((await this._practicaService.esPracticaAlumno(informe.id_alumno)).id_practica == informe.id_practica)){
                throw new BadRequestException('No existe alumno o la practica no le pertenece')
            }

            if(!await this.existeInformeRegistrado(informe.id_alumno, informe.id_practica)){
                throw new BadRequestException('Ya existe un informe asociado a esa practica');
            }

            const nuevoInforme = await this._databaseService.informesAlumno.create({
                data: {
                    ...informe,
                    estado: Estado_informe.ENVIADA,
                }
            });
            return nuevoInforme;
        } catch(error){
            if(error instanceof BadRequestException){
                throw error;
            }
            throw error;
        };
    };

    private async existeInformeRegistrado(id_alumno: number, id_practica: number) {
        const informe = await this._databaseService.informesAlumno.findFirst({
            where: {
                id_alumno: id_alumno,
                id_practica: id_practica
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
            if(this.existeInforme(asignacion.id_informe)!){
                throw new BadRequestException('No existe informe');
            }

            const asignarInforme = await this._databaseService.informesAlumno.update({
                where:{
                    id_informe: asignacion.id_informe
                },
                data: {
                    id_academico: asignacion.id_academico,
                    estado: Estado_informe.REVISION
                }
            });
            // antes de cambiar el estado hay que definir cuánto tiempo tiene el academico para revisarlo...
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
                    estado: aprobacion
                }
            }
        )
    }

    public async existeInforme(id_informe: number){
        try {
            const informe = await this._databaseService.informesAlumno.findUnique({
                where:{
                    id_informe: id_informe,
                }
            });

            if(informe!){
                return false;
            }
            return true;
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
        const uploadPath = path.resolve(__dirname, '..', '..', '..', '..', 'uploads');
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
}
