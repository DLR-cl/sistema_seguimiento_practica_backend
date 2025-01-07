import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database/database.service';
import { AprobacionInformeDto, Comentario } from '../dto/aprobacion-informe.dto';
import { Estado_informe } from '@prisma/client';
import { EmailAvisosService } from '../../../modules/email-avisos/email-avisos.service';

@Injectable()
export class InformeRevisionService {

    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _emailService: EmailAvisosService
    ) { }

    public async aprobarInforme(aprobacion: AprobacionInformeDto) {
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

            if (!informe) {
                throw new BadRequestException('El informe del alumno no se encuentra en estado de revisión o correccion o no existe')
            }
            if (informe.id_academico != aprobacion.id_academico) {
                throw new UnauthorizedException('No posee los permisos necesarios para aprobar el informe del alumno, solo los academicos puede realizar esta accion');
            }
            const informeCambio = await this._databaseService.informesAlumno.update({
                where: {
                    id_informe: aprobacion.id_informe
                }
                , data: {
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
            if (error instanceof BadRequestException) {
                throw error;
            } else if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException('Error interno al cambiar el estado del informe del alumno');
        }
    }


    public async crearComentarios(comentarios: Comentario[]) {
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
            if (!existeInforme) {
                throw new BadRequestException('No existe informe a comentar o no se encuentra habilitado para recibir comentarios');
            }

            if (existeInforme.id_academico != comentarios[0].id_usuario) {
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
            if (error instanceof BadRequestException) {
                throw error;
            } else if (error instanceof UnauthorizedException) {
                throw error;
            }

            throw new InternalServerErrorException('Error interno al registrar los comentarios');
        }
    }

    public async editarComentario(comentario: Comentario) {
        try {
            const informe = await this._databaseService.informesAlumno.findUnique({
                where: {
                    id_informe: comentario.id_informe,
                    estado: Estado_informe.CORRECCION
                }
            });

            if (!informe) {
                throw new BadRequestException('El informe no se encuentra en estado de correccion o no existe el informe');
            }
            if (comentario.id_usuario != informe.id_academico) {
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
            if (error instanceof BadRequestException) {
                throw error;
            } else if (error instanceof InternalServerErrorException) {
                throw error;
            }

            throw new InternalServerErrorException('Error interno al actualizar el comentario');
        }
    }



}
