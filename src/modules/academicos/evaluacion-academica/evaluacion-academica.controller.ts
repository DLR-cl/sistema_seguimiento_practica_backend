import { BadRequestException, Body, Controller, Get, InternalServerErrorException, Param, ParseIntPipe, Post } from '@nestjs/common';
import { EvaluacionAcademicaService } from './evaluacion-academica.service';
import { InformeEvaluativoDto } from '../dto/informe-evaluativo.dto';

@Controller('evaluacion-academica')
export class EvaluacionAcademicaController {

    constructor(
        private readonly _evaluacionAcademicaService: EvaluacionAcademicaService,
    ){}

    @Post()
    async crearInformeEvaluativo(@Body() informe: InformeEvaluativoDto){
        try {
            return this._evaluacionAcademicaService.crearInformeEvaluacionAcademicos(informe)
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }

            throw new InternalServerErrorException('Error interno al momento de generar un informe');
        }
    }

    @Get('obtener-respuestas/:id')
    async obtenerPreguntasRespuestasContestadas(@Param('id', ParseIntPipe) informe_evaluativo_id: number){
        try {
            return await this._evaluacionAcademicaService.obtenerResultados(informe_evaluativo_id);
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
            throw new InternalServerErrorException('Error interno al obtener las respuestas de los informes');
        }
    }
}
