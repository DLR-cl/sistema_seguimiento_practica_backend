import { Body, Controller, Get, Post } from '@nestjs/common';
import { AsignarPreguntasDto } from '../preguntas-implementadas-informe-alumno/dto/asignar-preguntas.dto';
import { AsignaturasService } from './asignaturas.service';
import { crearAsignaturaDto, crearAsignaturasDto } from './dto/crear-asignatura.dto';
import { ApiHeader, ApiTags } from '@nestjs/swagger';

@ApiHeader({
    name: 'Controlador de Asignatura',
    description: 'Se tienen las rutas para generar una y muchas asignaturas',
})
@Controller('asignaturas')
export class AsignaturasController {
    
    constructor(
        private readonly _asignaturasService: AsignaturasService,
    ){}

    @Post('generar')
    public async generarAsignatura(@Body() asignatura: crearAsignaturaDto){
        return await this._asignaturasService.crearAsignatura(asignatura);
    }

    @Post('generar-varios')
    public async generarAsignaturas(@Body() asignaturas: crearAsignaturaDto[]){
        return await this._asignaturasService.createAsignaturas(asignaturas);
    }
    
    @Get()
    public async obtenerAsignaturas(){
        return await this._asignaturasService.getAllAsignaturas();
    }    
}
