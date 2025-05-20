import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Estado_informe, Estado_practica } from '@prisma/client';
import { DatabaseService } from 'database/database/database.service';
import { Informe } from 'modules/informe_alumno/dto/informe_pdf.dto';
import * as fs from 'fs';

@Injectable()
export class ValidacionInformeAlumnoService {
    constructor(
        private readonly _databaseService: DatabaseService
    ) { }

    async validarInforme(data: Informe) {
        // Validar que el alumno existe
        const existeAlumno = await this._databaseService.alumnosPractica.findUnique({
            where: {
                id_user: +data.id_alumno
            }
        });

        if (!existeAlumno) {
            throw new NotFoundException(`No se encontró un alumno con el ID ${data.id_alumno}`);
        }

        // Validar si existe un informe en corrección
        return await this.validarInformeEnCorreccion(data.id_alumno);


    }

    private async validarInformeEnCorreccion(id_alumno: number) {
        // Si hay informe en correción, significa que hay informe anterior.
        const informeEnCorreccion = await this._databaseService.informesAlumno.findFirst({
            where: {
                id_alumno: +id_alumno,
                estado: Estado_informe.CORRECCION
            }
        });

        if (informeEnCorreccion?.archivo) {
            try {
                // Verificar si el archivo existe
                if (fs.existsSync(informeEnCorreccion.archivo)) {
                    // Eliminar el archivo
                    fs.unlinkSync(informeEnCorreccion.archivo);
                    console.warn(`Archivo anterior eliminado: ${informeEnCorreccion.archivo}`);
                    // Si hay informe, por lo tanto se elimino.
                    return true;
                }
            } catch (deleteError) {
                console.error(
                    `Error al intentar eliminar el archivo anterior (${informeEnCorreccion.archivo}):`,
                    deleteError
                );
                throw new Error(`Error al eliminar el archivo anterior: ${deleteError.message}`);
            }
        }
        // No hay informe anterior
        return false;
    }

    async obtenerPractica(id_informe: number) {
        const practica = await this._databaseService.practicas.findUnique({
            where: {
                id_practica: +id_informe
            }
        })


        return practica;
    }

}
