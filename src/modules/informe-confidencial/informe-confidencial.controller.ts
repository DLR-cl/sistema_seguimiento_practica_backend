import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ActualizarInformeConfidencialDto, CreateInformeConfidencialDto } from './dto/create-informe-confidencial.dto';
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

    @Patch('actualizar-informe/:id')
    public async actualizarInforme(@Param('id', ParseIntPipe) id_informe: number, @Body() update: ActualizarInformeConfidencialDto){
        return await this._informeConfidencialService.actualizarInforme(+id_informe, update);
    }

    @Get('obtener-respuestas/:id')
    public async obtenerRespuestasInforme(@Param('id', ParseIntPipe) id_informe: number){
        return await this._informeConfidencialService.obtenerResultadosInformeConfidencial(id_informe);
    }
}
