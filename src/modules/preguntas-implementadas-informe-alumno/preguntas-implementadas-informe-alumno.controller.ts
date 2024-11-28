import { Body, Controller, Get, Post } from '@nestjs/common';
import { PreguntasImplementadasInformeAlumnoService } from './preguntas-implementadas-informe-alumno.service';
import { AsignarPreguntaDto, AsignarPreguntasDto } from './dto/asignar-preguntas.dto';

@Controller('preguntas-implementadas-informe-alumno')
export class PreguntasImplementadasInformeAlumnoController {
    constructor(
        private readonly _preguntaAlumnoService: PreguntasImplementadasInformeAlumnoService
    ){}

    @Get()
    public async obtenerPreguntas(){
        return await this._preguntaAlumnoService.obtenerPreguntas();
    }

    @Post()
    public async implementarPregunta(@Body() pregunta: AsignarPreguntaDto){
        return await this._preguntaAlumnoService.asignarPregunta(pregunta.id_pregunta);
    }

    @Post('asociar-varios')
    public async implementarPreguntas(@Body() pregunta: AsignarPreguntasDto){
        return await this._preguntaAlumnoService.asignarPreguntas(pregunta);
    }
}
