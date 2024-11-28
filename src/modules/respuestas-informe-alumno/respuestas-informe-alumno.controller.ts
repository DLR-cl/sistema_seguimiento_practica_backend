import { Body, Controller, Get, Post } from '@nestjs/common';
import { PreguntasImplementadasInformeAlumnoService } from '../preguntas-implementadas-informe-alumno/preguntas-implementadas-informe-alumno.service';
import { AsignaturasRespuestaDto, ListaRespuestaDto } from './dto/create-respuesta-informe-alumno.dto';
import { RespuestasInformeAlumnoService } from './respuestas-informe-alumno.service';

@Controller('respuestas-informe-alumno')
export class RespuestasInformeAlumnoController {

    constructor(
        private readonly _respuestaInformeAlumno: RespuestasInformeAlumnoService,
    ){}

    @Get()
    public async obtenerRespuestasInforme(){
        return await this._respuestaInformeAlumno.getAllRespuestas();
    }
    

    @Post()
    public async asociarRespuesta(@Body() respuestas: ListaRespuestaDto){
        return await this._respuestaInformeAlumno.crearRespuesta(respuestas);
    }

    @Post('asignaturas')
    public async asociarAsignaturasRespuesta(@Body() asignaturas: AsignaturasRespuestaDto){
        return await this._respuestaInformeAlumno.asignarRespuestasAsignaturasRespuesta(asignaturas);
    }
}
