import { BadRequestException, Injectable } from '@nestjs/common';
import { Client } from 'basic-ftp';
import { Informe } from 'modules/informe_alumno/dto/informe_pdf.dto';
import * as fs from 'fs';
import * as path from 'path';
import { DatabaseService } from 'database/database/database.service';
import { Estado_informe } from '@prisma/client';

@Injectable()
export class AlmacenamientoInformeService {

    constructor(
        private readonly _databaseService: DatabaseService
    ) { }

    private crearDirectorioSiNoExiste(dirPath: string) {
        if (!fs.existsSync(dirPath)) {
            try {
                fs.mkdirSync(dirPath, { recursive: true });
            } catch (error) {
                console.error(`Error al crear el directorio ${dirPath}:`, error);
                throw new Error(`No se pudo crear el directorio ${dirPath}: ${error.message}`);
            }
        }
    }

    // función que almacena el informe en local
    async almacenarInforme(file: Express.Multer.File, data: Informe, rootPath: string) {
        try {
            const estadoInforme = await this.verificarEstadoInforme(data);
            if(estadoInforme !== Estado_informe.CORRECCION && estadoInforme !== Estado_informe.ESPERA) {
                throw new BadRequestException('El informe no se puede almacenar porque está en estado CORRECCIÓN o ESPERA');
            }

            // Asegurar que el directorio base existe
            this.crearDirectorioSiNoExiste(rootPath);

            // Obtener el año actual
            const currentYear = new Date().getFullYear();
            
            // Determinar el semestre actual (1 o 2)
            const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11
            const currentSemester = currentMonth <= 6 ? 1 : 2;

            // Crear la estructura de directorios
            const yearPath = path.join(rootPath, currentYear.toString());
            const semesterPath = path.join(yearPath, `Semestre ${currentSemester}`);
            const practiceTypePath = path.join(semesterPath, 
                data.tipo_practica === 'PRACTICA_UNO' ? 'Primer Practica' : 'Segunda Practica');
            const studentPath = path.join(practiceTypePath, data.nombre_alumno);

            // Crear los directorios si no existen
            this.crearDirectorioSiNoExiste(yearPath);
            this.crearDirectorioSiNoExiste(semesterPath);
            this.crearDirectorioSiNoExiste(practiceTypePath);
            this.crearDirectorioSiNoExiste(studentPath);

            // Generar nombre único para el archivo
            const timestamp = new Date().getTime();
            const fileName = `${data.nombre_alumno}_${timestamp}${path.extname(file.originalname)}`;
            const filePath = path.join(studentPath, fileName);

            // Guardar el archivo
            fs.writeFileSync(filePath, file.buffer);

            // Actualizar el path del informe en la base de datos
            await this.actualizarPathInforme(data, filePath);

            return {
                success: true,
                filePath: filePath,
                message: 'Archivo almacenado exitosamente'
            };
        } catch (error) {
            console.error('Error al almacenar el informe:', error);
            throw new Error('Error al almacenar el informe: ' + error.message);
        }
    }

    private async actualizarPathInforme(data: Informe, filePath: string) {
        // Actualizar el path del informe en la base de datos
        await this._databaseService.informesAlumno.update({
            where: { id_informe: +data.id_informe },
            data: { archivo: filePath }
        });

        // Actualizar el estado del informe en la base de datos
        await this.actualizarEstadoInforme(data);
    }

    private async actualizarEstadoInforme(data: Informe) {
        // Actualizar el estado del informe en la base de datos
        await this._databaseService.informesAlumno.update({
            where: { id_informe: +data.id_informe },
            data: { estado: Estado_informe.ENVIADA } // Para que el academico pueda revisar el informe.
        });
    }

    private async verificarEstadoInforme(data: Informe) {
        const informe = await this._databaseService.informesAlumno.findUnique({
            where: { id_informe: +data.id_informe }
        });
        
        return informe.estado;        
    }
}
