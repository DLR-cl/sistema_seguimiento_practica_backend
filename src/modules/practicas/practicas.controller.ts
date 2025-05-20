import { BadRequestException, Body, Controller, Delete, Get, InternalServerErrorException, Param, ParseIntPipe, Patch, Post, Query, Req, Res, UnauthorizedException, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { PracticasService } from "./practicas.service";
import { createPracticaDto } from "./dto/create-practicas.dto";
import { ReportesExcelService } from "./services/reportes-excel/reportes-excel.service";
import { AutoFuncService } from "./services/auto-func/auto-func.service";
import { ExtensionPractica } from "./dto/practica-response.dto";
import { Estado_informe, TipoPractica } from "@prisma/client";
import { GenerarReporteSemestralDto } from "./dto/reportes.dto";
import { Response } from "express";
import { AuthGuard } from "../../auth/guards/auth.guard";

@Controller('practicas')
export class PracticasController {
    constructor(
        private readonly _practicaService: PracticasService,
        private readonly _reporteService: ReportesExcelService,
        private readonly _autofuncService: AutoFuncService,
    ) { }

    @Get('obtener/reporte')
    public async getobtena() {
        //return await this._reporteService.generarReporteSemestral();
    }
    @Post()
    public generarPractica(@Body() practica: createPracticaDto) {
        return this._practicaService.generarPractica(practica);
    }

    @Get(':id')
    public async getPractica(@Param('id', ParseIntPipe) id_practica: number) {
        return await this._practicaService.getPractica(id_practica);
    }

    @Get()
    public async getAllPracticas() {
        return await this._practicaService.getAllPracticas();
    }

    @Get('alumno/:id')
    public async getPracticaByAlumno(@Param('id') id_alumno: string) {
      console.log('Handling CORS for alumno route');
      return await this._practicaService.getPracticaAlumno(+id_alumno);
    }

    //TODO: Hacer que los informes se generen en local
    @Get('informes/generar')
    public async creacionPracticas() {
        console.log('Creando informes...')
        await this._autofuncService.actualizarEstadoPracticas();
        await this._autofuncService.generarInformeConfidencial();
        await this._autofuncService.generarInformeAlumno();
        return {
            message: 'actualizado'
        }
    }

    @Patch('extender')
    public async extenderPractica(@Body() practicaExtender: ExtensionPractica) {
        try {
            return this._practicaService.extenderPractica(practicaExtender.id_practica, practicaExtender.fecha_fin_ext)
        } catch (error) {
            if (error instanceof BadRequestException) {
                error;
            }
            throw new InternalServerErrorException('Error interno al extender la práctica');
        }
    }
    //TODO: Hacer que los reportes se guarden en local
    @Get('reportes/generar/semestral')
    @UsePipes(new ValidationPipe({ transform: true }))
    public async generarReporteSemestral(
        @Query() query: GenerarReporteSemestralDto,
        @Res() res: Response
    ) {
        try {
            const { practica, fecha_in, fecha_fin } = query;
            console.log(query)
            return await this._reporteService.generarReporteSemestral(practica, new Date(fecha_in), new Date(fecha_fin), res)
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            } else {
                throw new InternalServerErrorException('Error interno al obtener el reporte semestral')
            }
        }
    }

    //TODO: Modificar para que los busque en local

    @Get('reportes/obtener/listar')
    public async listarPorAnoYPractica(
        @Query('practica') tipoPractica: TipoPractica,
        @Query('ano') ano: number,
        @Query('informe') informe: string
    ): Promise<string[]> {
        return this._reporteService.listarReportesPorAnoYPractica(ano, tipoPractica, informe);
    }
    
    @Get('reportes/obtener/listar/semanal')
    public async listarReportesSemanalByMes(
        @Query('tipoPractica') tipoPractica: 'PRACTICA_UNO' | 'PRACTICA_DOS',
        @Query('anio') anio: number,
        @Query('mes') mes: string,
    ) {
        console.log(tipoPractica)
        console.log(anio, mes)
        return await this._reporteService.listarReportesSemanalesByMes(
            tipoPractica,
            anio,
            mes,
          );
    };
    
    //TODO: Modificar para que los busque en local
    @Get('reportes/archivo/descargar')
    public async descargarArchivo(
        @Query('ruta') ruta: string, // Ruta del archivo en el servidor FTP
        @Res() res: Response
    ) {
        try {
            const buffer = await this._reporteService.obtenerReporte(ruta);

            // Configurar cabeceras para la descarga
            const fileName = ruta.split('/').pop(); // Obtener el nombre del archivo desde la ruta
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

            res.send(buffer); // Enviar el archivo al cliente
        } catch (error) {
            console.error('Error al descargar el archivo:', error);
            res.status(500).send('No se pudo descargar el archivo.');
        }
    }

    @UseGuards(AuthGuard)
    @Delete('eliminar-practica/:id_practica')
    async eliminarPractica(@Req() res: any, @Param('id_practica', ParseIntPipe) id_practica: number){
        try {
            const { rol } = res.user;
            if(rol === 'ADMINISTRADOR' || rol || 'SECRETARIA_CARRERA'){
                return await this._practicaService.eliminarPractica(id_practica);
            }
            throw new UnauthorizedException('No está autorizado a realizar esta operación');
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException('Error interno al eliminar una práctica');
        }
    }


}