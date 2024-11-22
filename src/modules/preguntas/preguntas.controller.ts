import { Body, Controller, Get, Post } from '@nestjs/common';
import { CrearPreguntaDto } from './dto/crear-pregunta.dto';
import { PreguntasService } from './preguntas.service';
import { CrearPreguntasDto } from './dto/crear-preguntas.dto';

@Controller('preguntas')
export class PreguntasController {

    constructor(
        private readonly _preguntaService: PreguntasService,
    ){}

    @Post('crear')
    public async crearPregunta(@Body() pregunta: CrearPreguntaDto){
        return await this._preguntaService.crearPregunta(pregunta);
    }

    @Post('crear-varios')
    public async crearVariasPreguntas(@Body() preguntas: CrearPreguntasDto){
        return await this._preguntaService.crearPreguntas(preguntas);
    }

    @Get()
    public async obtenerPreguntas(){
        return this._preguntaService.getAllPreguntas();
    }
  
}
