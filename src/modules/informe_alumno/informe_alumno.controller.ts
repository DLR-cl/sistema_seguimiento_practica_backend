import { BadRequestException, Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, NotFoundException, Param, ParseFilePipe, ParseIntPipe, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CreateInformeAlumnoDto } from './dto/create-informe-alumno.dto';
import { InformeAlumnoService } from './informe_alumno.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { InformeDto } from './dto/informe_pdf.dto';
import { Response } from 'express';

const rootPath = process.cwd();
@Controller('informe-alumno')
export class InformeAlumnoController {

    constructor(
        private readonly _informeAlumnoService: InformeAlumnoService,
    ) { }

    @Post()
    public async crearInformeAlumno(@Body() informe: CreateInformeAlumnoDto) {
        return await this._informeAlumnoService.crearInformeAlumno(informe);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: join(rootPath, 'uploads'),
            filename: (req, file, callback) => {

                callback(null, file.originalname);
            },
        }),
    }))
    public async subirInforme(@UploadedFile(
        new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }),
                new FileTypeValidator({ fileType: 'application/pdf' })
            ],
            exceptionFactory: (errors) => new BadRequestException('Archivo inválido')
        })
    ) file: Express.Multer.File, @Body() body: {id: string}) {
        const { id } = body;
        const path = require('path');
        const fs = require('fs');

        const originalPath = path.resolve(file.path);
        console.log(originalPath);
        const extension = extname(file.originalname);
        const nuevoNombre = `informe-${id}${extension}`;
        const filePath = join(rootPath, 'uploads', nuevoNombre);
        fs.renameSync(originalPath, filePath);

        return await this._informeAlumnoService.asociarArchivoAlumno(+body.id, nuevoNombre)
    }
    // hacer otra ruta para poder subir el archivo, la creación del informe contemplará lo demás sin el archivo, es por medio
    // del servicio que se cambiará parte del informe añadiendole la ruta en la cual se encuentra.

    @Get(':id/archivo')
    async getArchivo(@Param('id') id: string, @Res() res:Response){
        try {
            
            const filePath = await this._informeAlumnoService.getArchivo(+id);
            return res.sendFile(filePath);
        } catch (error) {
            if(error instanceof NotFoundException){
                throw error;
            }
            throw new NotFoundException('Hubo un problema al procesar el archivo');
        }
    }

    @Get('existeRespuesta/:id_practica')
    public async existeRespuestas(@Param('id_practica') id_practica: string){
        return await this._informeAlumnoService.existeRespuestaInforme(+id_practica);
    }
}
