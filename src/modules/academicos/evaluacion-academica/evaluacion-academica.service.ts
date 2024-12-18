import { BadRequestException, Body, HttpStatus, Injectable, Post } from '@nestjs/common';
import { InformeEvaluativoDto, RespuestasInformeEvaluativo } from '../dto/informe-evaluativo.dto';
import { DatabaseService } from 'src/database/database/database.service';
import { Estado_informe, Estado_practica } from '@prisma/client';

@Injectable()
export class EvaluacionAcademicaService {

    constructor(
        private readonly _databaseService: DatabaseService,
    ){}


    async crearInformeEvaluacionAcademicos(informe: InformeEvaluativoDto){


        const informe_alumno = await this._databaseService.informesAlumno.findUnique({
            where: {
                id_informe: informe.id_informe_alumno,
                NOT: {
                    archivo: null
                },
                estado: Estado_informe.REVISION
            }
        });

        if(!informe_alumno){
            throw new BadRequestException('No se encuentra el informe del alumno disponible')
        }

        const informe_confidencial = await this._databaseService.informeConfidencial.findUnique({
            where: {
                id_informe_confidencial: informe.id_informe_confidencial,
                estado: Estado_informe.REVISION
            }
        });

        if(!informe_confidencial){
            throw new BadRequestException('No existe el informe confidencial del supervisor');
        }

        // si todo existe y está bien

        const informe_evaluativo = await this._databaseService.informeEvaluacionAcademicos.create({
            data: {
                id_academico: informe.id_academico,
                id_informe_alumno: informe.id_informe_alumno,
                id_informe_confidencial: informe.id_informe_confidencial,
                fecha_revision: informe.fecha_revision,
            }
        });

        if(!informe_evaluativo){
            throw new BadRequestException('Error, no se pudo crear el informe evaluativo');
        }

        informe.respuestas.forEach((res) => {
            res.informe_id = informe_evaluativo.id_informe;
        });
        
        this.crearRespuestasInformeEvaluativo(informe.respuestas);
        return {
            message: 'Registro del informe exitoso',
            status: HttpStatus.OK 
        }
    }


    private async crearRespuestasInformeEvaluativo(respuestas: RespuestasInformeEvaluativo[]){
        
        const respuestaCrear = await this._databaseService.respuestasInformeEvaluacion.createMany({
            data: respuestas
        })

        return respuestaCrear;
    }


    async obtenerResultados(id_informe: number) {
        const resultados = await this._databaseService.respuestasInformeEvaluacion.findMany({
          where: { informe_id: id_informe },
          include: {
            pregunta_implementada: {
              include: {
                pregunta: true,
              },
            },
          },
        });
    
        if (!resultados || resultados.length === 0) {
          throw new BadRequestException('No se encontraron resultados para este informe evaluativo.');
        }
    
        return resultados.map(res => ({
          respuesta_texto: res.respuesta_texto,
          pregunta: res.pregunta_implementada.pregunta.enunciado_pregunta,
        }));
      }
}
