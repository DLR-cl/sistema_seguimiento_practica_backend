import { BadRequestException, Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, NotFoundException, Param, ParseFilePipe, ParseIntPipe, Patch, Post, Res, UploadedFile, UseInterceptors, Req } from '@nestjs/common';
import { CreateInformeAlumnoDto } from './dto/create-informe-alumno.dto';
import { InformeAlumnoService } from './informe_alumno.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { InformeDto } from './dto/informe_pdf.dto';
import { Response } from 'express';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { AprobacionInformeDto, Comentario } from './dto/aprobacion-informe.dto';

const rootPath = process.cwd();
@Controller('informe-alumno')
export class InformeAlumnoController {

    constructor(
        private readonly _informeAlumnoService: InformeAlumnoService,
    ) { }


    @Post('subir-informe')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, callback) => {
                const practicaFolder = 'uploads/temp'; // Carpeta temporal
                callback(null, practicaFolder);
            },
            filename: (req, file, callback) => {
                const tempFileName = `${Date.now()}-${file.originalname}`;
                callback(null, tempFileName);
            }
        })
    }))
    async subirInforme(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: 'application/pdf' }),
                ],
                exceptionFactory: (errors) => new BadRequestException('Archivo inválido'),
            }),
        ) file: Express.Multer.File,
        @Body() data: InformeDto
    ) {
        console.log('Body:', data);
        console.log('File:', file);

        return this._informeAlumnoService.subirInforme(file, data, 'uploads');
    }

    // hacer otra ruta para poder subir el archivo, la creación del informe contemplará lo demás sin el archivo, es por medio
    // del servicio que se cambiará parte del informe añadiendole la ruta en la cual se encuentra.

    @Get('ver-informe/:id_informe')
    async verInforme(@Param('id_informe', ParseIntPipe) id_informe: number, @Res() res: Response) {
        try {
            const fileStream = await this._informeAlumnoService.getArchivo(+id_informe);

            if (!fileStream) {
                throw new NotFoundException('Archivo no encontrado');
            }

            console.log('Archivo encontrado, enviando al cliente');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="informe.pdf"');

            fileStream.pipe(res);
        } catch (error) {
            console.error('Error al intentar mostrar el archivo:', error);
            throw new Error('Error al intentar mostrar el archivo');
        }
    }


    @Get('descargar-informe/:id_informe')
    async descargarInforme(@Param('id_informe') id_informe: number, @Res() res: Response) {
        try {
            const fileStream = await this._informeAlumnoService.getArchivo(+id_informe);

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

    @Get('existeRespuesta/:id_practica')
    public async existeRespuestas(@Param('id_practica') id_practica: string) {
        return await this._informeAlumnoService.existeRespuestaInforme(+id_practica);
    }

    @Patch('asociar-informe')
    public async asociarInforme(@Body() data: CreateAsignacionDto) {
        return await this._informeAlumnoService.asignarInformeAlAcademico(data);
    }

    @Patch('aprobar-informe')
    public async aprobarInforme(@Body() data: AprobacionInformeDto) {
        return await this._informeAlumnoService.aprobarInforme(data);
    }

    @Post('comentarios')
    public async generarComentario(@Body() data: Comentario[]) {
        return await this._informeAlumnoService.crearComentarios(data);
    }

    @Patch('editar-comentario')
    public async editarComentario(@Body() data: Comentario) {
        return await this._informeAlumnoService.editarComentario(data)
    }

    @Get('obtener-respuestas/:id')
    public async obtenerRespuestaInforme(@Param('id', ParseIntPipe) informe_id: number) {
        console.log(informe_id)
        return await this._informeAlumnoService.obtenerRespuestasInforme(informe_id);
    }
}
