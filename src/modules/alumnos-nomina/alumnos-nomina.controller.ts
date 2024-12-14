import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AlumnosNominaService } from './alumnos-nomina.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as XLSX from 'xlsx'
@Controller('alumnos-nomina')
export class AlumnosNominaController {

    constructor(
        private readonly _alumnoNominaService: AlumnosNominaService
    ){}

    @Post('excel')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<string> {
      // Leer el archivo Excel
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
  
      // Convertir a JSON
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);
  
      // Filtrar los datos relevantes
      const usuarios = jsonData.map((row) => {
        return {
          rut: row['Rut'] || '',
          nombre: row['Nombre'] || '',
          email: row['E-mail'] || '',
        };
      }).filter((row) => row.rut && row.nombre && row.email); // Asegurarse de que los datos no estén vacíos
  
      // Guardar en la base de datos
      await this._alumnoNominaService.guardarUsuarios(usuarios);
  
      return 'Archivo procesado y datos guardados correctamente';
    }
}
