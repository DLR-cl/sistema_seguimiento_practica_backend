import { BadRequestException, Body, Controller, Get, InternalServerErrorException, MaxFileSizeValidator, NotFoundException, Param, ParseFilePipe, ParseIntPipe, Patch, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CreateAcademicoDto } from './dto/create-academicos.dto';
import { AcademicosService } from './academicos.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { CrearInformeCorreccion } from './dto/create-correccion-informe.dto';
import { Response } from 'express';
import { EstadisticaService } from './services/estadistica.service';
import internal from 'stream';
const rootPath = process.cwd();

@Controller('academicos')
export class AcademicosController {

    constructor(
        private readonly _academicoService: AcademicosService,
        private readonly _estadisticaService: EstadisticaService,
    ) { }

    @Post()
    public registrarAcademico(@Body() academico: CreateAcademicoDto) {
        console.log(academico)
        return this._academicoService.crearAcademico(academico);
    }

    @Get('cantidad-informes')
    public async obtenerCantidadInformes() {
        return await this._academicoService.cantidadInformesPorAcademico()
    }

    @Get(':id')
    public async obtenerAcademico(@Param('id') id_academico: string) {
        const id = +id_academico; // Convierte a número
        if (isNaN(id)) {
            throw new BadRequestException('El ID debe ser un número válido');
        }
        console.log(id);
        return await this._academicoService.obtenerAcademico(id);
        //return await this._academicoService.obtenerAcademico(+id_academico);
    }

    @Get()
    public async obtenerAcademicos() {
        return await this._academicoService.obtenerAcademicos();
    }

    @Patch('subir-correccion')
    @UseInterceptors(FileInterceptor('file'))
    public async subirCorreccion(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }), // Máximo 20MB
                ],
                exceptionFactory: () => new BadRequestException('Archivo Inválido'),
            }),
        ) file: Express.Multer.File,
        @Body() data: CrearInformeCorreccion,
    ) {
        try {
            console.log('Datos recibidos:', data); // Inspección del body
            console.log('Archivo recibido:', file); // Inspección del archivo



            // Llamar al servicio para almacenar la información en la base de datos
            return await this._academicoService.subirCorreccion(file, data, 'archivosBackend');
        } catch (error) {
            throw error;
        }
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

    @Get('estadistica/estado-aprobacion')
    async getEstadoAprobacionAcademico(@Query('id_academico', ParseIntPipe) id_academico) {
        try {
            return this._estadisticaService.cantidadReprobadosAprobadosPorAcademico(id_academico);
        } catch (error) {
            throw new InternalServerErrorException('Error interno al obtener la cantidad de aprobados y reprobados')
        }
    }

    @Get('data/resultados-practica/conteo')
    async obtenerResultadoPracticasByAcademico(@Query('id_academico') id_academico: number) {
        const data = await this._academicoService.getReprobadosYAprobadosByAcademico(+id_academico)
        return data;
    }

    @Get('data/resultados-practica/conteo/informes-practica')
    async obtenerInformesPracticasByAcademicoPorMes(@Query('id_academico') id_academico: number) {
        console.log(id_academico)
        const data = await this._academicoService.getInformesPorMesYPractica(+id_academico);
        console.log(data)
        return data;
    }

    @Post('practicas/actualizar/desaprobar')
    async reprobarPractica(@Query('id_practica', ParseIntPipe) id_practica: number) {
        try {
            return await this._academicoService.reprobarPractica(id_practica);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Error interno al desaprobar práctica')
        }
    }
}


