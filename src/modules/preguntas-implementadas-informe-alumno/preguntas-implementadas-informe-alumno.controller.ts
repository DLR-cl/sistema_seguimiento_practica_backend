import { Controller, Get, Post } from '@nestjs/common';
import { PreguntasImplementadasInformeAlumnoService } from './preguntas-implementadas-informe-alumno.service';
import { AsignarPreguntaDto } from './dto/asignar-preguntas.dto';

@Controller('preguntas-implementadas-informe-alumno')
export class PreguntasImplementadasInformeAlumnoController {
    constructor(
        private readonly _preguntaAlumnoService: PreguntasImplementadasInformeAlumnoService
    ){}

    @Get()
    public async obtenerPreguntas(){
        return await this._preguntaAlumnoService.obtenerPreguntas();
    }

    @Post('asociar')
    public async implementarPreguntas(pregunta: AsignarPreguntaDto){
        return await this._preguntaAlumnoService.asignarPregunta(pregunta);
    }
}
