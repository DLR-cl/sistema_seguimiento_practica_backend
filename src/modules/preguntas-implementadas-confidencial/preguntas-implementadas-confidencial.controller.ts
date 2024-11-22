import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { PreguntasImplementadasConfidencialService } from './preguntas-implementadas-confidencial.service';
import { AsignarPreguntaDto, AsignarPreguntasDto } from '../preguntas-implementadas-informe-alumno/dto/asignar-preguntas.dto';

@Controller('preguntas-implementadas-confidencial')
export class PreguntasImplementadasConfidencialController {
    constructor(
        private readonly _preguntasConfidencial: PreguntasImplementadasConfidencialService,
    ){}

    @Post('crear')
    public async implementarPregunta(@Body() pregunta: AsignarPreguntaDto){
        return await this._preguntasConfidencial.implementarPregunta(pregunta);
    }

    @Post('crear-varios')
    public async implementarPreguntas(@Body() preguntas: AsignarPreguntasDto){
        return await this._preguntasConfidencial.implementarPreguntas(preguntas);
    }
    @Get()
    public async obtenerPreguntas(){
        return await this._preguntasConfidencial.mostrarPreguntas();
    }

    @Put('actualizarPreguntas')
    public async actualizarPreguntas(preguntas: AsignarPreguntasDto){
        return this._preguntasConfidencial.actualizarPreguntas(preguntas);
    }
}
