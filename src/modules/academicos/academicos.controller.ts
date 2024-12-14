import { BadRequestException, Body, Controller, Get, MaxFileSizeValidator, NotFoundException, Param, ParseFilePipe, Patch, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CreateAcademicoDto } from './dto/create-academicos.dto';
import { AcademicosService } from './academicos.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { CrearInformeCorreccion } from './dto/create-correccion-informe.dto';
import { Response } from 'express';
const rootPath = process.cwd();

@Controller('academicos')
export class AcademicosController {

    constructor(
        private readonly _academicoService: AcademicosService,
    ){}

    @Post()
    public registrarAcademico(@Body() academico: CreateAcademicoDto){
        return this._academicoService.crearAcademico(academico);
    }

    @Get('cantidad-informes')
    public async obtenerCantidadInformes(){
        return await this._academicoService.cantidadInformesPorAcademico()
    }
    
    @Get(':id')
    public async obtenerAcademico(@Param('id') id_academico: string){
        return await this._academicoService.obtenerAcademico(+id_academico);
    }

    @Get()
    public async obtenerAcademicos(){
        return await this._academicoService.obtenerAcademicos();
    }

    @Patch('subir-correccion')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, callback) => {
                const { tipo_practica } = req.body; // Obtener el tipo de práctica
                let subFolder = '';
                
                if (tipo_practica === 'PRACTICA_UNO') {
                    subFolder = 'informes-practica-uno/academicos-correccion';
                } else if (tipo_practica === 'PRACTICA_DOS') {
                    subFolder = 'informes-practica-dos/academicos-correccion';
                } else {
                    return callback(new BadRequestException('Tipo de práctica no válido'), null);
                }
    
                const folderPath = join(rootPath, 'uploads', subFolder);
                callback(null, folderPath); // Establece la carpeta de destino
            },
            filename: (req, file, callback) => {
                const { nombre_alumno } = req.body; // Obtener el nombre del alumno
                const extension = extname(file.originalname);
                const nuevoNombre = `correccion-informe-${nombre_alumno}${extension}`;
                callback(null, nuevoNombre); // Renombra el archivo
            }
        }),
    }))
    public async subirCorreccion(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024})
                ],
                exceptionFactory: (errors) => new BadRequestException('Archivo Inválido') 
            })
        ) file: Express.Multer.File,
        @Body() data: CrearInformeCorreccion){
            return await this._academicoService.subirCorreccion(file, data, rootPath)
    }

        @Get('ver-informe/:id_informe')
        async verInforme(@Param('id_informe') id_informe: number, @Res() res: Response) {
            try {
                const fileStream = await this._academicoService.getArchivo(id_informe);
    
                // Determinar el tipo de contenido según el archivo (por ejemplo, PDF o imagen)
                res.setHeader('Content-Type', 'application/pdf');  // Puedes ajustarlo según el tipo de archivo
                res.setHeader('Content-Disposition', 'inline; filename="informe.pdf"');
                
                // Enviar el archivo como stream, permitiendo que se muestre en el navegador
                fileStream.pipe(res);
            } catch (error) {
                if (error instanceof NotFoundException) {
                    throw error; // Manejo de error si el archivo no existe
                }
                throw new Error('Error al intentar mostrar el archivo');
            }
        }
    
        @Get('descargar-informe/:id_informe')
        async descargarInforme(@Param('id_informe') id_informe: number, @Res() res: Response) {
            try {
                const fileStream = await this._academicoService.getArchivo(id_informe);
    
                // Configurar las cabeceras para forzar la descarga
                res.setHeader('Content-Disposition', 'attachment; filename="informe.pdf"');
                res.setHeader('Content-Type', 'application/pdf');  // Ajusta según el tipo de archivo
                
                // Enviar el archivo como stream para la descarga
                fileStream.pipe(res);
            } catch (error) {
                if (error instanceof NotFoundException) {
                    throw error; // Manejo de error si el archivo no existe
                }
                throw new Error('Error al intentar descargar el archivo');
            }
        }
}


