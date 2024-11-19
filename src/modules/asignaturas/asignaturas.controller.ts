import { Body, Controller, Post } from '@nestjs/common';
import { AsignarPreguntasDto } from '../preguntas-implementadas-informe-alumno/dto/asignar-preguntas.dto';
import { AsignaturasService } from './asignaturas.service';
import { crearAsignaturaDto, crearAsignaturasDto } from './dto/crear-asignatura.dto';

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
    public async generarAsignaturas(@Body() asignaturas: crearAsignaturasDto){
        return await this.generarAsignaturas(asignaturas);
    }   
}
