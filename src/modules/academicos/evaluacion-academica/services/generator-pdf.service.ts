import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { DatabaseService } from 'src/database/database/database.service';
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

    async generatePdf(id_practica: number, id_informe_evaluativo: number, id_docente: number): Promise<ArrayBufferLike> {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage()

        const srcBasePath = path.resolve(__dirname, '../../../../../../src/modules/academicos/evaluacion-academica');
        const logoUtaPath = path.join(srcBasePath, 'icon/logo-uta.png');
        const logoIngenieriaPath = path.join(srcBasePath, 'icon/logo-iici.webp');
        const templatePath = path.join(srcBasePath, 'services/pdf.html');



        const practica = await this._databaseService.practicas.findUnique({
            where: { id_practica: id_practica }
        });

        if (!practica) {
            throw new BadRequestException('Error, no existe la practica seleccionada');
        }

        const datosIdentificacion: IdentificacionInterface = await this.obtenerDatos(id_practica, id_docente);
        const datosRespuesta: FormatoRespuestaEvaluativaInterface[] = await this.obtenerRespuestas(id_informe_evaluativo);

        const dataIdentificacionHTML = {
            logoUtaBase64: fs.readFileSync(logoUtaPath, 'base64'),
            logoIngenieriaBase64: fs.readFileSync(logoIngenieriaPath, 'base64'),
            nombreAlumno: datosIdentificacion.nombre_alumno,
            empresa: datosIdentificacion.nombre_empresa,
            tipoPractica: datosIdentificacion.tipo_practica,
            profesorRevisor: datosIdentificacion.profesor_revisor,
            respuestas: datosRespuesta,
            fechaRevision: new Date()
        }
        console.log(datosRespuesta)
        Handlebars.registerHelper('getFromList', function (list, index, attr) {
            if (Array.isArray(list) && list[index] !== undefined) {
                return list[index][attr];
            }
            return ''; // Devuelve vacío si no encuentra el atributo
        });


        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
        const template = Handlebars.compile(htmlTemplate);
        const htmlContent = template(dataIdentificacionHTML);
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        console.log('Ruta de pdf.html:', templatePath);

        const pdfBuffer = await page.pdf({ format: 'A4' });
        await browser.close();
        console.log('Tamaño del PDF Buffer:', pdfBuffer.length);

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

