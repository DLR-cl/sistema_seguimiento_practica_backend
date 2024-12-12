import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CreateInformeConfidencialDto } from './dto/create-informe-confidencial.dto';
import { InformeConfidencialService } from './informe-confidencial.service';

@Controller('informe-confidencial')
export class InformeConfidencialController {

    constructor(
        private readonly _informeConfidencialService: InformeConfidencialService,
    ){}
    
    @Get('informes/:id_supervisor')
    public async getInformesBySupervisor(@Param('id_supervisor', ParseIntPipe) id_supervisor: number){
        return await this._informeConfidencialService.getInformesConfidenciales(id_supervisor);
    }

    @Get(':id_informe')
    public async getInforme(@Param('id_informe', ParseIntPipe) id_informe: number){
        return await this._informeConfidencialService.getInformeConfidencial(id_informe);
    }
}
