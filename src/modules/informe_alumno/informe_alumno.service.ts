import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateInformeAlumnoDto } from './dto/create-informe-alumno.dto';
import { DatabaseService } from '../../database/database/database.service';
import { Estado_informe, Estado_practica, TipoPractica } from '@prisma/client';
import { AlumnoPracticaService } from '../alumno_practica/alumno_practica.service';
import { PracticasService } from '../practicas/practicas.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { CreateEnlaceDto } from './dto/create-enlace.dto';

@Injectable()
export class InformeAlumnoService {

    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _alumnoService: AlumnoPracticaService,
        private readonly _practicaService: PracticasService,
    ){}

    public async crearInformeAlumno(informe: CreateInformeAlumnoDto){
        try {
            if(!await this._alumnoService.existeAlumno(informe.id_alumno)){
                throw new BadRequestException('No existe alumno')
            }

            if(this._practicaService.existePractica(informe.id_practica)!){
                throw new BadRequestException('No existe práctica asociada al alumno');
            };

            

        } catch(error){
            if(error instanceof BadRequestException){
                throw error;
            }
        };
    };

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

    public async enlazarInforme(enlace: CreateEnlaceDto){
        try {

            // debe existir informe y practica
            const practicaAsociada = await this._databaseService.practicas.update(
                {
                    where: {
                        id_practica: enlace.id_practica,
                    },
                    data: {
                        id_informe_alumno: enlace.id_informe,
                        estado: Estado_practica.REVISION_INFORME_ALUMNO
                    }
                }
            );

            return practicaAsociada;

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

}
