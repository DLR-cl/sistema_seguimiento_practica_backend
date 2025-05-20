import { Injectable } from '@nestjs/common';
import { TratamientoDatosResultadosPracticasAlumnosService } from '../../../generacion-reportes/tratamiento-datos/resultado-alumno/resultado-alumno.service';
import { DataResultadosPracticas } from '../../../types/data-resultados-practicas.interface';
import { TipoPractica } from '@prisma/client';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ResultadoAlumnoService {
    constructor(
        private readonly _tratamientoDatosResultadosPracticasAlumnosService: TratamientoDatosResultadosPracticasAlumnosService
    ){}

    async generarExcelResultadosPracticasAlumnos(fechaInicio: Date, fechaFin: Date){
        const datosUno: DataResultadosPracticas[] = await this._tratamientoDatosResultadosPracticasAlumnosService.tratarDatosResultadosPracticasAlumnos(fechaInicio, fechaFin, TipoPractica.PRACTICA_UNO);
        const datosDos: DataResultadosPracticas[] = await this._tratamientoDatosResultadosPracticasAlumnosService.tratarDatosResultadosPracticasAlumnos(fechaInicio, fechaFin, TipoPractica.PRACTICA_DOS);
    
        const workbook = new ExcelJS.Workbook();
        
        // Configuración de la primera hoja (Práctica Uno)
        const worksheet = workbook.addWorksheet('Practicas Alumnos-Practica Uno');
        worksheet.columns = [
            { header: 'Rut', key: 'rut', width: 15 },
            { header: 'Nombre', key: 'nombre', width: 30 },
            { header: 'Resultado Practica', key: 'resultado_practica', width: 20 },
            { header: 'Tipo Practica', key: 'tipo_practica', width: 20 }
        ];

        // Aplicar formato a la primera hoja
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Agregar datos a la primera hoja
        datosUno.forEach(dato => {
            worksheet.addRow({
                rut: dato.rut,
                nombre: dato.nombre,
                resultado_practica: dato.resultado_practica,
                tipo_practica: dato.tipo_practica
            });
        });

        // Configuración de la segunda hoja (Práctica Dos)
        const worksheetDos = workbook.addWorksheet('Practicas Alumnos-Practica Dos');
        worksheetDos.columns = [
            { header: 'Rut', key: 'rut', width: 15 },
            { header: 'Nombre', key: 'nombre', width: 30 },
            { header: 'Resultado Practica', key: 'resultado_practica', width: 20 },
            { header: 'Tipo Practica', key: 'tipo_practica', width: 20 }
        ];

        // Aplicar formato a la segunda hoja
        worksheetDos.getRow(1).font = { bold: true };
        worksheetDos.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheetDos.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Agregar datos a la segunda hoja
        datosDos.forEach(dato => {
            worksheetDos.addRow({
                rut: dato.rut,
                nombre: dato.nombre,
                resultado_practica: dato.resultado_practica,
                tipo_practica: dato.tipo_practica
            });
        });

        // Aplicar bordes a todas las celdas
        [worksheet, worksheetDos].forEach(sheet => {
            sheet.eachRow((row, rowNumber) => {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });
        });

        // Generar y retornar el buffer del Excel
        return await workbook.xlsx.writeBuffer();
    }
}