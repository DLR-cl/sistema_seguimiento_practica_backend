import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportePracticaQueryDto } from './dto/reporte-practica.dto';
import { ReporteResultadoAcademicoService } from '../../services/generacion-reportes/generacion-excel/reporte-resultado-academico/reporte-resultado-academico.service';
import { ResultadoAlumnoService } from '../../services/generacion-reportes/generacion-excel/resultado-alumno/resultado-alumno.service';
import { GeneracionExcelService } from '../../services/generacion-reportes/generacion-excel/generacion-excel.service';
@Controller('reportes-practica')
export class ReportesPracticaController {

    constructor(
        private readonly generacionExcelService: GeneracionExcelService,
        private readonly reporteResultadoAcademicoService: ReporteResultadoAcademicoService,
        private readonly resultadoAlumnoService: ResultadoAlumnoService
    ) {}

    @Get()
    public async obtenerExcelReportesPractica(@Res() res: Response, @Query() query: ReportePracticaQueryDto) {
        try {
            const excel = await this.generacionExcelService.generarExcelResultadoPractica(
                query.fechaInicio, 
                query.fechaFin, 
            );

            // Configurar los headers para la descarga del archivo
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=reporte_practica.xlsx');
            
            // Enviar el archivo
            return res.send(excel);
        } catch (error) {
            console.error('Error al generar el reporte:', error);
            return res.status(500).json({
                message: 'Error al generar el reporte',
                error: error.message
            });
        }
    }

    @Get('informe-confidencial')
    public async obtenerExcelInformeConfidencial(@Res() res: Response, @Query() query: ReportePracticaQueryDto) {
        try {
            console.log('hola', query)
            const excel = await this.generacionExcelService.generarExcelInformeConfidencial(
                new Date(query.fechaInicio), 
                new Date(query.fechaFin),
            );

            // Configurar los headers para la descarga del archivo
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=reporte_practica.xlsx');
            
            // Enviar el archivo
            return res.send(excel);
        } catch (error) {
            console.error('Error al generar el reporte:', error);
            return res.status(500).json({
                message: 'Error al generar el reporte',
                error: error.message
            });
        }
    }

    @Get('resultado-academico')
    public async obtenerExcelResultadoAcademico(@Res() res: Response, @Query() query: ReportePracticaQueryDto) {
        try {
            
            const excel = await this.reporteResultadoAcademicoService.generarReporteResultadoAcademico(
                new Date(query.fechaInicio), 
                new Date(query.fechaFin),
            );

            // Configurar los headers para la descarga del archivo
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=reporte_resultado_academico.xlsx');

            // Enviar el archivo
            return res.send(excel);
        } catch (error) {
            console.error('Error al generar el reporte:', error);
            return res.status(500).json({
                message: 'Error al generar el reporte',
                error: error.message
            });
        }
    }

    @Get('resultado-alumno')
    public async obtenerExcelResultadoAlumno(@Res() res: Response, @Query() query: ReportePracticaQueryDto) {
        try {
            const excel = await this.resultadoAlumnoService.generarExcelResultadosPracticasAlumnos(
                new Date(query.fechaInicio), 
                new Date(query.fechaFin), 
            )

            // Configurar los headers para la descarga del archivo
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=reporte_resultado_alumno.xlsx');

            // Enviar el archivo
            return res.send(excel);
        } catch (error) {
            console.error('Error al generar el reporte:', error);
            return res.status(500).json({
                message: 'Error al generar el reporte',
                error: error.message
            });
        }
    }
}