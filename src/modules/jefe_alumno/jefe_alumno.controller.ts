import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { JefeAlumnoDto } from './dto/jefe-alumno.dto';
import { JefeAlumnoService } from './jefe_alumno.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Tipo_usuario } from '@prisma/client';

@Controller('jefe-alumno')
export class JefeAlumnoController {
    constructor(
        private readonly _jefeAlumnoService: JefeAlumnoService
    ){}

    @Roles(Tipo_usuario.JEFE_DEPARTAMENTO, Tipo_usuario.JEFE_CARRERA)
    @Post('registrar')
    registrar(@Body() jefe_alumno: JefeAlumnoDto){
        return this._jefeAlumnoService.registrarJefe(jefe_alumno);
    }

    
    @Get(':id')
    async getJefe(@Param('id') id: string){
        return await this._jefeAlumnoService.getJefeAlumno(+id);
    }
}
