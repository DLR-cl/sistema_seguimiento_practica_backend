import { Controller, Get, Param, Post } from '@nestjs/common';
import { AsignaturasRespuestaAlumnoService } from './asignaturas-respuesta-alumno.service';
import { AsignaturasRespuestasDto, AsociarPreguntasDto } from './dto/asociar-preguntas.dto';

@Controller('asignaturas-respuesta-alumno')
export class AsignaturasRespuestaAlumnoController {

    constructor(
        private readonly _respuestaAsignaturaService: AsignaturasRespuestaAlumnoService,
    ){}

    @Post()
    public async asignarRespuestasAsignaturasARespuestas(asignatura: AsociarPreguntasDto){
        this._respuestaAsignaturaService.asociarAsignaturas(asignatura);
    }
    
    @Get()
    public async obtenerRespuestasAsignaturas(){
        return await this._respuestaAsignaturaService.getAllRespuestasAsignaturas();
    }

    @Get(':nombre')
    public async obtenerRespuestaAsignaturaByName(@Param('nombre') nombre: string){
        return this._respuestaAsignaturaService.getAllIncidenciasAsignaturas(nombre);
    }
}

