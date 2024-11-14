import { Body, Controller, Post } from '@nestjs/common';
import { CreateInformeAlumnoDto } from './dto/create-informe-alumno.dto';

@Controller('informe-alumno')
export class InformeAlumnoController {

    @Post('crear-informe')
    public crearInformeAlumno(@Body() infome: CreateInformeAlumnoDto){
        
    }
}
