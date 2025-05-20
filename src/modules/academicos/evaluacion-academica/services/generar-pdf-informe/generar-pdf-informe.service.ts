import { Injectable } from '@nestjs/common';
import { DataEvaluacionInterface } from '../../interface/data-evaluacion-academica.interface';
import * as fs from 'fs';
import * as path from 'path';
import * as PdfPrinter from 'pdfmake';
import { DataGeneracionInformeService } from '../data-generacion-informe-pdf/data-generacion-informe.service';
const vfsFonts = require('pdfmake/build/vfs_fonts.js');

@Injectable()
export class GenerarPdfInformeService {

    constructor(
        private readonly _dataGeneracionInformeService: DataGeneracionInformeService
    ) {}

    async generarPdfInforme(idPractica: number): Promise<Buffer> {
        const dataEvaluacion = await this._dataGeneracionInformeService.obtenerInformeEvaluacionPractica(idPractica);
        // Cargar logos como base64
        const logoUtaPath = path.resolve(process.cwd(), 'assets/logo-uta.png');
        const logoUta = fs.readFileSync(logoUtaPath).toString('base64');
        const logoIiciPath = path.resolve(process.cwd(), 'assets/logo-ici.png');
        const logoIici = fs.readFileSync(logoIiciPath).toString('base64');

        // Usar fuente estándar Helvetica para evitar problemas de fuentes
        const fonts = {
            Helvetica: {
                normal: 'Helvetica',
                bold: 'Helvetica-Bold',
                italics: 'Helvetica-Oblique',
                bolditalics: 'Helvetica-BoldOblique'
            }
        };

        // Primeras 10 respuestas estan en tablas y las siguientes 3 son otro
        const printer = new PdfPrinter(fonts);

        // Construir las filas de la tabla de aspectos
        const aspectosRows = [];
        dataEvaluacion.respuestas.forEach(resp => {
            if (resp.aspecto === 'Estructura' || resp.aspecto === 'Formato') {
                resp.item.forEach((item, idx) => {
                    const cols = ['', '', '', '']; // T, R, S, D
                    if (item.respuesta === 'Total') cols[0] = 'X';
                    else if (item.respuesta === 'Regular') cols[1] = 'X';
                    else if (item.respuesta === 'Satisfactorio') cols[2] = 'X';
                    else if (item.respuesta === 'Deficiente') cols[3] = 'X';
                    aspectosRows.push([
                        idx === 0 ? { text: resp.aspecto, rowSpan: resp.item.length, alignment: 'center', margin: [0, 5] } : {},
                        item.nombre_item,
                        ...cols
                    ]);
                });
            }
        });

        // Obtener las respuestas para evaluación general del informe alumno
        const evaluacionGeneralAlumno = dataEvaluacion.respuestas.find(r => r.aspecto === 'Evaluación General Informe Alumno');
        const evaluacionGeneralConfidencial = dataEvaluacion.respuestas.find(r => r.aspecto === 'Evaluación General Informe Confidencial');
        const observaciones = dataEvaluacion.respuestas.find(r => r.aspecto === 'Observaciones Informe Evaluativo');

        // Definir el documento
        const docDefinition = {
            content: [
                {
                    columns: [
                        { image: `data:image/png;base64,${logoUta}`, width: 45 },
                        [
                            { text: 'UNIVERSIDAD DE TARAPACÁ\nArica – Chile', style: 'header', alignment: 'center' },
                            { text: 'Departamento de Ingeniería Industrial y de Sistemas\nJefatura Carrera de Ingeniería Civil Industrial', style: 'subheader', alignment: 'center' }
                        ],
                        { image: `data:image/webp;base64,${logoIici}`, width: 45, alignment: 'right' }
                    ]
                },
                { text: '\nEVALUACIÓN PRÁCTICA PROFESIONAL\nINGENIERÍA CIVIL INDUSTRIAL', style: 'title', alignment: 'center', fontSize: 12, margin: [0, 0, 0, 2] },
                { text: 'IDENTIFICACIÓN', style: 'sectionTitle', margin: [0, 6, 0, 3], fontSize: 10 },
                {
                    table: {
                        widths: ['25%', '35%', '20%', '20%'],
                        body: [
                            [
                                { text: 'Nombre del Alumno', bold: true, alignment: 'left', margin: [0, 6] },
                                { text: dataEvaluacion.nombre_alumno, colSpan: 3, alignment: 'left', margin: [0, 6] }, {}, {}
                            ],
                            [
                                { text: 'Empresa', bold: true, alignment: 'left', margin: [0, 6] },
                                { text: dataEvaluacion.empresa, alignment: 'left', margin: [0, 6] },
                                { text: 'Tipo de Práctica', bold: true, alignment: 'left', margin: [0, 6] },
                                { text: dataEvaluacion.tipo_practica, alignment: 'left', margin: [0, 6] }
                            ],
                            [
                                { text: 'Profesor Revisor', bold: true, alignment: 'left', margin: [0, 6] },
                                { text: dataEvaluacion.profesor_revisor, alignment: 'left', margin: [0, 6] },
                                { text: 'Fecha Revisión', bold: true, alignment: 'left', margin: [0, 6] },
                                { text: dataEvaluacion.fecha_revision ? new Date(dataEvaluacion.fecha_revision).toLocaleDateString() : '', alignment: 'left', margin: [0, 6] }
                            ]
                        ]
                    },
                    margin: [0, 0, 0, 10]
                },
                { text: 'EVALUACIÓN DEL INFORME', style: 'sectionTitle', margin: [0, 8, 0, 3], fontSize: 10 },
                { text: 'Aspectos de Forma y Estructura (marcar con una X):', italics: true, margin: [0, 0, 0, 3], fontSize: 8 },
                {
                    table: {
                        headerRows: 1,
                        widths: [40, '*', 20, 20, 20, 20, 20],
                        body: [
                            [
                                { text: 'Aspecto', style: 'tableHeader' },
                                { text: 'Ítem', style: 'tableHeader' },
                                { text: 'T', style: 'tableHeader' },
                                { text: 'R', style: 'tableHeader' },
                                { text: 'S', style: 'tableHeader' },
                                { text: 'D', style: 'tableHeader' }
                            ],
                            ...aspectosRows,
                        ]
                    }
                },
                { text: 'T: Total, R: Regular, S: Suficiente, D: Deficiente', alignment: 'right', italics: true, fontSize: 7, margin: [-2, 4, 0, 7] },
                { text: 'Evaluación General Informe Alumno (marcar con una X):', style: 'sectionTitle', margin: [0, 7, 0, 8], italics: true, fontSize: 9 },
                {
                    table: {
                        widths: ['*', 25, 25, 25, 25],
                        body: [
                            [
                                { text: 'Cumple con los Aspectos Mínimos Exigidos', bold: true, alignment: 'left', margin: [0, 8] },
                                { text: 'SÍ', alignment: 'center', style: 'cuadroSiNo', margin: [0, 8] },
                                { text: evaluacionGeneralAlumno?.item[0]?.respuesta?.toLowerCase() === 'si' ? 'X' : '', alignment: 'center', style: 'cuadroSiNo', margin: [0, 8] },
                                { text: 'NO', alignment: 'center', style: 'cuadroSiNo', margin: [0, 8] },
                                { text: evaluacionGeneralAlumno?.item[0]?.respuesta?.toLowerCase() === 'no' ? 'X' : '', alignment: 'center', style: 'cuadroSiNo', margin: [0, 8] }
                            ]
                        ],
                        heights: 25
                    },
                    layout: {
                        hLineWidth: function () { return 1; },
                        vLineWidth: function () { return 1; },
                        hLineColor: function () { return '#000'; },
                        vLineColor: function () { return '#000'; },
                        paddingLeft: function () { return 2; },
                        paddingRight: function () { return 2; },
                        paddingTop: function () { return 2; },
                        paddingBottom: function () { return 2; }
                    },
                    margin: [0, 0, 0, 10]
                },
                { text: 'EVALUACIÓN DEL INFORME CONFIDENCIAL', style: 'sectionTitle', margin: [0, 7, 0, 3], alignment: 'center', fontSize: 9 },
                { text: 'Evaluación General Informe Confidencial (marcar con una X):', style: 'sectionTitle', italics: true, margin: [0, 0, 0, 8], fontSize: 9 },
                {
                    table: {
                        widths: ['*', 25, 25, 25, 25],
                        body: [
                            [
                                { text: 'Cumple con los Aspectos Mínimos Exigidos', bold: true, alignment: 'left', margin: [0, 8] },
                                { text: 'SÍ', alignment: 'center', style: 'cuadroSiNo', margin: [0, 8] },
                                { text: evaluacionGeneralConfidencial?.item[0]?.respuesta?.toLowerCase() === 'si' ? 'X' : '', alignment: 'center', style: 'cuadroSiNo', margin: [0, 8] },
                                { text: 'NO', alignment: 'center', style: 'cuadroSiNo', margin: [0, 8] },
                                { text: evaluacionGeneralConfidencial?.item[0]?.respuesta?.toLowerCase() === 'no' ? 'X' : '', alignment: 'center', style: 'cuadroSiNo', margin: [0, 8] }
                            ]
                        ],
                        heights: 25
                    },
                    layout: {
                        hLineWidth: function () { return 1; },
                        vLineWidth: function () { return 1; },
                        hLineColor: function () { return '#000'; },
                        vLineColor: function () { return '#000'; },
                        paddingLeft: function () { return 2; },
                        paddingRight: function () { return 2; },
                        paddingTop: function () { return 2; },
                        paddingBottom: function () { return 2; }
                    },
                    margin: [0, 0, 0, 10]
                },
                { text: 'Observaciones u Otros Aspectos a Considerar.', bold: true, margin: [0, 7, 0, 0], fontSize: 9 },
                {
                    table: {
                        widths: ['*'],
                        body: [
                            [{ text: (observaciones?.item[0]?.respuesta && observaciones.item[0].respuesta.length > 0) ? observaciones.item[0].respuesta : '\n\n\n', border: [true, true, true, true] }]
                        ]
                    },
                    margin: [0, 0, 0, 10]
                },
                { text: '\n\nFirma Profesor Revisor', alignment: 'center', margin: [0, 18, 0, 0], italics: true, fontSize: 12 },
                {
                    text: [
                        'Avda. 18 Septiembre 2222 - Fono: 58-2205277 E-mail: ',
                        { text: 'ici@uta.cl', link: 'mailto:ici@uta.cl', color: 'blue', decoration: 'underline' },
                        ' Arica-Chile'
                    ],
                    alignment: 'center',
                    margin: [0, 7, 0, 0],
                    fontSize: 9,
                    italics: true
                }
            ],
            styles: {
                header: { fontSize: 10, bold: true },
                subheader: { fontSize: 8 },
                title: { fontSize: 14, bold: true },
                sectionTitle: { fontSize: 12, bold: true, decoration: 'underline' },
                tableHeader: { bold: true, fillColor: '#eeeeee', alignment: 'center' },
                cuadroSiNo: { fontSize: 11, bold: true, alignment: 'center' }
            },
            defaultStyle: {
                font: 'Helvetica',
                fontSize: 8
            },
            pageMargins: [72, 20, 72, 20]
        };

        // Crear el PDF y devolver el buffer
        return new Promise<Buffer>((resolve, reject) => {
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            const chunks = [];
            pdfDoc.on('data', chunk => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', err => reject(err));
            pdfDoc.end();
        });
    }
}
