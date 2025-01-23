import { BadRequestException, Injectable, InternalServerErrorException, NotAcceptableException, Logger, HttpStatus } from "@nestjs/common";
import { createPracticaDto } from "./dto/create-practicas.dto";
import { DatabaseService } from "../../database/database/database.service";
import { PracticaDetalle, PracticaResponseDto } from "./dto/practica-response.dto";
import { AlumnoPracticaService } from "../alumno_practica/alumno_practica.service";
import { Estado_informe, Estado_practica, Practicas, TipoPractica } from "@prisma/client";
import { Cron, CronExpression } from "@nestjs/schedule";
import { MailService } from "../../mail/mail.service";
import { SendEmailDto } from "../../mail/dto/mail.dto";
import { obtenerInformesAlumnoPractica } from "@prisma/client/sql";
import { CreateInformeConfidencialDto } from "../informe-confidencial/dto/create-informe-confidencial.dto";

@Injectable()
export class PracticasService {
    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _alumnoService: AlumnoPracticaService,
        private readonly _emailService: MailService,
    ) { }

    public async generarPractica(practica: createPracticaDto) {
        try {
            // si ya existe una práctica definida
            const alumno = await this._databaseService.alumnosPractica.findUnique({
                where: { id_user: practica.id_alumno },
                select: { primer_practica: true, segunda_practica: true }
            });

            if (alumno.primer_practica && practica.tipo_practica == TipoPractica.PRACTICA_UNO) {
                throw new BadRequestException('El alumno ya se encuentra cursando la practica uno.')
            }

            if (alumno.segunda_practica && practica.tipo_practica == TipoPractica.PRACTICA_DOS) {
                throw new BadRequestException('El alumno ya se encuentra cursando la segunda practica.')
            }

            if (practica.fecha_termino <= practica.fecha_inicio) {
                throw new BadRequestException('La fecha de término debe ser posterior a la fecha de inicio.');
            }

            if (practica.cantidad_horas < practica.horas_semanales) {
                throw new BadRequestException('La cantidad de horas totales no puede ser menor a las horas semanales.');
            }

            const nuevaPractica = await this._databaseService.practicas.create({
                data: {
                    ...practica,
                    estado: Estado_practica.CURSANDO,
                },
                include: {
                    alumno: true, // Relación con el modelo de alumnos
                    jefe_supervisor: true, // Relación con el modelo de supervisores
                },
            });
            await this._databaseService.alumnosPractica.update({
                where: { id_user: nuevaPractica.id_alumno },
                data: { primer_practica: true, segunda_practica: true }
            })

            return new PracticaResponseDto(nuevaPractica);



        } catch (error) {
            console.error('Error al generar la práctica:', error.message);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Error interno al generar la práctica.');
        }
    }

    public async existePractica(id_practica: number) {
        const existePractica = await this._databaseService.practicas.findUnique({
            where: {
                id_practica: id_practica,
            }
        });

        if (!existePractica) {
            return false;
        }
        return true;
    }

    public async activarPractica(id_alumno: number, tipo_practica: TipoPractica) {

        try {
            const activacion = await this._alumnoService.activarPractica(id_alumno, tipo_practica);
            return activacion;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Error interno al activar la practica');
        }
    }

    public async cambiarEstadoPractica(id_practica: number, estado_nuevo: Estado_practica) {
        const practica = await this._databaseService.practicas.update({
            where: {
                id_practica: id_practica,
            },
            data: {
                estado: estado_nuevo
            }
        });
    }

    public async getPracticasActivas() {
        try {
            const practicas = await this._databaseService.practicas.findMany({
                where: {
                    NOT: {
                        estado: Estado_practica.FINALIZADA,
                    }
                }
            });

            return practicas;

        } catch (error) {

        }
    }

    public async getAllPracticas() {
        try {
            const practicas = await this._databaseService.$queryRawTyped<PracticaDetalle>(obtenerInformesAlumnoPractica());
            return practicas
        } catch (error) {
            throw error;
        }
    }

    public async getPractica(id_practica: number) {
        try {
            if (!await this.existePractica(id_practica)) {
                throw new BadRequestException('No existe practica solicitada')
            }

            const practica = await this._databaseService.practicas.findUnique({
                where: {
                    id_practica: id_practica,
                },
                include: {
                    informe_alumno: {
                        include: {
                            alumno: {
                                include: {
                                    usuario: {
                                        select: {
                                            nombre: true,
                                            correo: true,
                                        }
                                    },
                                }
                            }
                        }
                    },
                    informe_confidencial: {
                        include: {
                            supervisor: {
                                include: {
                                    usuario: {
                                        select: {
                                            nombre: true,
                                            correo: true,
                                            rut: true,
                                        }
                                    },
                                    empresa: true
                                }
                            }
                        }
                    },
                }
            });

            const alumno = await this._databaseService.alumnosPractica.findUnique({
                where: {id_user: practica.id_alumno },
                include: {
                    usuario: {select: { nombre: true }}
                }
            });

            const supervisor = await this._databaseService.jefesAlumno.findUnique({
                where: { id_user: practica.id_supervisor },
                include: {
                    empresa: true,
                    usuario: true,
                }
            });



            const datos_extra = {
                ...practica,
                nombre_empresa: supervisor.empresa.nombre_razon_social,
                nombre_supervisor: supervisor.usuario.nombre,
                nombre_alumno: alumno.usuario.nombre
            }

            return datos_extra;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
        }
    }

    // agregar

    public async esPracticaAlumno(id_pract: number) {
        return await this._databaseService.practicas.findFirst({
            where: {
                id_practica: id_pract,
                estado: Estado_practica.ESPERA_INFORMES
            }
        })
    }

    public async alumnoHabilitadoEnviarInforme(id_alumno: number) {
        const actualDate = new Date();
        // buscar practica de un alumno cuya practica esté finalizada
        const practica = await this._databaseService.practicas.findFirst({
            where: {
                fecha_termino: {
                    lt: actualDate
                },
                id_alumno: id_alumno,
            }
        });
        // 
        if (!practica) {
            return false;
        }
        return true;
    }

    public async getPracticaAlumno(id_alumno: number) {
        try {
            const practicas = await this._databaseService.practicas.findMany({
                where: {
                    id_alumno: id_alumno,
                }
            })
            return practicas
        } catch (error) {
            throw error;
        }
    }

    public async extenderPractica(id_practica: number, fecha_fin_ext: Date){
        // buscar si el estado de la practica

        const practica = await this._databaseService.practicas.findUnique({
            where: { id_practica: id_practica },
            include: { 
                informe_alumno: true,
                informe_confidencial: true,
            }
        });
        if(!practica){
            throw new BadRequestException(`Error, la práctica con id ${id_practica} no existe`);
        }

        if(new Date(fecha_fin_ext) <= new Date(practica.fecha_termino)){
            throw new BadRequestException('Error, la fecha de extensión debe ser después de la fecha de termino')
        }
        if(practica.estado == Estado_practica.ESPERA_INFORMES){
            // llamar funciones para borrar los informes (los informes ya existen)
            await this.borrarInformes(practica.informe_alumno.id_informe, practica.informe_confidencial.id_informe_confidencial);

            const actPractica = await this._databaseService.practicas.update({
                where: {id_practica: id_practica },
                data: { fecha_termino: fecha_fin_ext}
            })

            return {
                message: `La practica ha sido extendida hasta ${fecha_fin_ext}`,
                data: actPractica
            }

        }else if(practica.estado == Estado_practica.CURSANDO){
            // editar fecha de termino
            const actPractica = await this._databaseService.practicas.update({
                where: {id_practica: id_practica },
                data: { fecha_termino: fecha_fin_ext}
            })

            return {
                message: `La practica ha sido extendida hasta ${fecha_fin_ext}`,
                data: actPractica
            }
        }else {
            // una practia en revision para adelante no se puede editar o extender
            throw new BadRequestException('Las practicas solo se pueden extender antes del periodo de espera de informes');
        }


    }

    private async borrarInformes(id_informe_al: number, id_informe_conf: number){
        await this._databaseService.informeConfidencial.delete({
            where: { id_informe_confidencial: id_informe_conf }
        });

        await this._databaseService.informesAlumno.delete({
            where: {id_informe: id_informe_al }
        });
    }

    async eliminarPractica(id_practica: number){
        const practica = await this._databaseService.practicas.findUnique({
            where: { id_practica }
        });

        if(!practica){
            throw new BadRequestException('Error, la práctica no existe');
        }
        // asegurarse que la practica no esté con informes
    
        await this._databaseService.practicas.delete({
            where: {id_practica}
        });

        await this._databaseService.alumnosPractica.update({
            where: {id_user: practica.id_alumno },
            data: {
                primer_practica: false,
                segunda_practica: false,
            }
        })

        return {
            message: 'Practica eliminada con éxito',
            status: HttpStatus.OK,
        }
    }
}
