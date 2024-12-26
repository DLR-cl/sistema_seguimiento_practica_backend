import { BadRequestException, Body, Controller, Get, InternalServerErrorException, Param, ParseIntPipe, Post, Query, Res } from '@nestjs/common';
import { EvaluacionAcademicaService } from './evaluacion-academica.service';
import { InformeEvaluativoDto } from '../dto/informe-evaluativo.dto';
import { AsignarPreguntaDto } from '../../../modules/preguntas-implementadas-informe-alumno/dto/asignar-preguntas.dto';
import { GeneratorPdfService } from './services/generator-pdf.service';
import { Response } from 'express';

@Controller('evaluacion-academica')
export class EvaluacionAcademicaController {

    constructor(
        private readonly _evaluacionAcademicaService: EvaluacionAcademicaService,
        private readonly _generatePdfService: GeneratorPdfService,
    ) { }

    @Post()
    async crearInformeEvaluativo(@Body() informe: InformeEvaluativoDto) {
        try {
            return this._evaluacionAcademicaService.crearInformeEvaluacionAcademicos(informe)
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new InternalServerErrorException('Error interno al momento de generar un informe');
        }
    }

    @Get('obtener-respuestas/:id')
    async obtenerPreguntasRespuestasContestadas(@Param('id', ParseIntPipe) informe_evaluativo_id: number) {
        try {
            return await this._evaluacionAcademicaService.obtenerResultados(informe_evaluativo_id);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Error interno al obtener las respuestas de los informes');
        }
    }

    @Get('obtener-preguntas-implementadas')
    async obtenerPreguntasImplementadas() {
        return await this._evaluacionAcademicaService.obtenerPreguntasImplementadas();
    }

    @Post('implementar-preguntas')
    async implementarPreguntas(@Body() preguntas: AsignarPreguntaDto[]) {
        return await this._evaluacionAcademicaService.asociarPreguntasInforme(preguntas)
    }


    @Get('generate')
    async generatePdf(
        @Res() res: Response,
        @Query('id_practica', ParseIntPipe) id_practica: number,
        @Query('id_informe_evaluativo', ParseIntPipe) id_informe_evaluativo: number,
        @Query('id_docente', ParseIntPipe) id_docente: number
        ) {
        const data = {
            items: [
                { aspecto: 'Formato', calificacion: 'T' },
                { aspecto: 'Redacción', calificacion: 'R' },
                { aspecto: 'Portada', calificacion: 'S' },
            ],
        };

        try {
            const pdfBuffer = await this._generatePdfService.generatePdf(id_practica, id_informe_evaluativo, id_docente);

            // Configurar encabezados
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="evaluacion-${id_docente || 'usuario'}.pdf"`,
                'Content-Length': pdfBuffer.byteLength, // Asegura el tamaño correcto
            });

            // Enviar el buffer
            res.end(pdfBuffer);
        } catch (error) {
            console.error('Error al generar el PDF:', error);
            res.status(500).send('Error al generar el PDF');
        }
    }

}
