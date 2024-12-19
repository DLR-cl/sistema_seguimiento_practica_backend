import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database/database.service';
import { CreateRespuestaInformAlumnoDto, ListaRespuestaDto } from './dto/create-respuesta-informe-alumno.dto';
import { InformeAlumnoService } from '../informe_alumno/informe_alumno.service';

import { PreguntasImplementadasInformeAlumnoService } from '../preguntas-implementadas-informe-alumno/preguntas-implementadas-informe-alumno.service';
import { Estado_informe, Tipo_pregunta } from '@prisma/client';

@Injectable()
export class RespuestasInformeAlumnoService {
    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _informeAlumnoService: InformeAlumnoService,
        private readonly _preguntasAlumnoService: PreguntasImplementadasInformeAlumnoService
    ){}

    public async crearRespuesta(respuestas: ListaRespuestaDto){
        try {
            let asignaturas: string[];
            for(let res of respuestas.respuestas){

                // asume que una respuesta contempla asignaturas | fix DEBE CONTENER LA RESPUESTA PARA RELACIONAR CON ASIGNATURAS
                if(res.asignaturas){
                    const respuesta = await this._databaseService.respuestasInformeAlumno.create({
                        data: {
                            id_informe: res.id_informe,
                            id_pregunta: res.id_pregunta,
                            }
                    })
                    const asign = await this.asignarRespuestasAsignaturasRespuesta(res.asignaturas, res.id_informe, res.id_pregunta);
                }else if(res.puntaje){
                    const findPregunta = await this._databaseService.preguntasImplementadasInformeAlumno.findUnique({
                        where: {
                            id_pregunta: res.id_pregunta
                        },
                        include: {
                            preguntas: true,
                        }
                    });

                    if(findPregunta.preguntas.tipo_pregunta == Tipo_pregunta.EVALUATIVA){
                        const nuevaRespuesta = await this._databaseService.respuestasInformeAlumno.create({
                            data: {
                                id_informe: res.id_informe,
                                id_pregunta: res.id_pregunta,
                                nota: res.nota,
                            }
                        });
                    }
                    const nuevaRespuesta = await this._databaseService.respuestasInformeAlumno.create({
                        data: {
                            id_informe: res.id_informe,
                            id_pregunta: res.id_pregunta,
                            puntaje: res.puntaje,
                        }
                    });
                }else{
                    const nuevaRespuesta = await this._databaseService.respuestasInformeAlumno.create({
                        data: {
                            id_informe: res.id_informe,
                            id_pregunta: res.id_pregunta,
                            texto: res.texto
                        }
                    })
                }
            }

            const changeStateInforme = await this._databaseService.informesAlumno.update({
                where:{
                    id_informe: respuestas.respuestas[0].id_informe,
                },
                data: {
                    estado: Estado_informe.ENVIADA
                }
            })
            return {
                message: 'Respuestas creadas con éxito',
                statusCode: HttpStatus.OK,
            }
        } catch (error) {
            console.log(error);
            if(error instanceof BadRequestException){
                throw error;
            }
            throw error;
        }
    }

    public async asignarRespuestasAsignaturasRespuesta(asignaturas: string[], id_informe: number, id_respuesta: number){
        try {

            const array = [];

            for(let asig of asignaturas){
                let typeAsig = {
                    id_informe: id_informe,
                    id_pregunta: id_respuesta,
                    nombre_asignatura: asig,
                }
                console.log(typeAsig);
                array.push(typeAsig);
            }
            const asignar = await this._databaseService.asignaturasEnRespuestasInforme.createMany({
                data: array
            })

            return asignar;
        } catch (error) {
            throw error;
        }
    }

    public async validarRespuestas(respuesta: CreateRespuestaInformAlumnoDto){
        const informe = await this._informeAlumnoService.existeInforme(respuesta.id_informe);
        if(!informe){
            throw new BadRequestException('El informe no existe para asignar las respuestas');
        }
        const pregunta = await this._preguntasAlumnoService.obtenerPreguntaImplementada(respuesta.id_pregunta);
        if(!pregunta){
            throw new BadRequestException('Error, la pregunta a responder no está registrada en la base de datos');
        }

        return true
    }

    public async getAllRespuestas(){
        return await this._databaseService.respuestasInformeAlumno.findMany();
    }

    public async getAllRespuestasConAsignaturas(){
        try {
            const respuestasAsignaturas = await this._databaseService.respuestasInformeAlumno.findMany({
                where: {
                    NOT: {
                        asignaturas: null
                    }
                },
                include:{
                    asignaturas: true,
                }
            });

            return respuestasAsignaturas;
        } catch (error) {
            
        }
    }

    public async getRespuestasInforme(id_informe){
        try {
            const respuestas = await this._databaseService.respuestasInformeAlumno.findMany({
                where:{
                    id_informe: id_informe,
                },
                include:
                {
                    asignaturas: true,
                }
            });

            return respuestas;
        } catch (error) {
        }
    };

}
