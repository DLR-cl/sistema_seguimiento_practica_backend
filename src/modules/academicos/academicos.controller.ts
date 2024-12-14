import { BadRequestException, Body, Controller, Get, MaxFileSizeValidator, Param, ParseFilePipe, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CreateAcademicoDto } from './dto/create-academicos.dto';
import { AcademicosService } from './academicos.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { CrearInformeCorreccion } from './dto/create-correccion-informe.dto';
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
}


