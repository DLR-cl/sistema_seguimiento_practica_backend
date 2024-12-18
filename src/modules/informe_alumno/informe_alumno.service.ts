import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, Param, UnauthorizedException } from '@nestjs/common';
import { CreateInformeAlumnoDto } from './dto/create-informe-alumno.dto';
import { DatabaseService } from '../../database/database/database.service';
import { Estado_informe, Estado_practica, InformesAlumno, TipoPractica } from '@prisma/client';
import { AlumnoPracticaService } from '../alumno_practica/alumno_practica.service';
import { PracticasService } from '../practicas/practicas.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { CreateEnlaceDto } from './dto/create-enlace.dto';
import * as fs from 'fs';
import { file } from 'googleapis/build/src/apis/file';
import { extname, join, resolve } from 'path';
import { info } from 'console';
import { EmailAvisosService } from '../email-avisos/email-avisos.service';
import { AprobacionInformeDto, Comentario } from './dto/aprobacion-informe.dto';
import internal from 'stream';
import { InformeDto } from './dto/informe_pdf.dto';


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
    public async asignarInformeAlAcademico(asignacion: CreateAsignacionDto) {
        try {
            const academico = await this._databaseService.academico.findUnique({
                where: {
                    id_user: asignacion.id_academico,
                },
                include: {
                    usuario: {
                        select: {
                            nombre: true
                        }
                    }
                }
            })
            // Buscar el informe por su ID y validar el estado permitido para asignación
            const informeAlumno = await this._databaseService.informesAlumno.findUnique({
                where: {
                    id_informe: asignacion.id_informe_alumno,
                    estado: {
                        in: [Estado_informe.ENVIADA, Estado_informe.REVISION], // Estados permitidos
                    },
                },
            });
            
            const informeConfidencial = await this._databaseService.informeConfidencial.findUnique({
                where: {
                    id_informe_confidencial: asignacion.id_informe_confidencial,
                    estado: {
                        in: [Estado_informe.ENVIADA, Estado_informe.REVISION]
                    }
                },
            });

            if (!informeAlumno && !informeConfidencial) {
                throw new BadRequestException(
                    'Deben existir ambos informes para asignar al academico.'
                );
            }
    
            // Definir fechas de inicio y fin de la revisión
            const fechaInicio = new Date();
            const fechaFin = new Date(fechaInicio);
            fechaFin.setDate(fechaInicio.getDate() + 14);
    
            // Actualizar el informe con la asignación del académico
            const asignarInformeAlumno = await this._databaseService.informesAlumno.update({
                where: {
                    id_informe: asignacion.id_informe_alumno,
                },
                data: {
                    id_academico: asignacion.id_academico,
                    estado: Estado_informe.REVISION,
                    fecha_inicio_revision: fechaInicio,
                    fecha_termino_revision: fechaFin,
                },
            });
            
            // Actualizar el informe confidencial
            const asignarInformeConfidencial = await this._databaseService.informeConfidencial.update({
                where: {
                    id_informe_confidencial: asignacion.id_informe_confidencial
                },
                data: {
                    id_academico: asignacion.id_academico,
                    estado: Estado_informe.REVISION,
                    fecha_inicio_revision: fechaInicio,
                    fecha_termino_revision: fechaFin,
                }
            })
            // CAMBIAR ESTADO PRACTICA
            const practica = await this._databaseService.practicas.update({
                where: {
                    id_practica: asignacion.id_practica,
                }, data: {
                    estado: Estado_practica.REVISION_GENERAL
                }
            })
            // Notificar SOLO al acádemico
            this._emailService.notificacionAsignacion(asignarInformeAlumno.id_academico, asignarInformeAlumno.id_informe);
    
            return {
                message: `Se asignó exitosamente la revisión del informe a ${academico.usuario.nombre}, a partir de la fecha actual tiene 14 días para revisión.`
            }
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(
                'Error interno al asociar el informe del alumno al académico'
            );
        }
    }
    

    public async aprobarInforme(aprobacion: AprobacionInformeDto){
        try {
            // el informe debe estar en revision y existir
            const informe = await this._databaseService.informesAlumno.findUnique({
                where: {
                    id_informe: aprobacion.id_informe,
                    OR: [
                        { estado: Estado_informe.REVISION },
                        { estado: Estado_informe.CORRECCION }
                    ]
                }
            });

            if(!informe){
                throw new BadRequestException('El informe del alumno no se encuentra en estado de revisión o correccion o no existe')
            }
            if(informe.id_academico != aprobacion.id_academico){
                throw new UnauthorizedException('No posee los permisos necesarios para aprobar el informe del alumno, solo los academicos puede realizar esta accion');
            }
            const informeCambio = await this._databaseService.informesAlumno.update({
                where: {
                    id_informe: aprobacion.id_informe
                }
                ,data: {
                    estado: aprobacion.estado
                }
            });

            await this._emailService.notificacionCambioEstado(informeCambio.id_informe, informeCambio.estado);


            return {
                message: 'El informe ha sido actualizado con éxito',
                status: HttpStatus.OK,
                data: informeCambio
            }
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }else if(error instanceof UnauthorizedException){
                throw error;
            }
            throw new InternalServerErrorException('Error interno al cambiar el estado del informe del alumno');
        }
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

            const informe = await this._databaseService.informesAlumno.update({
                where: {id_informe: id},
                data: { 
                        archivo: fileName,
                    },
            });

            const getInforme = await this._databaseService.informesAlumno.findUnique({
                where: {
                    id_informe: id
                }
            });
            console.log(getInforme)

            return informe;
        } catch (error) {
            throw error;
        }
    }

    async getArchivo(id_informe: number) {
        // Obtener el informe por ID
        const informe = await this.getInformePorId(id_informe);

        if (!informe || !informe.archivo) {
            throw new NotFoundException('No se encontró el informe del alumno');
        }

        // La ruta completa ya está almacenada en informe.archivo_informe
        const filePath = resolve(informe.archivo);

        if (!fs.existsSync(filePath)) {
            throw new NotFoundException('El archivo no existe en el sistema de archivos');
        }

        return fs.createReadStream(filePath); // Retornar un stream para el controlador
    }

    private async getInformePorId(id_informe: number) {
        return await this._databaseService.informesAlumno.findUnique({
            where: { id_informe },
        });
    }

    public async existeRespuestaInforme(id_informe: number){
        try {
            const informe = await this._databaseService.informesAlumno.findUnique({
                where: {
                    id_informe: Number(id_informe)
                },
            });

            let existe: boolean = false;
            let correcionInforme: boolean = false;

            if(!informe){
                throw new BadRequestException('Error, el informe no existe o no está enviado.')
            }

            if(informe.estado in [Estado_informe.ENVIADA, Estado_informe.REVISION, Estado_informe.APROBADA, Estado_informe.DESAPROBADA]){
                existe = true;
            }

            if(informe.estado == Estado_informe.CORRECCION){
                correcionInforme = true;
            }
            return {
                existeRespuesta:  existe,
                correcion: correcionInforme
            }
        } catch (error) {
           if(error instanceof BadRequestException){
            throw error;
           }
           throw new InternalServerErrorException('Error interno al ver si se encuentra respondido un informe');
        }
    }

    public async crearComentarios(comentarios: Comentario[]){
        try {
            const existeInforme = await this._databaseService.informesAlumno.findUnique({
                where: {
                    id_informe: comentarios[0].id_informe,
                    OR: [
                        { estado: Estado_informe.CORRECCION },
                        { estado: Estado_informe.REVISION }
                    ],
                }
            });
            if(!existeInforme){ 
                throw new BadRequestException('No existe informe a comentar o no se encuentra habilitado para recibir comentarios');
            }

            if(existeInforme.id_academico != comentarios[0].id_usuario){
                throw new UnauthorizedException('No tiene permisos necesarios para comentar un informe');
            }

            const generarComentarios = await this._databaseService.comentariosPractica.createMany({
                data: comentarios
            });

            return {
                message: 'Comentarios registrados con éxito',
                status: HttpStatus.OK
            }
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }else if(error instanceof UnauthorizedException){
                throw error;
            }

            throw new InternalServerErrorException('Error interno al registrar los comentarios');
        }
    }

    public async editarComentario(comentario: Comentario){
        try {
            const informe = await this._databaseService.informesAlumno.findUnique({
                where: {
                    id_informe: comentario.id_informe,
                    estado: Estado_informe.CORRECCION
                }
            });

            if(!informe){
                throw new BadRequestException('El informe no se encuentra en estado de correccion o no existe el informe');
            }
            if(comentario.id_usuario != informe.id_academico){
                throw new UnauthorizedException('No posee los permisos necesarios para modificar los comentarios');
            }

            const actualizarComentario = await this._databaseService.comentariosPractica.update({
                where: {
                    id_informe_id_usuario: {
                        id_informe: comentario.id_informe,
                        id_usuario: comentario.id_usuario
                    }
                },
                data: {
                    comentario: comentario.comentario
                }
            });

            return {
                message: 'Comentario actualizado con éxito',
                status: HttpStatus.OK,
                data: actualizarComentario
            }
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }else if(error instanceof InternalServerErrorException){
                throw error;
            }

            throw new InternalServerErrorException('Error interno al actualizar el comentario');
        }
    }

    async subirInforme(file: Express.Multer.File, data: InformeDto, rootPath: string) {
        const fs = require('fs');
        const filePath = file.path;
    
        try {
    
            const existeAlumno = await this._databaseService.alumnosPractica.findUnique({
                where: {
                    id_user: +data.id_alumno,
                },
                include: {
                    usuario: true,
                },
            });
    
            if (!existeAlumno) {
                throw new NotFoundException(`No se encontró un alumno con el ID ${data.id_alumno}`);
            }
    
            // Buscamos un informe del alumno en estado CORRECCION
            const informeEnCorreccion = await this._databaseService.informesAlumno.findFirst({
                where: {
                    id_alumno: +data.id_alumno,
                    estado: Estado_informe.CORRECCION
                }
            });
    
            const rutaArchivo = filePath;
    
            if (informeEnCorreccion) {
                // Si hay un informe en CORRECCION, reemplazamos el archivo
                if (informeEnCorreccion.archivo && fs.existsSync(informeEnCorreccion.archivo)) {
                    await fs.promises.unlink(informeEnCorreccion.archivo);
                    console.log(`Archivo anterior eliminado: ${informeEnCorreccion.archivo}`);
                }
    
                await this._databaseService.informesAlumno.update({
                    where: {
                        id_informe: +informeEnCorreccion.id_informe,
                        estado: Estado_informe.CORRECCION,
                    },
                    data: {
                        id_alumno: +data.id_alumno,
                        archivo: rutaArchivo,
                        estado: Estado_informe.REVISION
                        // Mantener estado en CORRECCION
                    },
                });
    
                return {
                    message: 'Informe reemplazado exitosamente en estado CORRECCION',
                    filePath: rutaArchivo,
                };
            }
    
            // Si no se encontró informe en CORRECCION, buscamos el que esté en ESPERA para hacer el primer envío
            const informeEnEspera = await this._databaseService.informesAlumno.findUnique({
                where: {
                    id_informe: +data.id_informe
                }
            });
    
            if (informeEnEspera && informeEnEspera.estado === Estado_informe.ESPERA) {
                // Actualizar el informe a ENVIADA en el primer envío
                await this._databaseService.informesAlumno.update({
                    where: {
                        id_informe: +data.id_informe,
                        estado: Estado_informe.ESPERA,
                    },
                    data: {
                        id_alumno: +data.id_alumno,
                        archivo: rutaArchivo,
                        estado: Estado_informe.ENVIADA
                    },
                });
                const practica = await this._databaseService.practicas.findUnique({
                    where: {
                        id_practica: informeEnEspera.id_practica,
                    },
                    include: {
                        informe_confidencial: true,
                    }
                });

                if(practica.estado == Estado_practica.ESPERA_INFORMES && practica.informe_confidencial.estado == Estado_informe.ENVIADA){
                    await this._databaseService.practicas.update({
                        where: { id_practica: practica.id_practica },
                        data: { estado: Estado_practica.INFORMES_RECIBIDOS }
                    })
                }
                return {
                    message: 'Informe enviado exitosamente (de ESPERA a ENVIADA)',
                    filePath: rutaArchivo,
                };
            }

            // verificar que se haya subido el otro informe 

    
            // Si no hay informe en CORRECCION ni uno en ESPERA (para este id_informe), significa que no se puede subir
            throw new BadRequestException('No se puede subir el informe en el estado actual.');
            
        } catch (error) {
            // En caso de error, elimina el archivo recién subido
            try {
                if (fs.existsSync(filePath)) {
                    await fs.promises.unlink(filePath);
                    console.log(`Archivo eliminado: ${filePath}`);
                }
            } catch (unlinkError) {
                console.error(`Error al intentar eliminar el archivo: ${unlinkError.message}`);
            }
            throw error; 
        }
    }

    async obtenerRespuestasInforme(id_informe: number) {
        try {
          // Consulta las respuestas asociadas al informe de alumno
          const respuestas = await this._databaseService.respuestasInformeAlumno.findMany({
            where: { id_informe },
            include: {
              pregunta: { // Relación con PreguntasImplementadasInformeAlumno
                include: {
                  preguntas: true, // Relación con Preguntas para obtener los detalles
                },
              },
            },
          });
      
          if (!respuestas || respuestas.length === 0) {
            throw new BadRequestException('No se encontraron respuestas para este informe de alumno.');
          }
      
          // Transformar las respuestas para devolver un formato más claro
          const resultados = respuestas.map(res => ({
            respuesta_texto: res.texto,
            puntaje: res.puntaje,
            nota: res.nota,
            pregunta: res.pregunta.preguntas.enunciado_pregunta,
          }));
      
          return resultados;
        } catch (error) {
          if (error instanceof BadRequestException) {
            throw error;
          }
          throw new InternalServerErrorException('Error interno al obtener las respuestas del informe de alumno.');
        }
      }
      
    
}
