import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Estado_informe, Estado_practica, TipoPractica } from '@prisma/client';
import { Response } from 'express';
import { DatabaseService } from '../../../../database/database/database.service';
import { startOfWeek, endOfWeek } from 'date-fns';
import * as ExcelJS from 'exceljs';
import { Client } from 'basic-ftp';
import { Readable, Writable } from 'stream';
import { buffer } from 'stream/consumers';
import path from 'path';
import { Cron } from '@nestjs/schedule';

// TODO: Modularizar el servicio de reportes
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
    private readonly _databaseService: DatabaseService
  ) { }

  // Genero un reporte de 
  async generarReporteSemestral(
    tipo_practica: TipoPractica,
    fecha_ini: Date,
    fecha_fin: Date,
    res: Response
  ) {
    if (!tipo_practica || !fecha_ini || !fecha_fin) {
      throw new BadRequestException('Todos los parámetros son obligatorios.');
    }

    if (fecha_ini >= fecha_fin) {
      throw new BadRequestException('La fecha inicial debe ser menor que la fecha final.');
    }

    const reporteAlumnos = new ExcelJS.Workbook();

    try {
      // Filtrar prácticas desde la base de datos
      const { aprobados, reprobados } = await this.obtenerAlumnosAprobadosReprobadosPorFechayPractica(tipo_practica, fecha_ini, fecha_fin)
      console.log(aprobados);
      if (!aprobados) {
        throw new BadRequestException('Actualmente no hay datos suficientes para ese reporte');
      }

      // Crear la hoja de Excel
      const worksheetName = `hoja-aprobados`;
      const worksheetNameTwo = 'hoja-reprobados';
      const worksheetAprobados = reporteAlumnos.addWorksheet(worksheetName);
      const worksheetReprobados = reporteAlumnos.addWorksheet(worksheetNameTwo);

      // Definir columnas
      worksheetAprobados.columns = [
        { header: 'Nombre Alumno', key: 'nombreAlumno' },
        { header: 'RUT Alumno', key: 'rutAlumno' },
        { header: 'Correo Alumno', key: 'correoAlumno' },
      ];
      worksheetReprobados.columns = [
        { header: 'Nombre Alumno', key: 'nombreAlumno' },
        { header: 'RUT Alumno', key: 'rutAlumno' },
        { header: 'Correo Alumno', key: 'correoAlumno' },
      ];
      // Aplicar estilo a los encabezados
      worksheetAprobados.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Negrita, texto blanco
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4F81BD' }, // Fondo azul
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' }; // Centrado
      });

      // Ajustar el ancho de las columnas automáticamente
      worksheetAprobados.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const cellValue = cell.value ? cell.value.toString() : '';
          maxLength = Math.max(maxLength, cellValue.length);
        });
        column.width = maxLength + 2; // Agregar un pequeño margen
      });
      // Aplicar estilo a los encabezados
      worksheetReprobados.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Negrita, texto blanco
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4F81BD' }, // Fondo azul
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' }; // Centrado
      });

      // Ajustar el ancho de las columnas automáticamente
      worksheetReprobados.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const cellValue = cell.value ? cell.value.toString() : '';
          maxLength = Math.max(maxLength, cellValue.length);
        });
        column.width = maxLength + 2; // Agregar un pequeño margen
      });

      // Agregar filas
      aprobados.forEach(practica => {
        worksheetAprobados.addRow({
          nombreAlumno: practica.alumno.usuario.nombre,
          rutAlumno: practica.alumno.usuario.rut,
          correoAlumno: practica.alumno.usuario.correo,
        });
      });

      reprobados.forEach(practica => {
        worksheetReprobados.addRow({
          nombreAlumno: practica.alumno.usuario.nombre,
          rutAlumno: practica.alumno.usuario.rut,
          correoAlumno: practica.alumno.usuario.correo,
        })
      })

      // Generar el buffer como un Buffer válido
      const buffer = Buffer.from(await reporteAlumnos.xlsx.writeBuffer());
      const safeWorksheetName = worksheetName.replace(/[^a-zA-Z0-9_-]/g, '_'); // Reemplazar caracteres inválidos
      const fileName = `reporte_semestral_${tipo_practica}.xlsx`;

      // Subir el buffer al servidor FTP
      await this.storageReporteSemestral(buffer, fileName, tipo_practica, fecha_ini);

      // Retornar el archivo al frontend
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error('Error al generar el reporte semestral:', error);
      throw new InternalServerErrorException('No se pudo generar el reporte semestral.');
    }
  }


  private async storageReporteSemestral(
    buffer: Buffer,
    remoteFileName: string,
    tipoPractica: TipoPractica,
    fecha_ini: Date
  ) {
    const client = new Client();
    try {
      // Conexión al servidor FTP
      await client.access(this.ftpConfig);

      // Crear un stream desde el buffer
      const stream = Readable.from([buffer]);

      // Construir la ruta del directorio
      const year = fecha_ini.getFullYear();
      const directory = tipoPractica === TipoPractica.PRACTICA_UNO
        ? `/reportes/practica-uno/${year}`
        : `/reportes/practica-dos/${year}`;

      console.log(`Intentando asegurar el directorio: ${directory}`);
      await client.ensureDir(directory); // Asegura que el directorio existe

      // Sanitizar el nombre del archivo
      const sanitizedFileName = remoteFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const remotePath = `${directory}/${sanitizedFileName}`;
      console.log(`Subiendo archivo a: ${remotePath}`);

      // Subir el archivo al servidor FTP
      await client.uploadFrom(stream, remotePath);
      console.log('Archivo subido exitosamente.');
    } catch (error) {
      console.error('Error al subir el archivo al servidor FTP:', error);
      throw new Error('No se pudo almacenar el reporte semestral en el servidor.');
    } finally {
      client.close();
      console.log('Conexión FTP cerrada.');
    }
  }


  async listarReportesPorAnoYPractica(year: number, tipo_practica: TipoPractica, tipo_informe: string) {
    const client = new Client();

    const basePath = tipo_practica === TipoPractica.PRACTICA_UNO ? `reportes/practica-uno/${year}`
      : `reportes/practica-dos/${year}`;
    try {
      await client.access(this.ftpConfig);

      console.log(`Conexión FTP establecida para listar reportes en ${basePath}`);

      // Listar archivos en "aprobados" y "desaprobados"
      const reportes = await this.listarArchivos(client, `${basePath}`);

      client.close();
      return reportes
    } catch (error) {
      console.error('Error al listar reportes:', error);
      throw new Error('No se pudieron listar los reportes desde el servidor.');
    } finally {
      client.close();

      console.log('Conexión FTP cerrada.');
    }

  }


  private async listarArchivos(client: Client, directory: string): Promise<string[]> {
    try {
      const listado = await client.list(directory);
      return listado.map(file => `${directory}/${file.name}`);
    } catch (error) {
      console.warn(`No se pudieron listar archivos en ${directory}:`, error);
      return []; // Si no existe la carpeta, devolver lista vacía
    }
  
  }

  async obtenerReporte(filePath: string) {
    const client = new Client();
    client.ftp.verbose = true;

    try {
      await client.access(this.ftpConfig);
      console.log(`Conexión FTP establecida para descargar el archivo: ${filePath}`);

      // Crear un buffer para almacenar el archivo
      const chunks: Buffer[] = [];

      // Crear un stream de escritura para manejar los chunks del archivo
      const writableStream = new Writable({
        write(chunk, encoding, callback) {
          chunks.push(Buffer.from(chunk)); // Agregar el chunk al buffer
          callback();
        },
      });

      // Descargar el archivo al stream
      await client.downloadTo(writableStream, filePath);

      // Concatenar todos los chunks en un solo buffer
      return Buffer.concat(chunks);


    } catch (error) {
      console.error(`Error al descargar el archivo desde ${path}:`, error);
      throw new Error('No se pudo descargar el archivo.');
    } finally {
      client.close();
      console.log('Conexión FTP cerrada.');
    }
  }
  private obtenerListaInformes(tipo_practica: TipoPractica, estado_aprobacion: Estado_informe) {
    const data = this._databaseService.alumnosPractica.findMany({
      where: {
        // Filtrar prácticas por tipo y estado del informe asociado
        practica: {
          some: {
            tipo_practica: tipo_practica, // Cambia según el tipo de práctica
            informe_alumno: {
              estado: estado_aprobacion,
            },
          },
        },
      },
      select: {
        usuario: {
          select: {
            rut: true,
            nombre: true,
            correo: true,
          },
        },
        informe: {
          select: {
            academico: {
              select: {
                usuario: {
                  select: {
                    nombre: true,
                    correo: true,
                  },
                },
              },
            },
            estado: true, // Por si quieres incluir el estado en los resultados
          },
        },
      },
    });


  }



  private async obtenerAlumnosAprobadosReprobadosPorFechayPractica(
    practica: TipoPractica,
    fecha_ini: Date,
    fecha_fin: Date
  ) {
    const informesFiltrados = await this._databaseService.practicas.findMany({
      where: {
        estado: Estado_practica.FINALIZADA,
        tipo_practica: practica,
        fecha_termino: {
          gte: fecha_ini,
          lt: fecha_fin,
        },
      },
      include: {
        alumno: {
          include: {
            usuario: true,
          },
        },
        informe_alumno: true,
      },
    });
  
    const aprobados = informesFiltrados.filter(
      (informe) => informe.informe_alumno?.estado === Estado_informe.APROBADA
    );
  
    const reprobados = informesFiltrados.filter(
      (informe) => informe.informe_alumno?.estado === Estado_informe.DESAPROBADA
    );
  
    return {
      aprobados,
      reprobados,
    };
  }
  
  @Cron('0 8 * * 0')
  public async generarReporteSemanal() {
    const client = new Client();

    try {
      console.log('Conectando al servidor FTP...');
      await client.access(this.ftpConfig);

      // Configuración para mantener la conexión activa y evitar timeouts
      // Calcular inicio y fin de la semana actual
      const fechaActual = new Date();
      const inicioSemana = startOfWeek(fechaActual, { weekStartsOn: 1 }); // Lunes
      const finSemana = endOfWeek(fechaActual, { weekStartsOn: 1 }); // Domingo
      const nombreMes = this.meses[fechaActual.getMonth()];
      const numeroSemana = this.obtenerNumeroSemana(fechaActual);
      const year = fechaActual.getFullYear();

      // Generar Excel
      console.log('Generando archivo Excel...');
      const workbookExcel = new ExcelJS.Workbook();
      const workbookLlenado = await this.generarExcel(
        workbookExcel,
        TipoPractica.PRACTICA_UNO,
        inicioSemana,
        finSemana
      );

      // Escribir el archivo a un buffer
      const buffer = await workbookLlenado.xlsx.writeBuffer();

      // Construir ruta del directorio
      const directory = `/reportes/practica-uno/${year}/semanal/${nombreMes}`;
      const fileName = `reporte_semana_${numeroSemana}.xlsx`;
      const remotePath = `${directory}/${fileName}`;

      console.log(`Asegurando directorio remoto: ${directory}`);
      await client.ensureDir(directory);

      console.log(`Subiendo archivo a: ${remotePath}`);
      await client.uploadFrom(Readable.from([buffer]), remotePath);

      console.log('Archivo subido exitosamente.');
    } catch (error) {
      console.error('Error durante la generación o subida del archivo:', error.message);
      throw new Error('No se pudo generar y subir el reporte semanal.');
    } finally {
      client.close();
      console.log('Conexión FTP cerrada.');
    }
  }


  private obtenerNumeroSemana(fecha: Date) {
    const primerDiaDelAno = new Date(fecha.getFullYear(), 0, 1);
    const diasTranscurridos = Math.floor((fecha.getTime() - primerDiaDelAno.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((diasTranscurridos + primerDiaDelAno.getDay() + 1) / 7);
  }
  private async generarExcel(
    workbook: ExcelJS.Workbook,
    tipo_practica: TipoPractica,
    fecha_ini: Date,
    fecha_fin: Date
  ) {
    // Crear la hoja de Excel
    const { aprobados, reprobados } = await this.obtenerAlumnosAprobadosReprobadosPorFechayPractica(tipo_practica, fecha_ini, fecha_fin);

    const worksheetName = `hoja-aprobados`;
    const worksheetNameTwo = 'hoja-reprobados';
    const worksheetAprobados = workbook.addWorksheet(worksheetName);
    const worksheetReprobados = workbook.addWorksheet(worksheetNameTwo);

    // Definir columnas
    worksheetAprobados.columns = [
      { header: 'Nombre Alumno', key: 'nombreAlumno' },
      { header: 'RUT Alumno', key: 'rutAlumno' },
      { header: 'Correo Alumno', key: 'correoAlumno' },
    ];
    worksheetReprobados.columns = [
      { header: 'Nombre Alumno', key: 'nombreAlumno' },
      { header: 'RUT Alumno', key: 'rutAlumno' },
      { header: 'Correo Alumno', key: 'correoAlumno' },
    ];
    // Aplicar estilo a los encabezados
    worksheetAprobados.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Negrita, texto blanco
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F81BD' }, // Fondo azul
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' }; // Centrado
    });

    // Ajustar el ancho de las columnas automáticamente
    worksheetAprobados.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, cellValue.length);
      });
      column.width = maxLength + 2; // Agregar un pequeño margen
    });
    // Aplicar estilo a los encabezados
    worksheetReprobados.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Negrita, texto blanco
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F81BD' }, // Fondo azul
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' }; // Centrado
    });

    // Ajustar el ancho de las columnas automáticamente
    worksheetReprobados.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, cellValue.length);
      });
      column.width = maxLength + 2; // Agregar un pequeño margen
    });

    // Agregar filas
    aprobados.forEach(practica => {
      worksheetAprobados.addRow({
        nombreAlumno: practica.alumno.usuario.nombre,
        rutAlumno: practica.alumno.usuario.rut,
        correoAlumno: practica.alumno.usuario.correo,
      });
    });

    reprobados.forEach(practica => {
      worksheetReprobados.addRow({
        nombreAlumno: practica.alumno.usuario.nombre,
        rutAlumno: practica.alumno.usuario.rut,
        correoAlumno: practica.alumno.usuario.correo,
      })
    });

    return workbook;
  }

  public async listarReportesSemanalesByMes(
    tipo_practica: TipoPractica,
    anio: number,
    mes: string): Promise<string[]> {
    console.log("tipopractica:",tipo_practica)
    const client = new Client();
    const directorioBase =
      tipo_practica === 'PRACTICA_UNO'
        ? `/reportes/practica-uno/${anio}/semanal/${mes}`
        : `/reportes/practica-dos/${anio}/semanal/${mes}`;

    try {
      await client.access(this.ftpConfig);

      const listaArchivos = await client.list(directorioBase);
      const reportes = listaArchivos
        .filter((item) => item.isFile) // Solo archivos
        .map((archivo) => `${directorioBase}/${archivo.name}`);
      return reportes;
    } catch (error) {
      throw new Error('No se pudieron listar los reportes semanales.');

    } finally {
      client.close();
    }
  }
}
