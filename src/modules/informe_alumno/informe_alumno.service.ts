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
            if(!await this.existeInforme(asignacion.id_informe)){
                throw new BadRequestException('No existe informe');
            }  
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
            // antes de cambiar el estado hay que definir cuánto tiempo tiene el academico para revisarlo...
            return asignarInforme;
        }catch(error){
            if(error instanceof BadRequestException){
                throw error;
            }
        }
    }

    private async generarAlertaAcademico(){
        try {
            const informesAlumno: InformesAlumno[] = await this._databaseService.informesAlumno.findMany({
                where: {
                    estado: Estado_informe.REVISION
                },
            });
            const actualDay = new Date();
            for(let informe of informesAlumno){
                let terminoDay = new Date(informe.fecha_termino_revision);
                
                const diferenciaDias = Math.ceil((
                    terminoDay.getDate() - actualDay.getDate()
                )/ (1000 * 60 * 20 * 24));

                if(diferenciaDias == 7){
                    // generar alerta
                }else if(diferenciaDias == 3){
                    // generar alerta
                }else if(diferenciaDias == 0){
                    // generar alerta
                }else if(diferenciaDias < 0){
                    // generar de atraso contando los dias que lleva atrasado
                }
            }   
        } catch (error) {
            
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
            const updatePractica = await this._databaseService.practicas.update({
                where:{
                    id_practica: informe.id_practica,
                },
                data: {
                    estado: Estado_practica.REVISION_INFORME_ALUMNO
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
