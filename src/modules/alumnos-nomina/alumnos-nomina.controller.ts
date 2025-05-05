import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { AlumnosNominaService } from './alumnos-nomina.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as ExcelJS from 'exceljs'; // Solo usamos ExcelJS
import { Response } from 'express';

@Controller('alumnos-nomina')
export class AlumnosNominaController {
  constructor(private readonly _alumnoNominaService: AlumnosNominaService) {}

  @Post('excel')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<string> {
    // Crear un Workbook para leer el archivo
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);

    // Obtener la primera hoja
    const sheet = workbook.worksheets[0];

    // Leer las filas y convertirlas a JSON
    const usuarios = [];
    sheet.eachRow((row, rowIndex) => {
      // Ignorar la primera fila si es de encabezados
      if (rowIndex === 1) return;

      usuarios.push({
        rut: row.getCell(2).text.trim(),
        nombre: row.getCell(3).text.trim(),
        email: row.getCell(5).text.trim(),
      });
    });

    // Guardar en la base de datos solo las filas válidas
    const usuariosFiltrados = usuarios.filter(
      (user) => user.rut && user.nombre && user.email,
    );
    return await this._alumnoNominaService.guardarUsuarios(usuariosFiltrados);
  }

  @Get('alumno/:rut')
  async buscarAlumnoNomina(@Param('rut') rut: string) {
    return await this._alumnoNominaService.obtenerAlumnoNomina(rut);
  }

  @Get('alumno')
  async obtenerAlumnosNomina() {
    return await this._alumnoNominaService.obtenerTodosAlumnosNomina();
  }
}
