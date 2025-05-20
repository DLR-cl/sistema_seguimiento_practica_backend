import { Injectable } from '@nestjs/common';
import { TratamientoDatosService } from '../tratamiento-datos/tratamiento-datos.service';
import { ResultadosInformeConfidencial } from '../../types/data-informe-confidencial.interface';
import * as ExcelJS from 'exceljs';
import { TipoPractica } from '@prisma/client';
import { IDataResultadoPractica, IDataResultadoPracticaExcel } from '../../types/data-resultado-practica.interface';
@Injectable()
export class GeneracionExcelService {


    constructor(
        private readonly _tratamientoDatosService: TratamientoDatosService
    ) { }

    async generarExcelInformeConfidencial(fechaInicio: Date, fechaFin: Date) {
        const resultadosUno: ResultadosInformeConfidencial[] = await this._tratamientoDatosService.tratarDatosInformeConfidencial(fechaInicio, fechaFin, TipoPractica.PRACTICA_UNO);
        const resultadosDos: ResultadosInformeConfidencial[] = await this._tratamientoDatosService.tratarDatosInformeConfidencial(fechaInicio, fechaFin, TipoPractica.PRACTICA_DOS);
        // Generar Excel
        const workbook = new ExcelJS.Workbook();    
        const worksheetUno = workbook.addWorksheet(`Informe Confidencial-${TipoPractica.PRACTICA_UNO}`);
        const worksheetDos = workbook.addWorksheet(`Informe Confidencial-${TipoPractica.PRACTICA_DOS}`);

        // Añadir encabezados
        worksheetUno.addRow(['Dimension', 'Pregunta', 'Respuesta', 'Cantidad']);
        worksheetDos.addRow(['Dimension', 'Pregunta', 'Respuesta', 'Cantidad']);

        // Añadir datos
        resultadosUno.forEach(resultado => {
            resultado.respuestas.forEach(respuesta => {
                worksheetUno.addRow([resultado.dimension, respuesta.pregunta, respuesta.respuesta, respuesta.cantidad]);
            });
        });
        resultadosDos.forEach(resultado => {
            resultado.respuestas.forEach(respuesta => {
                worksheetDos.addRow([resultado.dimension, respuesta.pregunta, respuesta.respuesta, respuesta.cantidad]);
            });
        });
        // Guardar Excel
        const excelBuffer = await workbook.xlsx.writeBuffer();
        return excelBuffer;
    }

    async generarExcelResultadoPractica(fechaInicio: Date, fechaFin: Date) {

        const resultadosUno: IDataResultadoPracticaExcel = await this._tratamientoDatosService.tratarDatosResultadosPractica(fechaInicio, fechaFin, TipoPractica.PRACTICA_UNO);
        const resultadosDos: IDataResultadoPracticaExcel = await this._tratamientoDatosService.tratarDatosResultadosPractica(fechaInicio, fechaFin, TipoPractica.PRACTICA_DOS);
        // Generar Excel
        const workbook = new ExcelJS.Workbook();    

        // Hoja 1: Conteo de Informes
        const worksheetInformesUno = workbook.addWorksheet('Conteo Informes Practica Uno');
        const worksheetInformesDos = workbook.addWorksheet('Conteo Informes Practica Dos');
        
        // Configurar encabezados para informes
        worksheetInformesUno.columns = [
            { header: 'Estado', key: 'estado', width: 15 },
            { header: 'Cantidad', key: 'cantidad', width: 15 }
        ];

        worksheetInformesDos.columns = [
            { header: 'Estado', key: 'estado', width: 15 },
            { header: 'Cantidad', key: 'cantidad', width: 15 }
        ];
        // Añadir datos de informes
        worksheetInformesUno.addRow({ 
            estado: 'Aprobados', 
            cantidad: resultadosUno.conteoInformes?.aprobados || 0 
        });
        worksheetInformesUno.addRow({ 
            estado: 'Reprobados', 
            cantidad: resultadosUno.conteoInformes?.reprobados || 0 
        });

        worksheetInformesDos.addRow({ 
            estado: 'Aprobados', 
            cantidad: resultadosDos.conteoInformes?.aprobados || 0 
        });
        worksheetInformesDos.addRow({ 
            estado: 'Reprobados', 
            cantidad: resultadosDos.conteoInformes?.reprobados || 0 
        });
        // Estilizar la hoja de informes
        worksheetInformesUno.getRow(1).font = { bold: true };
        worksheetInformesUno.getColumn('estado').alignment = { horizontal: 'center' };
        worksheetInformesUno.getColumn('cantidad').alignment = { horizontal: 'center' };

        worksheetInformesDos.getRow(1).font = { bold: true };
        worksheetInformesDos.getColumn('estado').alignment = { horizontal: 'center' };
        worksheetInformesDos.getColumn('cantidad').alignment = { horizontal: 'center' };

        // Hoja 2: Conteo de Empresas
        const worksheetEmpresasUno = workbook.addWorksheet('Conteo Empresas Practica Uno');
        const worksheetEmpresasDos = workbook.addWorksheet('Conteo Empresas Practica Dos');
        
        // Configurar encabezados para empresas
        worksheetEmpresasUno.columns = [
            { header: 'Tipo Empresa', key: 'tipo', width: 20 },
            { header: 'Cantidad', key: 'cantidad', width: 15 }
        ];

        worksheetEmpresasDos.columns = [
            { header: 'Tipo Empresa', key: 'tipo', width: 20 },
            { header: 'Cantidad', key: 'cantidad', width: 15 }
        ];

        // Añadir datos de empresas con validación
        worksheetEmpresasUno.addRow({ 
            tipo: 'Empresas Privadas', 
            cantidad: resultadosUno.conteoEmpresas?.PRIVADA || 0 
        });
        
        worksheetEmpresasDos.addRow({ 
            tipo: 'Empresas Privadas', 
            cantidad: resultadosDos.conteoEmpresas?.PRIVADA || 0 
        });

        worksheetEmpresasUno.addRow({ 
            tipo: 'Empresas Públicas', 
            cantidad: resultadosUno.conteoEmpresas?.PUBLICA || 0 
        });

        worksheetEmpresasDos.addRow({ 
            tipo: 'Empresas Públicas', 
            cantidad: resultadosDos.conteoEmpresas?.PUBLICA || 0 
        });

        // Estilizar la hoja de empresas
        worksheetEmpresasUno.getRow(1).font = { bold: true };
        worksheetEmpresasUno.getColumn('tipo').alignment = { horizontal: 'center' };
        worksheetEmpresasUno.getColumn('cantidad').alignment = { horizontal: 'center' };

        worksheetEmpresasDos.getRow(1).font = { bold: true };
        worksheetEmpresasDos.getColumn('tipo').alignment = { horizontal: 'center' };
        worksheetEmpresasDos.getColumn('cantidad').alignment = { horizontal: 'center' };

        // Guardar Excel
        const excelBuffer = await workbook.xlsx.writeBuffer();
        return excelBuffer;
    }

}
