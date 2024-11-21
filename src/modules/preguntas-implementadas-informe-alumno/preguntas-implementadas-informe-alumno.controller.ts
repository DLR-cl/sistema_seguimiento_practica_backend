import { Controller, Get, Post } from '@nestjs/common';
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

    @Post('asociar')
    public async implementarPregunta(pregunta: AsignarPreguntaDto){
        return await this._preguntaAlumnoService.asignarPregunta(pregunta);
    }

    @Post('asociar-varios')
    public async implementarPreguntas(pregunta: AsignarPreguntasDto){
        return await this._preguntaAlumnoService.asignarPreguntas(pregunta);
    }
}
