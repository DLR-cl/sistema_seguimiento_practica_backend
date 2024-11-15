import { Body, Controller, Post } from '@nestjs/common';
import { CreateInformeConfidencialDto } from './dto/create-informe-confidencial.dto';
import { InformeConfidencialService } from './informe-confidencial.service';

@Controller('informe-confidencial')
export class InformeConfidencialController {

    constructor(
        private readonly _informeConfidencialService: InformeConfidencialService,
    ){}

    @Post('generar')
    public generarInformeConfidencial(@Body() informe: CreateInformeConfidencialDto){
        return this._informeConfidencialService.generarInformeConfidencial(informe);
    }
}
