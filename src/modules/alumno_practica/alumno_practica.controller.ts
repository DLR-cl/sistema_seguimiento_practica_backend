import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AlumnoPracticaDto } from './dto/alumno-practica.dto';
import { AlumnoPracticaService } from './alumno_practica.service';

@Controller('alumno-practica')
export class AlumnoPracticaController {

    constructor(private readonly _alumnoService: AlumnoPracticaService){}
    
    @Post('registro')
    public registrar(@Body() alumno_practica: AlumnoPracticaDto){
        console.log(alumno_practica)
        return this._alumnoService.createAlumnoPractica(alumno_practica);
    }

    @Get(':id')
    public getAlumno(@Param('id') id: string){
        return this._alumnoService.getAlumnoPracticante(+id);
    }

    @Get()
    public getAlumnos(){
        return this._alumnoService.getAlumnos();
    }
}
