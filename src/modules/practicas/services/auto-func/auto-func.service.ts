import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../../database/database/database.service';
import { Estado_informe, Estado_practica } from '@prisma/client';

@Injectable()
export class AutoFuncService {
    private readonly logger = new Logger(AutoFuncService.name);

    constructor(
        private readonly _databaseService: DatabaseService,
    ) { }

    // finalizar practica automaticamente
    //@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    // @Cron('50 15 * * *')
    public async actualizarEstadoPracticas(): Promise<void> {
        try {
            // Obtener las prácticas que están en estado CURSANDO y cuya fecha de término ya pasó
            const practicasPorFinalizar = await this._databaseService.practicas.findMany({
                where: {
                    estado: Estado_practica.CURSANDO,
                    fecha_termino: { lt: new Date() }, // Fecha de término anterior a la fecha actual
                },
            });

            if (practicasPorFinalizar.length === 0) {
                this.logger.log('No hay prácticas que necesiten ser finalizadas.');
                return;
            }

            // Actualizar el estado de las prácticas a ESPERA_INFORMES
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
}
