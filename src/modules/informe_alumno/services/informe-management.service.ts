import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Estado_informe, Estado_practica } from '@prisma/client';
import { DatabaseService } from '../../../database/database/database.service';
import { CreateAsignacionDto } from '../dto/create-asignacion.dto';
import { EmailAvisosService } from '../../../modules/email-avisos/email-avisos.service';

@Injectable()
export class InformeManagementService {

    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _emailService: EmailAvisosService
    ) { }

    public async asignarInformeAlAcademico(asignacion: CreateAsignacionDto) {
        try {

            const practica = await this._databaseService.practicas.findUnique({
                where: { id_practica: asignacion.id_practica }
            });
            if(!practica){
                throw new BadRequestException('Error, no existe practica');
            }

            await this.verificarInformes(asignacion.id_informe_alumno, asignacion.id_academico, asignacion.id_informe_confidencial);

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

            await this.actualizarEstadoPractica(asignacion.id_practica);
            // Notificar SOLO al acádemico
            // this._emailService.notificacionAsignacion(asignarInformeAlumno.id_academico, asignarInformeAlumno.id_informe);

            return {
                message: `Se asignó exitosamente la revisión del informe, a partir de la fecha actual tiene 14 días para revisión.`
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


    private async verificarInformes(id_informe_al: number, id_academico: number, id_informe_conf: number) {
        const academico = await this._databaseService.academico.findUnique({
            where: {
                id_user: id_academico,
            },
            include: {
                usuario: {
                    select: {
                        nombre: true
                    }
                }
            }
        })
        if (!academico) {
            throw new BadRequestException('Error, no existe el academico para asignar informe');
        }
        // Buscar el informe por su ID y validar el estado permitido para asignación
        const informeAlumno = await this._databaseService.informesAlumno.findUnique({
            where: {
                id_informe: id_informe_al,
                estado: {
                    in: [Estado_informe.ENVIADA, Estado_informe.REVISION], // Estados permitidos
                },
            },
        });

        const informeConfidencial = await this._databaseService.informeConfidencial.findUnique({
            where: {
                id_informe_confidencial: id_informe_conf,
                estado: {
                    in: [Estado_informe.ENVIADA, Estado_informe.REVISION]
                }
            },
        });

        if (!informeAlumno && !informeConfidencial) {
            throw new BadRequestException('Error, uno de los dos informes no existe');
        }

        return true;

    }

    private async actualizarEstadoPractica(id_practica: number) {
        // CAMBIAR ESTADO PRACTICA
        await this._databaseService.practicas.update({
            where: {
                id_practica: id_practica,
            }, data: {
                estado: Estado_practica.REVISION_GENERAL
            }
        })
    }

}
