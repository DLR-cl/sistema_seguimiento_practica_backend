import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../database/database/database.service';
import { CreateAcademicoDto } from './dto/create-academicos.dto';
import { Estado_informe, Estado_practica, PrismaClient, Tipo_usuario, TipoPractica } from '@prisma/client';
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
    ) { }

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

    async getReprobadosYAprobadosByAcademico(id_academico: number) {
        try {
            // Obtener el año actual
            const currentYear = new Date().getFullYear();
            const inicioAnio = new Date(`${currentYear}-01-01`);
            const finAnio = new Date(`${currentYear}-12-31`);
    
            // Consultar informes de alumno asociados al académico y al año actual
            const informesAlumno = await this._databaseService.informesAlumno.findMany({
                where: {
                    id_academico, // Filtrar por académico
                    fecha_termino_revision: {
                        gte: inicioAnio, // Desde el inicio del año actual
                        lte: finAnio,    // Hasta el final del año actual
                    },
                },
                select: {
                    estado: true,
                    practica: {
                        select: {
                            tipo_practica: true, // Obtener el tipo de práctica
                        },
                    },
                },
            });
    
            const conteoPorPractica: Record<string, { aprobados: number; reprobados: number }> = {
                PRACTICA_UNO: { aprobados: 0, reprobados: 0 },
                PRACTICA_DOS: { aprobados: 0, reprobados: 0 },
            };
    
            informesAlumno.forEach((informe) => {
                const tipoPractica = informe.practica?.tipo_practica;
    
                // Asegurarse de que el tipo de práctica esté inicializado
                if (!conteoPorPractica[tipoPractica]) {
                    conteoPorPractica[tipoPractica] = {
                        aprobados: 0,
                        reprobados: 0,
                    };
                }
    
                // Contar aprobados y reprobados
                if (informe.estado === Estado_informe.APROBADA) {
                    conteoPorPractica[tipoPractica].aprobados += 1;
                } else if (informe.estado === Estado_informe.DESAPROBADA) {
                    conteoPorPractica[tipoPractica].reprobados += 1;
                }
            });
    
            return conteoPorPractica;
        } catch (error) {
            console.error('Error al obtener reprobados y aprobados:', error);
            throw new InternalServerErrorException(
                'Error al obtener los reprobados y aprobados por práctica.',
            );
        }
    }
    

    async getInformesPorMesYPractica(id_academico: number) {
        try {
            const currentYear = new Date().getFullYear();
            const menor = new Date(`${currentYear}-01-01`);
            const mayor = new Date(`${currentYear}-12-31`);
    
            // Consultar informes de alumno asociados al académico en el año actual
            const informesAlumno = await this._databaseService.informesAlumno.findMany({
                where: {
                    id_academico,
                    fecha_termino_revision: {
                        gte: menor, // Desde el inicio del año actual
                        lte: mayor, // Hasta el final del año actual
                    },
                },
                select: {
                    estado: true,
                    fecha_termino_revision: true, // Fecha de término para determinar el mes
                    practica: {
                        select: {
                            tipo_practica: true, // Obtener el tipo de práctica
                        },
                    },
                },
            });
    
            // Meses definidos con inicialización
            const meses = [
                { nombre: 'enero', valor: 1 },
                { nombre: 'febrero', valor: 2 },
                { nombre: 'marzo', valor: 3 },
                { nombre: 'abril', valor: 4 },
                { nombre: 'mayo', valor: 5 },
                { nombre: 'junio', valor: 6 },
                { nombre: 'julio', valor: 7 },
                { nombre: 'agosto', valor: 8 },
                { nombre: 'septiembre', valor: 9 },
                { nombre: 'octubre', valor: 10 },
                { nombre: 'noviembre', valor: 11 },
                { nombre: 'diciembre', valor: 12 },
            ];
    
            // Inicializar el conteo por mes y práctica
            const conteoPorMes: Record<string, Record<string, number>> = {};
            meses.forEach((mes) => {
                conteoPorMes[mes.nombre] = {
                    PRACTICA_UNO: 0,
                    PRACTICA_DOS: 0,
                };
            });
    
            // Procesar los informes
            informesAlumno.forEach((informe) => {
                const fecha = new Date(informe.fecha_termino_revision); // Usar fecha_termino_revision en lugar de fecha_inicio
                const mesNumero = fecha.getMonth() + 1; // Mes en base 1
                const mesNombre = meses.find((mes) => mes.valor === mesNumero)?.nombre;
    
                if (mesNombre) {
                    const tipoPractica = informe.practica?.tipo_practica;
    
                    // Incrementar el conteo para el tipo de práctica
                    if (tipoPractica) {
                        conteoPorMes[mesNombre][tipoPractica] += 1;
                    }
                }
            });
    
            return conteoPorMes;
        } catch (error) {
            console.error('Error al obtener informes por mes y práctica:', error);
            throw new InternalServerErrorException(
                'Error al obtener los informes por mes y práctica.',
            );
        }
    }

    async reprobarPractica(id_practica: number) {
        // Verificar si la práctica existe
        const practica = await this._databaseService.practicas.findUnique({
            where: { id_practica },
        });
    
        if (!practica) {
            throw new BadRequestException('Práctica no encontrada');
        }
    
        // Actualizar el estado de la práctica
        await this._databaseService.practicas.update({
            where: { id_practica },
            data: { estado: Estado_practica.FINALIZADA },
        });
    
        // Ejecutar actualizaciones de informes en paralelo
        await Promise.all([
            (async () => {
                const informeAlumno = await this._databaseService.informesAlumno.findUnique({
                    where: { id_practica },
                });
                if (informeAlumno) {
                    await this._databaseService.informesAlumno.update({
                        where: { id_practica },
                        data: { estado: Estado_informe.DESAPROBADA },
                    });
                }
            })(),
            (async () => {
                const informeConfidencial = await this._databaseService.informeConfidencial.findUnique({
                    where: { id_practica },
                });
                if (informeConfidencial) {
                    await this._databaseService.informeConfidencial.update({
                        where: { id_practica },
                        data: { estado: Estado_informe.DESAPROBADA },
                    });
                }
            })(),
        ]);
    
        return {
            message: 'Práctica desaprobada con éxito',
            statusCode: HttpStatus.OK,
        };
    }
    
    
 }
