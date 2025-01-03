import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Client } from 'basic-ftp';
import { DatabaseService } from '../../../../database/database/database.service';
import { AnaliticaService } from '../../../dashboard/services/analitica.service';
import { EvaluacionInforme } from '../interface/responseRespuesta.interface';
import { Response } from 'express';
import { TipoPractica } from '@prisma/client';
import { RespuestasConfidenciales } from '../../../dashboard/interface/dashboard.interface';
import { EstadisticaService } from '../../../academicos/services/estadistica.service';

@Injectable()
export class ReportesExcelService {
    private readonly ftpConfig = {
        host: process.env.HOST_FTP,
        port: +process.env.PORT_FTP,
        user: process.env.USER_FTP,
        password: process.env.PASSWORD_FTP,
        secure: false,
    }
    private readonly meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    constructor(
        private readonly _databaseService: DatabaseService,
        private readonly _analiticaService: AnaliticaService,
        private readonly _estadisticaService: EstadisticaService,
    ) { }


    async getRespuestasHistoricaEvaluacion(res: Response) {
        const client = new Client();
        const workbook = new ExcelJS.Workbook();

        try {
            await client.access(this.ftpConfig);
            const historicoInformeEvaluativo: EvaluacionInforme = await this._analiticaService.obtenerTotalHistoricoRespuestasInformeEvaluacion();
            const respuestasValor = Object.keys(historicoInformeEvaluativo).slice(0, 10)

            const worksheetName = 'hoja-respuesta-historico';
            const worksheetRespuestas = workbook.addWorksheet(worksheetName);

            worksheetRespuestas.columns = [
                { header: 'Pregunta', key: 'Pregunta' },
                { header: 'Total', key: 'Total' },
                { header: 'Suficiente', key: 'Suficiente' },
                { header: 'Deficiente', key: 'Deficiente' },
                { header: 'Regular', key: 'Regular' },
            ]

            worksheetRespuestas.getRow(1).eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Negrita, texto blanco
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF4F81BD' }, // Fondo azul
                };
                cell.alignment = { horizontal: 'center', vertical: 'middle' }; // Centrado
            });
            worksheetRespuestas.columns.forEach((column) => {
                let maxLength = 0;
                column.eachCell({ includeEmpty: true }, (cell) => {
                    const cellValue = cell.value ? cell.value.toString() : '';
                    maxLength = Math.max(maxLength, cellValue.length);
                });
                column.width = maxLength + 2; // Agregar un pequeño margen
            });
            respuestasValor.forEach((pregunta) => {
                const valores = historicoInformeEvaluativo[pregunta];
                worksheetRespuestas.addRow({
                    Pregunta: pregunta,
                    Total: valores.Total,
                    Suficiente: valores.Suficiente,
                    Deficiente: valores.Deficiente,
                    Regular: valores.Regular,
                });
            });

            const buffer = Buffer.from(await workbook.xlsx.writeBuffer())
            const fileName = 'reporte-periodo-informe-evaluacion.xlsx';
            // Retornar el archivo al frontend
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(buffer);
        } catch (error) {
            throw new InternalServerErrorException('Error interno al generar el reporte historico');
        }
    }

    async getRespuestasEvaluacionPorPracticaYPeriodo(
        fecha_ini: Date,
        fecha_fin: Date,
        res: Response) {
        const client = new Client();
        const workbook = new ExcelJS.Workbook();

        try {
            await client.access(this.ftpConfig);

            // Obtener datos separados para cada tipo de práctica
            const historicoPracticaUno: EvaluacionInforme = await this._analiticaService.obtenerTotalRespuestasPorPeriodoYPractica(TipoPractica.PRACTICA_UNO, fecha_ini, fecha_fin);


            const historicoPracticaDos: EvaluacionInforme = await this._analiticaService.obtenerTotalRespuestasPorPeriodoYPractica(TipoPractica.PRACTICA_DOS, fecha_ini, fecha_fin);


            // Crear hojas para cada práctica
            const worksheetPracticaUno = workbook.addWorksheet('Practica Uno');
            const worksheetPracticaDos = workbook.addWorksheet('Practica Dos');

            const getFilteredData = (data: EvaluacionInforme, limit: number): EvaluacionInforme => {
                const filteredKeys = Object.keys(data).splice(0, limit);
                const filteredData: EvaluacionInforme = {};

                filteredKeys.forEach((key) => {
                    filteredData[key] = data[key];
                });

                return filteredData;
            };
            const configureWorksheet = (worksheet: ExcelJS.Worksheet, data: EvaluacionInforme) => {
                worksheet.columns = [
                    { header: 'Pregunta', key: 'Pregunta' },
                    { header: 'Total', key: 'Total' },
                    { header: 'Suficiente', key: 'Suficiente' },
                    { header: 'Deficiente', key: 'Deficiente' },
                    { header: 'Regular', key: 'Regular' },
                ];

                // Estilos de encabezado
                worksheet.getRow(1).eachCell((cell) => {
                    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Negrita, texto blanco
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF4F81BD' }, // Fondo azul
                    };
                    cell.alignment = { horizontal: 'center', vertical: 'middle' }; // Centrado
                });

                // Agregar datos al worksheet
                Object.keys(data).forEach((pregunta) => {
                    const valores = data[pregunta];
                    worksheet.addRow({
                        Pregunta: pregunta,
                        Total: valores.Total,
                        Suficiente: valores.Suficiente,
                        Deficiente: valores.Deficiente,
                        Regular: valores.Regular,
                    });
                });

                // Ajustar ancho de columnas
                worksheet.columns.forEach((column) => {
                    let maxLength = 0;
                    column.eachCell({ includeEmpty: true }, (cell) => {
                        const cellValue = cell.value ? cell.value.toString() : '';
                        maxLength = Math.max(maxLength, cellValue.length);
                    });
                    column.width = maxLength + 2; // Agregar un pequeño margen
                });
            };

            const formatFecha = (fecha: Date): string => {
                const dia = String(fecha.getDate()).padStart(2, '0');
                const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses empiezan en 0
                const anio = fecha.getFullYear();
                return `${dia}-${mes}-${anio}`;
            };



            const respuestaPracticaUno = getFilteredData(historicoPracticaUno, 9);
            const respuestaPracticaDos = getFilteredData(historicoPracticaDos, 9);

            // Configurar las hojas con datos
            configureWorksheet(worksheetPracticaUno, respuestaPracticaUno);
            configureWorksheet(worksheetPracticaDos, respuestaPracticaDos);

            const fechaInicioStr = formatFecha(fecha_ini);
            const fechaFinStr = formatFecha(fecha_fin);
            // Convertir workbook a buffer
            const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
            const fileName = `reporte-periodo-${fechaInicioStr}-a-${fechaFinStr}.xlsx`;

            // Retornar el archivo al frontend
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(buffer);
        } catch (error) {
            console.error('Error al generar el reporte:', error);
            throw new InternalServerErrorException('Error interno al generar el reporte histórico');
        }
    }


    async generarExcelRespuestasConfidencialByPeriodo(fecha_ini: Date, fecha_fin: Date, res: Response) {
        const workbook = new ExcelJS.Workbook();
    
        // Obtener las respuestas de ambas prácticas
        const respuestasPracticaUno: RespuestasConfidenciales = await this._analiticaService.obtenerRespuestasConfidencialesPorPeriodoYPractica(
            fecha_ini,
            fecha_fin,
            TipoPractica.PRACTICA_UNO,
        );
        const respuestasPracticaDos: RespuestasConfidenciales = await this._analiticaService.obtenerRespuestasConfidencialesPorPeriodoYPractica(
            fecha_ini,
            fecha_fin,
            TipoPractica.PRACTICA_DOS,
        );
    
        // Función para formatear fechas a dd-mm-aaaa
        const formatFecha = (fecha: Date): string => {
            const dia = String(fecha.getDate()).padStart(2, '0');
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const anio = fecha.getFullYear();
            return `${dia}-${mes}-${anio}`;
        };
    
        // Función para configurar cada hoja de cálculo
        const configureWorksheet = (
            worksheet: ExcelJS.Worksheet,
            data: RespuestasConfidenciales,
            tipo: string,
            practica: string,
        ) => {
            worksheet.columns = [
                { header: 'Práctica', key: 'practica', width: 20 },
                { header: 'Pregunta', key: 'pregunta', width: 50 },
                { header: 'Respuesta', key: 'respuesta', width: 50 },
                { header: 'Cantidad', key: 'cantidad', width: 15 },
            ];
    
            // Estilo de encabezado
            worksheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Negrita, texto blanco
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF4F81BD' }, // Fondo azul
                };
                cell.alignment = { horizontal: 'center', vertical: 'middle' }; // Centrado
            });
    
            // Agregar datos
            data.forEach((respuesta) => {
                if (respuesta.tipo === tipo) {
                    Object.entries(respuesta.respuestas).forEach(([respuestaTexto, cantidad]) => {
                        worksheet.addRow({
                            practica,
                            pregunta: respuesta.pregunta,
                            respuesta: respuestaTexto,
                            cantidad: cantidad,
                        });
                    });
                }
            });
    
            // Ajustar ancho de columnas
            worksheet.columns.forEach((column) => {
                let maxLength = 0;
                column.eachCell({ includeEmpty: true }, (cell) => {
                    const cellValue = cell.value ? cell.value.toString() : '';
                    maxLength = Math.max(maxLength, cellValue.length);
                });
                column.width = maxLength + 2; // Agregar un pequeño margen
            });
        };
    
        // Crear hojas para cada tipo de pregunta
        const worksheetCerradas = workbook.addWorksheet('Cerradas');
        const worksheetHabilidades = workbook.addWorksheet('Habilidades Técnicas');
        const worksheetVinculacion = workbook.addWorksheet('Vinculación Medio');
        const worksheetSalario = workbook.addWorksheet('Salario Estimado');
    
        // Configurar cada hoja con los datos de ambas prácticas
        configureWorksheet(worksheetCerradas, respuestasPracticaUno, 'CERRADA', 'Práctica Uno');
        configureWorksheet(worksheetCerradas, respuestasPracticaDos, 'CERRADA', 'Práctica Dos');
    
        configureWorksheet(worksheetHabilidades, respuestasPracticaUno, 'HABILIDADES_TECNICAS', 'Práctica Uno');
        configureWorksheet(worksheetHabilidades, respuestasPracticaDos, 'HABILIDADES_TECNICAS', 'Práctica Dos');
    
        configureWorksheet(worksheetVinculacion, respuestasPracticaUno, 'VINCULACION_MEDIO', 'Práctica Uno');
        configureWorksheet(worksheetVinculacion, respuestasPracticaDos, 'VINCULACION_MEDIO', 'Práctica Dos');
    
        configureWorksheet(worksheetSalario, respuestasPracticaUno, 'SALARIO_ESTIMADO', 'Práctica Uno');
        configureWorksheet(worksheetSalario, respuestasPracticaDos, 'SALARIO_ESTIMADO', 'Práctica Dos');
    
        // Formatear fechas y generar el nombre del archivo
        const fechaInicioStr = formatFecha(fecha_ini);
        const fechaFinStr = formatFecha(fecha_fin);
        const fileName = `reporte_respuestas-${fechaInicioStr}_a_${fechaFinStr}.xlsx`;
    
        // Convertir workbook a buffer y enviar como respuesta
        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(Buffer.from(buffer));
    }
    
    async generarExcelReporteAcademicoInformes(fecha_in: Date, fecha_fin: Date, res: Response) {
        const workbook = new ExcelJS.Workbook();
    
        try {
            // Obtener los datos para Práctica 1
            const practicaUnoData = await this._estadisticaService.obtenerConteoInformesAcademicosPorPractica(fecha_in, fecha_fin, TipoPractica.PRACTICA_UNO);
    
            // Crear hoja para Práctica 1
            const worksheetUno = workbook.addWorksheet('Práctica 1');
            worksheetUno.columns = [
                { header: 'Nombre Académico', key: 'nombre_academico', width: 25 },
                { header: 'Correo Académico', key: 'correo_academico', width: 25 },
                { header: 'Informes Aprobados', key: 'cantidad_informes_aprobados', width: 20 },
                { header: 'Informes Reprobados', key: 'cantidad_informes_reprobados', width: 20 },
            ];
    
            practicaUnoData.forEach((data) => {
                worksheetUno.addRow(data);
            });
    
            // Obtener los datos para Práctica 2
            const practicaDosData = await this._estadisticaService.obtenerConteoInformesAcademicosPorPractica(fecha_in, fecha_fin, TipoPractica.PRACTICA_DOS);
    
            // Crear hoja para Práctica 2
            const worksheetDos = workbook.addWorksheet('Práctica 2');
            worksheetDos.columns = [
                { header: 'Nombre Académico', key: 'nombre_academico', width: 25 },
                { header: 'Correo Académico', key: 'correo_academico', width: 25 },
                { header: 'Informes Aprobados', key: 'cantidad_informes_aprobados', width: 20 },
                { header: 'Informes Reprobados', key: 'cantidad_informes_reprobados', width: 20 },
            ];
    
            practicaDosData.forEach((data) => {
                worksheetDos.addRow(data);
            });
    
            // Convertir el workbook a un buffer
            const buffer = await workbook.xlsx.writeBuffer();
    
            // Configurar la respuesta HTTP
            res.setHeader('Content-Disposition', 'attachment; filename="reporte_informes_academicos.xlsx"');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(Buffer.from(buffer));
        } catch (error) {
            console.error('Error al generar el reporte en Excel:', error);
            res.status(500).send('Error al generar el reporte en Excel.');
        }
    }

}
