import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../database/database/database.service';
import { CreateAcademicoDto } from './dto/create-academicos.dto';
import { Estado_informe, PrismaClient, Tipo_usuario, TipoPractica } from '@prisma/client';
import { CantidadInformesPorAcademico } from './dto/cantidad-informes.dto';
import { obtenerAcademico, obtenerCantidadInformes } from '@prisma/client/sql'
import { UsersService } from '../users/users.service';
import { Academico } from './dto/academico.dto';
import { extname, join, resolve } from 'path';
import * as fs from 'fs';

import { CrearInformeCorreccion } from './dto/create-correccion-informe.dto';
import { EmailAvisosService } from '../email-avisos/email-avisos.service';
import { Client } from 'basic-ftp';
import { Readable } from 'stream';
@Injectable()
export class AcademicosService {
    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _userService: UsersService,
        private readonly _emailAvisosService: EmailAvisosService
    ) {

    }

    public async obtenerAcademicos() {
        try {
            const academicos = await this._databaseService.usuarios.findMany({
                select: {
                    id_usuario: true,
                    nombre: true,
                    rut: true,
                    correo: true,
                },
                where: {
                    OR: [
                        { tipo_usuario: Tipo_usuario.ACADEMICO },
                        { tipo_usuario: Tipo_usuario.JEFE_CARRERA },
                        { tipo_usuario: Tipo_usuario.JEFE_DEPARTAMENTO }
                    ]
                }
            });

            return academicos
        } catch (error) {
            throw error;
        }
    }
    public async obtenerAcademico(id_academico: number) {
        try {
            if (!this.existeAcademico(id_academico)) {
                throw new BadRequestException('Academico no existe')
            }

            const academico = await this._databaseService.$queryRawTyped<Academico>(obtenerAcademico(id_academico))
            return academico;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Error interno al obtener al academico')
        }
    }
    public async crearAcademico(academico: CreateAcademicoDto) {
        try {
            const usuario = await this._userService.signUp({ ...academico })

            const nuevoAcademico = await this._databaseService.academico.create({
                data: {
                    id_user: usuario.id_usuario,
                }
            });

            return {
                message: 'Academico creado con éxito',
                statusCode: HttpStatus.OK,
                data: usuario
            }

        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw error;
        }
    };

    public async existeAcademico(id_academico: number) {
        const academico = await this._databaseService.academico.findUnique({
            where: {
                id_user: id_academico,
            }
        });

        if (academico!) {
            return false;
        }
        return true;
    }

    public async cantidadInformesPorAcademico() {
        try {
            const resultados = await this._databaseService.$queryRawTyped<CantidadInformesPorAcademico>(obtenerCantidadInformes())
            const datosConvertidos = resultados.map((resultado) => ({
                ...resultado,
                cantidad_informes: Number(resultado.cantidad_informes),
            }));

            return datosConvertidos;
        } catch (error) {
            throw error;
        }
    }
    // despues crear dto y el pepe setch
    async subirCorreccion(file: Express.Multer.File, data: CrearInformeCorreccion, rootPath: string) {
        const client = new Client();
        client.ftp.verbose = true;
        let remoteFilePath: string;
        console.log(data);
        try {
            await client.access({
                host: process.env.HOST_FTP,
                port: +process.env.PORT_FTP,
                user: process.env.USER_FTP,
                password: process.env.PASSWORD_FTP,
                secure: false,
            });


            const practicaFolder =
                data.tipo_practica === 'PRACTICA_UNO'
                    ? `/informes-practica-uno/correccion-academicos`
                    : `/informes-practica-dos/correccion-academicos`;

            const remoteFileName = `informe-correccion-${data.nombre_alumno.replace(/\s+/g, '-')}.pdf`;
            remoteFilePath = `${practicaFolder}/${remoteFileName}`;
            // Crea la carpeta remota si no existe
            try {
                await client.ensureDir(practicaFolder);
                console.log(`Directorio remoto asegurado: ${practicaFolder}`);
            } catch (err) {
                console.warn(`El directorio remoto ya existe o no pudo ser creado: ${err.message}`);
            }

            const existeInforme = await this._databaseService.informeEvaluacionAcademicos.findUnique({
                where: {
                    id_informe: +data.id_informe_evaluativa,
                }
            });

            console.log(existeInforme)
            if (!existeInforme) {
                console.log('informe no existe')
                throw new BadRequestException('Solo se puede enviar una vez la corrección');
            }

            // Verifica si el académico tiene permisos
            if (existeInforme.id_academico !== +data.id_academico) {
                throw new UnauthorizedException('No posee permisos suficientes para enviar una corrección');
            }

            // actualiza
            const stream = Readable.from(file.buffer)
            await client.uploadFrom(stream, remoteFilePath);

            const informe = await this._databaseService.informesAlumno.update({
                where: {
                    id_informe: +data.id_informe_alumno,
                    id_academico: +data.id_academico,
                },
                data: {
                    archivo_correccion: remoteFilePath,
                }
            });
            console.log(informe);
            // this._emailAvisosService.notificacionCorreccionInforme(informe.id_alumno, informe.id_informe)
            return {
                message: 'tamos bien',
                informe: informe
            };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
                throw error;
            }
            if (remoteFilePath) {
                try {
                    await client.remove(remoteFilePath);
                    console.warn(`Archivo eliminado del FTP: ${remoteFilePath}`);
                } catch (deleteError) {
                    console.error('Error al intentar eliminar el archivo del FTP:', deleteError);
                }
            }
            console.error(error);
            throw new InternalServerErrorException('Error interno al subir un archivo');
        }finally {
            client.close();
        }
    } 

    async getArchivo(id_informe: number) {
        // Obtener el informe por ID
        const informe = await this.getInformePorId(id_informe);

        if (!informe || !informe.archivo_correccion) {
            throw new NotFoundException('No se encontró el informe del alumno');
        }

        // La ruta completa ya está almacenada en informe.archivo_informe
        const filePath = resolve(informe.archivo_correccion);

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

 }
