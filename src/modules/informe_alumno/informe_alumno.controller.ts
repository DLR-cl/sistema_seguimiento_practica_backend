import { BadRequestException, Body, Controller, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CreateInformeAlumnoDto } from './dto/create-informe-alumno.dto';
import { InformeAlumnoService } from './informe_alumno.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';


@Controller('informe-alumno')
export class InformeAlumnoController {

    constructor(
        private readonly _informeAlumnoService: InformeAlumnoService,
    ) { }

    @Post('crear-informe')
    public crearInformeAlumno(@Body() informe: CreateInformeAlumnoDto) {
        this._informeAlumnoService.crearInformeAlumno(informe);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, callback) => {
                const fileNameSplit = file.originalname.split(".");
                console.log(file);
                const fileExt = fileNameSplit[fileNameSplit.length - 1];
                callback(null, `${Date.now()}.${fileExt}`);
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
    ) file: Express.Multer.File) {
        return {
            message: 'Archiva subido exitosamente',
            filename: file.originalname,
            path: file.path
        }
    }
    // hacer otra ruta para poder subir el archivo, la creación del informe contemplará lo demás sin el archivo, es por medio
    // del servicio que se cambiará parte del informe añadiendole la ruta en la cual se encuentra.
}
