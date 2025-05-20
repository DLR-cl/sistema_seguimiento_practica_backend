import { Injectable } from '@nestjs/common';
import { Estado_practica, TipoPractica } from '@prisma/client';
import { DatabaseService } from '../../../../database/database/database.service';
import { IDataResultadoPractica } from '../../../types/data-resultado-practica.interface';


@Injectable()
export class ResultadosPracticaService {
    constructor(
        private readonly _databaseService: DatabaseService
    ) { }


    // obtengo la práctica según el tipo de practica, la fecha de inicio y la fecha de fin
    async obtenerPracticas(tipo_practica: TipoPractica, fecha_inicio: Date, fecha_fin: Date): Promise<IDataResultadoPractica[]> {
        const practicas = await this._databaseService.practicas.findMany({
            where: {
                tipo_practica: tipo_practica,
                fecha_inicio: {
                    gte: fecha_inicio,
                    lte: fecha_fin
                },
                fecha_termino: {
                    gte: fecha_inicio,
                    lte: fecha_fin
                },
                estado: Estado_practica.FINALIZADA
            },
            include: {
                alumno: {
                    include: {
                        usuario: true
                    }
                },
                jefe_supervisor: {
                    include: {
                        usuario: true,
                        empresa: true
                    }
                },
                informe_alumno: true
            },
        });

        const resultados: IDataResultadoPractica[] = practicas.map(practica => ({
            ...practica,
            alumno: {
                ...practica.alumno,
                usuario: {
                    id_user: practica.alumno.usuario.id_usuario,
                    correo: practica.alumno.usuario.correo,
                    nombre: practica.alumno.usuario.nombre,
                    rut: practica.alumno.usuario.rut
                }
            },
            jefe_supervisor: {
                ...practica.jefe_supervisor,
                usuario: {
                    id_user: practica.jefe_supervisor.usuario.id_usuario,
                    correo: practica.jefe_supervisor.usuario.correo,
                    nombre: practica.jefe_supervisor.usuario.nombre,
                    rut: practica.jefe_supervisor.usuario.rut
                }
            }
        }));

        return resultados;
    }
}