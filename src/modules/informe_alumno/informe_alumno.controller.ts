import { BadRequestException, Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, NotFoundException, Param, ParseFilePipe, ParseIntPipe, Patch, Post, Res, UploadedFile, UseInterceptors, Req, Query } from '@nestjs/common';
import { CreateInformeAlumnoDto } from './dto/create-informe-alumno.dto';
import { InformeAlumnoService } from './informe_alumno.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Informe, InformeDto } from './dto/informe_pdf.dto';
import e, { Response } from 'express';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { AprobacionInformeDto, Comentario } from './dto/aprobacion-informe.dto';
import { InformeManagementService } from './services/informe-management.service';
import { InformeRevisionService } from './services/informe-revision.service';
import { InformeStorageService } from './services/informe-storage.service';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateRespuestaInformAlumnoDto } from './dto/class/respuestas';

const rootPath = process.cwd();
@Controller('informe-alumno')
export class InformeAlumnoController {

    constructor(
        private readonly _informeAlumnoService: InformeAlumnoService,
        private readonly _informemanagamentService: InformeManagementService,
        private readonly _informerevisonService: InformeRevisionService,
        private readonly _informestorageService: InformeStorageService
    ) { }

    @Post('subir-informe')
    @UseInterceptors(FileInterceptor('file'))
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
        @Body() rawData: any
    ) {
        if (rawData.respuestas) {

            const parsedData = JSON.parse(rawData.respuestas);
            const data: Informe = {
                ...rawData,
                respuestas: parsedData
            }
            // Convertir los datos planos al DTO usando class-transformer

            // Validar el DTO
            const errors = await validate(data);
            if (errors.length > 0) {
                // Formatear los errores
                const formattedErrors = errors.map(err => ({
                    property: err.property,
                    constraints: err.constraints,
                }));

                throw new BadRequestException({
                    message: 'Errores de validación',
                    errors: formattedErrors,
                });
            }
            // TODO: Arreglar ruta
            return this._informestorageService.subirInforme(file, data, 'archivos');
            
        }
        return this._informestorageService.subirInforme(file, rawData, 'archivos')
    }

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
        return await this._informemanagamentService.asignarInformeAlAcademico(data);
    }

    @Patch('aprobar-informe')
    public async aprobarInforme(@Body() data: AprobacionInformeDto) {
        return await this._informerevisonService.aprobarInforme(data);
    }

    @Post('comentarios')
    public async generarComentario(@Body() data: Comentario[]) {
        return await this._informerevisonService.crearComentarios(data);
    }

    @Patch('editar-comentario')
    public async editarComentario(@Body() data: Comentario) {
        return await this._informerevisonService.editarComentario(data)
    }

    @Get('obtener-respuestas/:id')
    public async obtenerRespuestaInforme(@Param('id', ParseIntPipe) informe_id: number) {
        console.log(informe_id)
        return await this._informeAlumnoService.obtenerRespuestasInforme(informe_id);
    }

    @Get('archivo/obtener/correccion')
    public async obtenerArchivoCorreccion(@Query('id_informe_alumno') id_informe: number, @Res() res: Response,) {
        const readableStream = await this._informeAlumnoService.getArchivoCorreccion(id_informe);
        res.set({
            'Content-Type': 'application/pdf', // Cambiar según el tipo de archivo esperado
            'Content-Disposition': `attachment; filename="informe_${id_informe}.pdf"`,
        });

        // Enviar el flujo como respuesta
        readableStream.pipe(res);
    }
}
