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
    public async asignarInformeAlAcademico(asignacion: CreateAsignacionDto){
        try{
            // asignar informe al academico, debe existir academico e informe
            const informe = await this._databaseService.informesAlumno.findUnique({
                where: {
                    id_informe: asignacion.id_informe,
                    estado: Estado_informe.ENVIADA
                    }
            });

            if(!informe){
                throw new BadRequestException('El informe del alumno no existe o no ha sido enviado');
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

            // notificar alumno
            // this._emailService.notificacionAsignacion(asignarInforme.id_academico, asignarInforme.id_informe);
            return asignarInforme;
        }catch(error){
            if(error instanceof BadRequestException){
                throw error;
            }
            throw new InternalServerErrorException('Error interno al asociar el informe del alumno al academico')
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
        try {
            const existeAlumno = await this._databaseService.alumnosPractica.findUnique({
                where: { id_user: data.id_alumno },
                include: {
                    usuario: true,
                }
            });

            if (!existeAlumno) {
                throw new BadRequestException('El alumno no existe');
            }

            const filePath = join(rootPath, file.path);

            // Actualizar en la base de datos
            const informeActualizado = await this._databaseService.informesAlumno.update({
                where: { id_informe: data.id_informe },
                data: {
                    archivo: filePath,
                },
            });

            return {
                message: 'Informe subido exitosamente',
                data: informeActualizado,
            };
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
            console.error(error);
            throw new InternalServerErrorException('Error interno al subir el archivo');
        }
    }
}
