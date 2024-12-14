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
                const practicaFolder = 'uploads/temp'; // Carpeta temporal para almacenar el archivo
                callback(null, practicaFolder);
            },
            filename: (req, file, callback) => {
                const tempFileName = `${Date.now()}-${file.originalname}`; // Nombre temporal
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
        // Verificar si los datos llegaron correctamente
        console.log('Body:', data);
        console.log('File:', file);
    
        if (!data.nombre_alumno || !data.tipo_practica) {
            throw new BadRequestException('Datos incompletos en el formulario');
        }
    
        // Construir la nueva ruta y el nuevo nombre del archivo
        const practicaFolder =
            data.tipo_practica === 'PRACTICA_UNO'
                ? 'uploads/informes-practica-uno/alumnos'
                : 'uploads/informes-practica-dos/alumnos';
        const extension = file.originalname.split('.').pop();
        const newFileName = `informe-${data.nombre_alumno.replace(/\s+/g, '-')}.${extension}`;
        const newPath = join(rootPath, practicaFolder, newFileName);
    
        // Mover el archivo desde la carpeta temporal a la carpeta final
        const fs = require('fs');
        const oldPath = file.path;
        fs.renameSync(oldPath, newPath);
    
        // Retornar respuesta
        return this._informeAlumnoService.subirInforme(
            { ...file, path: newPath },
            data,
            rootPath
        );
    }
    
    // hacer otra ruta para poder subir el archivo, la creación del informe contemplará lo demás sin el archivo, es por medio
    // del servicio que se cambiará parte del informe añadiendole la ruta en la cual se encuentra.

    @Get('ver-informe/:id_informe')
    async verInforme(@Param('id_informe') id_informe: number, @Res() res: Response) {
        try {
            const fileStream = await this._informeAlumnoService.getArchivo(+id_informe);

            // Determinar el tipo de contenido según el archivo (por ejemplo, PDF o imagen)
            res.setHeader('Content-Type', 'application/pdf');  // Puedes ajustarlo según el tipo de archivo
            res.setHeader('Content-Disposition', 'inline; filename="informe.pdf"');

            // Enviar el archivo como stream, permitiendo que se muestre en el navegador
            fileStream.pipe(res);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error; // Manejo de error si el archivo no existe
            }
            console.log(error)
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
}
