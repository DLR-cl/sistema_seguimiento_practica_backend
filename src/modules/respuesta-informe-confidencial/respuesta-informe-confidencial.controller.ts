import { Body, Controller, Post } from '@nestjs/common';
import { CreateRespuestaInformConfidencialDto } from './dto/respuesta.dto';
import { RespuestaInformeConfidencialService } from './respuesta-informe-confidencial.service';

@Controller('respuesta-informe-confidencial')
export class RespuestaInformeConfidencialController {

    constructor(
        private readonly _respuestaConfidencialService: RespuestaInformeConfidencialService
    ){}
    @Post()
    async generarRespuestas(@Body() respuestas: CreateRespuestaInformConfidencialDto[]){
        return this._respuestaConfidencialService.crearRespuestas(respuestas);
    }
}
