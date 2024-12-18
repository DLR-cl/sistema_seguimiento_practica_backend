import { BadRequestException, Injectable, InternalServerErrorException, NotAcceptableException, Logger } from "@nestjs/common";
import { createPracticaDto } from "./dto/create-practicas.dto";
import { DatabaseService } from "../../database/database/database.service";
import { PracticaInfo, PracticaResponseDto } from "./dto/practica-response.dto";
import { AlumnoPracticaService } from "../alumno_practica/alumno_practica.service";
import { Estado_informe, Estado_practica, Practicas, TipoPractica } from "@prisma/client";
import { Cron, CronExpression } from "@nestjs/schedule";
import { MailService } from "src/mail/mail.service";
import { SendEmailDto } from "src/mail/dto/mail.dto";
import { obtenerInformesAlumnoPractica } from "@prisma/client/sql";
import { CreateInformeConfidencialDto } from "../informe-confidencial/dto/create-informe-confidencial.dto";

@Injectable()
export class PracticasService {
    private readonly logger = new Logger(PracticasService.name);
    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _alumnoService: AlumnoPracticaService,
        private readonly _emailService: MailService,
    ) { }

    public async generarPractica(practica: createPracticaDto) {
        try {
            // si ya existe una práctica definida
            if (await this.hayPracticaActiva(practica)) {
                throw new BadRequestException('El alumno aún se encuentra en una práctica');
            };

            const nuevaPractica = await this._databaseService.practicas.create({
                data: {
                    ...practica,
                    estado: Estado_practica.CURSANDO
                },
            });

            const response: PracticaResponseDto = new PracticaResponseDto(nuevaPractica);

            return response;

        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error
            } else {
                throw new InternalServerErrorException('Error interno');
            }
        }
    }

    public async hayPracticaActiva(practica: createPracticaDto) {
        const existePractica = await this._databaseService.practicas.findFirst({
            where: {
                id_alumno: practica.id_alumno,
                NOT: {
                    estado: Estado_practica.FINALIZADA
                }
            }
        });
        return existePractica
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
            const practicas = await this._databaseService.$queryRawTyped<PracticaInfo>(obtenerInformesAlumnoPractica());
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

            return practica;
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



    //@Cron('05 16 * * *')
    public async generarInformeConfidencial() {
        try {
            const findPracticas: any = await this._databaseService.practicas.findMany({
                where: {
                    estado: Estado_practica.ESPERA_INFORMES,
                    informe_confidencial: null,
                },
            });
            console.log(findPracticas)
            if (findPracticas.length != 0) {
                const informesConfidencial = await Promise.all(findPracticas.map(async (practica) => {

                    const informe = {
                        id_supervisor: practica.id_supervisor,
                        id_practica: practica.id_practica,
                        id_alumno_evaluado: practica.id_alumno,
                        fecha_inicio: practica.fecha_termino, // Fecha de término de la práctica
                        estado: Estado_informe.ESPERA
                    }

                    // Asegurarse de que ambas fechas son objetos Date antes de comparar
                    if (new Date() > new Date(informe.fecha_inicio)) {
                        // Si la fecha actual es posterior a la fecha de término de la práctica, genera el informe
                        return await this._databaseService.informeConfidencial.create({
                            data: informe,
                        });
                    }
                }));
            }
        } catch (error) {
            throw error;
        }
    }
    //@Cron('05 16 * * *')
    public async generarInformeAlumno() {
        try {
            const findPracticas: any = await this._databaseService.practicas.findMany({
                where: {
                    estado: Estado_practica.ESPERA_INFORMES,
                    informe_alumno: null,
                },
            });

            if (findPracticas.length != 0) {
                const informesConfidencial = await Promise.all(findPracticas.map(async (practica) => {

                    const informe = {
                        id_practica: practica.id_practica,
                        id_alumno: practica.id_alumno,
                        estado: Estado_informe.ESPERA,
                        fecha_inicio: practica.fecha_termino
                    }

                    // Asegurarse de que ambas fechas son objetos Date antes de comparar
                    if (new Date() > new Date(informe.fecha_inicio)) {
                        // Si la fecha actual es posterior a la fecha de término de la práctica, genera el informe
                        return await this._databaseService.informesAlumno.create({
                            data: informe,
                        });
                    }
                }));

                return this._databaseService.informeConfidencial.findMany();
            }
            return {}

        } catch (error) {
            throw error;
        }
    }

    // finalizar practica automaticamente
    //@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    // @Cron('50 15 * * *')
    public async actualizarEstadoPracticas(): Promise<void> {
      try {
        // Obtener las prácticas que aún no están finalizadas y cuya fecha de término ya pasó
        const practicasPorFinalizar = await this._databaseService.practicas.findMany({
          where: {
            estado: { not: Estado_practica.FINALIZADA },
            fecha_termino: { lt: new Date() },
          },
        });
  
        if (practicasPorFinalizar.length === 0) {
          this.logger.log('No hay prácticas que necesiten ser finalizadas.');
          return;
        }
  
        // Actualizar el estado de las prácticas
        const updates = practicasPorFinalizar.map((practica) => 
          this._databaseService.practicas.update({
            where: { id_practica: practica.id_practica },
            data: { estado: Estado_practica.ESPERA_INFORMES },
          })
        );
  
        await Promise.all(updates);
  
        this.logger.log(
          `Se actualizaron ${practicasPorFinalizar.length} prácticas a estado ESPERA_INFORMES.`
        );
      } catch (error) {
        this.logger.error('Error al actualizar el estado de las prácticas.', error);
      }
    }
  

}
