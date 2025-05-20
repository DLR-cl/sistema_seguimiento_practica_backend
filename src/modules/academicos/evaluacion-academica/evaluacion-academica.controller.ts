import { BadRequestException, Body, Controller, Get, HttpException, HttpStatus, InternalServerErrorException, Param, ParseIntPipe, Post, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { EvaluacionAcademicaService } from './evaluacion-academica.service';
import { InformeEvaluativoDto } from '../dto/informe-evaluativo.dto';
import { AsignarPreguntaDto } from '../../../modules/preguntas-implementadas-informe-alumno/dto/asignar-preguntas.dto';
import { Response } from 'express';
import { ReportesExcelService } from './services/reportes-excel.service';
import { TipoPractica } from '@prisma/client';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { DataGeneracionInformeService } from './services/data-generacion-informe-pdf/data-generacion-informe.service';
import { GenerarPdfInformeService } from './services/generar-pdf-informe/generar-pdf-informe.service';
@Controller('evaluacion-academica')
export class EvaluacionAcademicaController {

    constructor(
        private readonly _evaluacionAcademicaService: EvaluacionAcademicaService,
        private readonly _reporteexcelService: ReportesExcelService,
        private readonly _dataGeneracionInformeService: DataGeneracionInformeService,
        private readonly _generarPdfInformeService: GenerarPdfInformeService
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




    @Get('reportes/generar/historico')
    async generarReporteRespuestaHistoricas(@Res() res: Response){
        return await this._reporteexcelService.getRespuestasHistoricaEvaluacion(res);
    }

    @Get('reportes/generar/practicas/periodo')
    async getRespuestasEvaluacionPorPracticaYPeriodo(
        @Query('fecha_ini') fechaInicio: string,
        @Query('fecha_fin') fechaFin: string,
        @Res() res: Response,
    ) {
        try {
            // Validar que los parámetros estén presentes
            if (!fechaInicio || !fechaFin) {
                throw new BadRequestException('Los parámetros fecha_ini y fecha_fin son obligatorios.');
            }

            // Convertir las fechas de string a objetos Date
            const fechaIni = new Date(fechaInicio);
            const fechaFinDate = new Date(fechaFin);

            // Validar que las fechas sean válidas
            if (isNaN(fechaIni.getTime()) || isNaN(fechaFinDate.getTime())) {
                throw new BadRequestException('Los parámetros fecha_ini y fecha_fin deben ser fechas válidas en formato ISO.');
            }

            // Llamar al servicio para generar el reporte
            await this._reporteexcelService.getRespuestasEvaluacionPorPracticaYPeriodo(
                fechaIni,
                fechaFinDate,
                res,
            );
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error; // Retornar el error de validación si aplica
            }
            console.error('Error al procesar la solicitud:', error);
            throw new BadRequestException('No se pudo generar el reporte. Inténtelo más tarde.');
        }
    }

    @Get('reportes/generar/confidencial/practicas/periodo')
    async generarExcelRespuestasConfidencialPorPeriodo(
        @Query('fecha_ini') fechaInicio: string,
        @Query('fecha_fin') fechaFin: string,
        @Res() res: Response,
    ) {
        try {
            // Validar que los parámetros estén presentes
            if (!fechaInicio || !fechaFin) {
                throw new BadRequestException('Los parámetros fecha_ini y fecha_fin son obligatorios.');
            }

            // Convertir las fechas de string a objetos Date
            const fechaIni = new Date(fechaInicio);
            const fechaFinDate = new Date(fechaFin);

            // Validar que las fechas sean válidas
            if (isNaN(fechaIni.getTime()) || isNaN(fechaFinDate.getTime())) {
                throw new BadRequestException('Los parámetros fecha_ini y fecha_fin deben ser fechas válidas en formato ISO.');
            }

            // Llamar al servicio para generar el reporte
            await this._reporteexcelService.generarExcelRespuestasConfidencialByPeriodo(
                fechaIni,
                fechaFinDate,
                res,
            );
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error; // Retornar el error de validación si aplica
            }
            console.error('Error al generar el reporte confidencial:', error);
            throw new InternalServerErrorException('No se pudo generar el reporte confidencial. Inténtelo más tarde.');
        }
    }   

    @Get('generar/academicos/informes/fechas')
    public async generarReportesPorFecha(
      @Query('fecha_in') fecha_in: string,
      @Query('fecha_fin') fecha_fin: string,
      @Res() res: Response
    ) {
      try {
        // Validar fechas
        if (!fecha_in || !fecha_fin) {
          throw new HttpException(
            'Los parámetros fecha_in y fecha_fin son obligatorios.',
            HttpStatus.BAD_REQUEST
          );
        }
  
        const fechaInicio = new Date(fecha_in);
        const fechaFin = new Date(fecha_fin);
  
        if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
          throw new HttpException(
            'Las fechas proporcionadas no son válidas.',
            HttpStatus.BAD_REQUEST
          );
        }
  
        // Generar el archivo Excel
        const buffer = await this._reporteexcelService.generarExcelReporteAcademicoInformes(
          fechaInicio,
          fechaFin,
          res,
        );
  
        // Configurar la respuesta para la descarga del archivo
        const fileName = `reporte_informes_academicos_${fecha_in}_a_${fecha_fin}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(buffer);
      } catch (error) {
        console.error('Error al generar el reporte:', error);
        throw new HttpException(
          'Ocurrió un error al generar el reporte.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }

    @UseGuards(AuthGuard)
    @Get('obtener/informes/listar')
    async listarInformesEvaluativos(@Req() res: any){
        try {
            const { rol } = res.user;
            if(rol === 'ADMINISTRADOR'){
                return await this._evaluacionAcademicaService.listarInformesEvaluativos();
            }
            throw new UnauthorizedException('No está autorizado para realizar esta operación');
                
        } catch (error) {
            if(error instanceof BadRequestException || error instanceof UnauthorizedException){
                throw error;
            }       
            throw new InternalServerErrorException('Error interno al listar los informes');
        }
    }


    @Get('obtener-informe/evaluacion-practica')
    async obtenerInformeEvaluacionPractica(@Res() res: Response, @Query('id_practica') id_practica: number){
        // descargar pdf
        const pdf = await this._generarPdfInformeService.generarPdfInforme(+id_practica);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=informe_evaluacion_practica.pdf');
        res.send(pdf);
        return pdf;
    }
}
