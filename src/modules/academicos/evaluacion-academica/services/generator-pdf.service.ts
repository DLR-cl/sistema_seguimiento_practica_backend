import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import chromium from '@sparticuz/chrome-aws-lambda';
import puppeteer from 'puppeteer-core';
import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import { DatabaseService } from '../../../../database/database/database.service';
import { FormatoRespuestaEvaluativaInterface } from '../interface/responseRespuesta.interface';
import { IdentificacionInterface } from '../interface/identificacion.interface';

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
        let executablePath: string | undefined;
        let args: string[] = [];
        let headless: boolean = true;
    
        // Detectar entorno para configurar Puppeteer
        if (process.env.AWS_EXECUTION_ENV) {
          // Entorno serverless
          executablePath = await chromium.executablePath;
          args = chromium.args;
          headless = chromium.headless;
        } else {
          // Entorno local
          const puppeteerLocal = require('puppeteer'); // Requiere Puppeteer estándar
          executablePath = (await puppeteerLocal.launch()).executablePath();
          args = ['--no-sandbox', '--disable-setuid-sandbox'];
        }
    
        try {
          // Lanzar navegador
          const browser = await puppeteer.launch({ args, executablePath, headless });
          const page = await browser.newPage();
    
          // Preparar rutas de recursos
          const srcBasePath = path.resolve(
            __dirname,
            '../../../../../../src/modules/academicos/evaluacion-academica'
          );
          const logoUtaPath = path.join(srcBasePath, 'icon/logo-uta.png');
          const logoIngenieriaPath = path.join(srcBasePath, 'icon/logo-iici.webp');
          const templatePath = path.join(srcBasePath, 'services/pdf.html');
    
          if (!fs.existsSync(templatePath)) {
            throw new BadRequestException('No se encontró la plantilla HTML para generar el PDF.');
          }
    
          const logoUtaBase64 = fs.existsSync(logoUtaPath) ? fs.readFileSync(logoUtaPath, 'base64') : '';
          const logoIngenieriaBase64 = fs.existsSync(logoIngenieriaPath)
            ? fs.readFileSync(logoIngenieriaPath, 'base64')
            : '';
    
          // Obtener datos desde la base de datos
          const practica = await this._databaseService.practicas.findUnique({ where: { id_practica } });
          if (!practica) {
            throw new BadRequestException('Error, no existe la práctica seleccionada.');
          }
    
          const datosIdentificacion = await this.obtenerDatos(id_practica, id_docente);
          const datosRespuesta = await this.obtenerRespuestas(id_informe_evaluativo);
          const aprobacion = this.estadoAprobacion(datosRespuesta);
    
          // Preparar datos para la plantilla HTML
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
          this.registerHandlebarsHelpers();
    
          // Compilar plantilla HTML
          const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
          const template = Handlebars.compile(htmlTemplate);
          const htmlContent = template(dataIdentificacionHTML);
    
          // Renderizar contenido en Puppeteer
          await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
          // Generar el PDF
          const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    
          // Cerrar el navegador
          await browser.close();
    
          return pdfBuffer;
        } catch (error) {
          console.error('Error al generar el PDF:', error);
          throw new InternalServerErrorException('No se pudo generar el PDF.');
        }
      }
    
      private registerHandlebarsHelpers() {
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

