import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { JefeAlumnoDto } from './dto/jefe-alumno.dto';
import { JefeAlumnoService } from './jefe_alumno.service';

@Controller('jefe-alumno')
export class JefeAlumnoController {
    constructor(
        private readonly _jefeAlumnoService: JefeAlumnoService
    ){}
    @Post('registrar')
    registrar(@Body() jefe_alumno: JefeAlumnoDto){
        return this._jefeAlumnoService.registrarJefe(jefe_alumno);
    }

    @Get(':id')
    async getJefe(@Param('id') id: string){
        return await this._jefeAlumnoService.getJefeAlumno(+id);
    }
}
