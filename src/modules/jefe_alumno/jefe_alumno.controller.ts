import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { JefeAlumnoDto } from './dto/jefe-alumno.dto';
import { JefeAlumnoService } from './jefe_alumno.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Tipo_usuario } from '@prisma/client';

@Controller('jefe-alumno')
export class JefeAlumnoController {
    constructor(
        private readonly _jefeAlumnoService: JefeAlumnoService
    ){}


    @Post()
    async registrar(@Body() jefe_alumno: JefeAlumnoDto){
        return await this._jefeAlumnoService.registrarJefe(jefe_alumno);
    }

    
    @Get(':id')
    async getJefe(@Param('id') id: string){
        return await this._jefeAlumnoService.getJefeAlumno(+id);
    }

    @Get(':id/lista-informes')
    public async getListaInformes(@Param('id', ParseIntPipe) id_supervisor: number){
        return await this._jefeAlumnoService.getEstadoPracticasAsociadas(id_supervisor);
    }
}
