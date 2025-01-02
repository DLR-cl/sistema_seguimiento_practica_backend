import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';
import { DatabaseService } from '../../../../database/database/database.service';
import { FormatoRespuestaEvaluativaInterface } from '../interface/responseRespuesta.interface';
import { obtenerRespuestasInformeEvaluativo } from '@prisma/client/sql';
import { IdentificacionInterface } from '../interface/identificacion.interface';
import { RespuestasInformeEvaluativo } from '../../dto/informe-evaluativo.dto';
import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';

@Injectable()
export class GeneratorPdfService {
    constructor(
        private readonly _databaseService: DatabaseService,
    ) { }


    async generatePdf(
        id_practica: number,
        id_informe_evaluativo: number,
        id_docente: number
    ): Promise<ArrayBufferLike> {
        // Obtener la ruta ejecutable de Chrome para entornos serverless
        const executablePath = await chromium.executablePath;

        const browser = await puppeteer.launch({
            args: chromium.args,
            executablePath,
            headless: chromium.headless,
        });

        const page = await browser.newPage();

        // Definir rutas y leer recursos
        const srcBasePath = path.resolve(
            __dirname,
            '../../../../../../src/modules/academicos/evaluacion-academica'
        );
        const logoUtaPath = path.join(srcBasePath,'icon/logo-uta.png');
        const logoIngenieriaPath = path.join(srcBasePath, 'icon/logo-iici.webp');
        const templatePath = path.join(srcBasePath, 'services/pdf.html');

        // Validar que los archivos existen
        if (!fs.existsSync(templatePath)) {
            throw new BadRequestException('No se encontró la plantilla HTML para generar el PDF.');
        }

        const logoUtaBase64 = fs.existsSync(logoUtaPath) ? fs.readFileSync(logoUtaPath, 'base64') : '';
        const logoIngenieriaBase64 = fs.existsSync(logoIngenieriaPath)
            ? fs.readFileSync(logoIngenieriaPath, 'base64')
            : '';

        // Obtener datos de la práctica
        const practica = await this._databaseService.practicas.findUnique({
            where: { id_practica },
        });

        if (!practica) {
            throw new BadRequestException('Error, no existe la práctica seleccionada.');
        }

        // Obtener datos adicionales
        const datosIdentificacion: IdentificacionInterface = await this.obtenerDatos(id_practica, id_docente);
        const datosRespuesta: FormatoRespuestaEvaluativaInterface[] = await this.obtenerRespuestas(id_informe_evaluativo);
        const aprobacion: boolean = this.estadoAprobacion(datosRespuesta);

        // Preparar datos para la plantilla
        const dataIdentificacionHTML = {
            logoUtaBase64,
            logoIngenieriaBase64,
            nombreAlumno: datosIdentificacion.nombre_alumno,
            empresa: datosIdentificacion.nombre_empresa,
            tipoPractica: datosIdentificacion.tipo_practica,
            profesorRevisor: datosIdentificacion.profesor_revisor,
            respuestas: datosRespuesta,
            fechaRevision: new Date().toISOString().split('T')[0],
            estadoAprobacion: aprobacion,
        };

        // Registrar helpers de Handlebars
        Handlebars.registerHelper('getFromList', function (list, index, attr) {
            if (Array.isArray(list) && list[index] !== undefined) {
                return list[index][attr];
            }
            return ''; // Devuelve vacío si no encuentra el atributo
        });

        Handlebars.registerHelper('equals', function (a, b, options) {
            return a === b ? options.fn(this) : options.inverse(this);
        });

        Handlebars.registerHelper('getFromListWithCondition', function (list, index, attr, conditionValue) {
            if (Array.isArray(list) && list[index] && list[index][attr] !== undefined) {
                return list[index][attr] === conditionValue ? 'X' : '';
            }
            return ''; // Devuelve vacío si el índice o el atributo no existen
        });

        // Compilar plantilla HTML con Handlebars
        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
        const template = Handlebars.compile(htmlTemplate);
        const htmlContent = template(dataIdentificacionHTML);

        // Renderizar contenido en Puppeteer
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Generar el PDF
        const pdfBuffer = await page.pdf({ format: 'a4', printBackground: true });

        // Cerrar el navegador
        await browser.close();

        return pdfBuffer;
    }


    private async obtenerDatos(id_practica: number, id_docente: number) {
        try {
            const practica = await this._databaseService.practicas.findUnique({
                where: { id_practica: id_practica },
                include: {
                    alumno: { include: { usuario: { select: { nombre: true } } } },
                    jefe_supervisor: {
                        include: {
                            usuario: { select: { nombre: true } },
                            empresa: true
                        }
                    },
                },
            });

            if (!practica) {
                throw new BadRequestException('Error, no existe la práctica del alumno');
            }

            const academico = await this._databaseService.academico.findUnique({
                where: { id_user: id_docente },
                include: {
                    usuario: {
                        select: {
                            nombre: true,
                        }
                    }
                }
            });

            const data: IdentificacionInterface = {
                nombre_alumno: practica.alumno.usuario.nombre,
                nombre_empresa: practica.jefe_supervisor.empresa.nombre_razon_social,
                tipo_practica: practica.tipo_practica,
                profesor_revisor: academico.usuario.nombre
            }
            return data;

        } catch (error) {

        }
    }

    private estadoAprobacion(respuestas: FormatoRespuestaEvaluativaInterface[]) {
        let aprobacion = true;
        for (let res of respuestas) {
            if (res.respuesta == 'Deficiente') {
                aprobacion = false
            };
        };

        return aprobacion;
    }
    private async obtenerRespuestas(id_informe_evaluativo: number) {
        try {

            if (
                !(await this._databaseService.informeEvaluacionAcademicos.findUnique({
                    where: { id_informe: id_informe_evaluativo }
                }))
            ) {
                throw new BadRequestException('Error, el informe evaluativo no existe');
            }

            const respuestas = await this._databaseService.respuestasInformeEvaluacion.findMany({
                where: {
                    informe_id: id_informe_evaluativo,
                },
                select: {
                    respuesta_texto: true,
                    pregunta_implementada: {
                        select: {
                            pregunta: {
                                select: {
                                    enunciado_pregunta: true,
                                    dimension: {
                                        select: {
                                            nombre: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            // Mapear al formato de la interfaz
            const formatoRespuestas: FormatoRespuestaEvaluativaInterface[] = respuestas.map((respuesta) => ({
                dimension: respuesta.pregunta_implementada?.pregunta?.dimension?.nombre || 'Sin Dimensión',
                pregunta: respuesta.pregunta_implementada?.pregunta?.enunciado_pregunta || 'Sin Pregunta',
                respuesta: respuesta.respuesta_texto || 'Sin Respuesta',
            }));

            return formatoRespuestas;

        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new InternalServerErrorException('Error interno al obtener las respuestas del informe evaluativo');
        }
    }


}

