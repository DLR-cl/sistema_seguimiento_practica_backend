import { Injectable } from '@nestjs/common';
import { TipoPractica } from '@prisma/client';
import { TratamientoDatosResultadoAcademicoService } from '../../tratamiento-datos/resultado-academico/resultado-academico.service';
import * as ExcelJS from 'exceljs';
import { DataInformesRevisadosAcademicos } from '../../../types/data-informes-revisados-academicos.interface';

@Injectable()
export class ReporteResultadoAcademicoService {


    constructor(
        private readonly _tratamientoDatosResultadoAcademicoService: TratamientoDatosResultadoAcademicoService
    ){}


    // Se genera un reporte en excel con los datos de los informes revisados por los academicos, segun fecha inicio y fecha fin, y tipo de practica.
    // Sin embargo, pueden haber otros modulos que los llamen según fechas definidas por el usuario o el sistema, como semestrales, anuales, etc.
    private configurarHoja(worksheet: ExcelJS.Worksheet) {
        // Configurar columnas
        worksheet.columns = [
            { header: 'Nombre Alumno', key: 'nombre_alumno', width: 30 },
            { header: 'Rut Alumno', key: 'rut_alumno', width: 15 },
            { header: 'Fecha Inicio Revisión', key: 'fecha_revision', width: 20 },
            { header: 'Fecha Término Revisión', key: 'fecha_termino_revision', width: 20 },
            { header: 'Días Demora', key: 'dias_demora', width: 15 },
            { header: 'Tipo Práctica', key: 'tipo_practica', width: 20 },
            { header: 'Empresa', key: 'empresa', width: 30 }
        ];

        // Estilo del encabezado
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Aplicar bordes a todas las celdas
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });
    }

    async generarReporteResultadoAcademico(fechaInicio: Date, fechaFin: Date): Promise<ExcelJS.Buffer> {
        // Obtener datos de ambas prácticas
        const dataUno = await this._tratamientoDatosResultadoAcademicoService.tratarDatosResultadoAcademico(fechaInicio, fechaFin, TipoPractica.PRACTICA_UNO);
        const dataDos = await this._tratamientoDatosResultadoAcademicoService.tratarDatosResultadoAcademico(fechaInicio, fechaFin, TipoPractica.PRACTICA_DOS);
        
        // Combinar y agrupar datos por académico
        const todosLosDatos = [...dataUno, ...dataDos];
        const datosPorAcademico = new Map<string, DataInformesRevisadosAcademicos[]>();

        todosLosDatos.forEach(dato => {
            const informesDelAcademico = datosPorAcademico.get(dato.nombre_academico) || [];
            informesDelAcademico.push(dato);
            datosPorAcademico.set(dato.nombre_academico, informesDelAcademico);
        });

        // Crear workbook
        const workbook = new ExcelJS.Workbook();
        
        // Crear una hoja por cada académico
        datosPorAcademico.forEach((informes, nombreAcademico) => {
            // Crear hoja con nombre del académico (limitado a 31 caracteres por Excel)
            const nombreHoja = nombreAcademico.substring(0, 31);
            const worksheet = workbook.addWorksheet(nombreHoja);
            
            // Configurar formato de la hoja
            this.configurarHoja(worksheet);

            // Agregar datos
            informes.forEach(informe => {
                worksheet.addRow({
                    nombre_alumno: informe.nombre_alumno,
                    rut_alumno: informe.rut_alumno,
                    fecha_revision: informe.fecha_revision,
                    fecha_termino_revision: informe.fecha_termino_revision,
                    dias_demora: informe.dias_demora,
                    tipo_practica: informe.tipo_practica,
                    empresa: informe.empresa
                });
            });

            // Autoajustar columnas
            worksheet.columns.forEach(column => {
                if (column.width) {
                    column.width = Math.min(column.width, 50);
                }
            });
        });

        // Generar y retornar el buffer del Excel
        return await workbook.xlsx.writeBuffer();
    }   

}
