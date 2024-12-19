import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { PreguntasImplementadasConfidencialService } from './preguntas-implementadas-confidencial.service';
import { AsignarPreguntaDto} from '../preguntas-implementadas-informe-alumno/dto/asignar-preguntas.dto';

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
    public async implementarPreguntas(@Body() pregunta: AsignarPreguntaDto[]){
        return await this._preguntasConfidencial.implementarPreguntas(pregunta);
    }
    @Get()
    public async obtenerPreguntas(){
        return await this._preguntasConfidencial.mostrarPreguntas();
    }

    // @Put('actualizar-varios')
    // public async actualizarPreguntas(preguntas: AsignarPreguntaDto[]){
    //     return this._preguntasConfidencial.actualizarPreguntas(preguntas);
    // }
}
