import { BadRequestException, Body, Controller, Get, InternalServerErrorException, Param, ParseIntPipe, Patch, Post, Query } from "@nestjs/common";
import { PracticasService } from "./practicas.service";
import { createPracticaDto } from "./dto/create-practicas.dto";
import { ReportesExcelService } from "./services/reportes-excel/reportes-excel.service";
import { AutoFuncService } from "./services/auto-func/auto-func.service";
import { ExtensionPractica } from "./dto/practica-response.dto";

@Controller('practicas')
export class PracticasController {
    constructor(
        private readonly _practicaService: PracticasService,
        private readonly _reporteService: ReportesExcelService,
        private readonly _autofuncService: AutoFuncService,
    ){}

    @Get('obtener/reporte')
    public async getobtena(){
        //return await this._reporteService.generarReporteSemestral();
    }
    @Post()
    public generarPractica(@Body() practica: createPracticaDto){
        return this._practicaService.generarPractica(practica);
    }

    @Get(':id')
    public async getPractica(@Param('id', ParseIntPipe) id_practica: number){
        return await this._practicaService.getPractica(id_practica);
    }

    @Get()
    public async getAllPracticas(){
        return await this._practicaService.getAllPracticas();
    }

    @Get('alumno/:id')
    public async getPracticaByAlumno(@Param('id') id_alumno: string){
        return await this._practicaService.getPracticaAlumno(+id_alumno);
    }

    @Get('informes/generar')
    public async creacionPracticas(){
        await this._autofuncService.actualizarEstadoPracticas();
        await this._autofuncService.generarInformeConfidencial();
        await this._autofuncService.generarInformeAlumno();
        return {
            message: 'actualizado'
        }
    }

    @Patch('extender')
    public async extenderPractica(@Body() practicaExtender: ExtensionPractica){
        try {
            return this._practicaService.extenderPractica(practicaExtender.id_practica, practicaExtender.fecha_fin_ext)
        } catch (error) {
            if(error instanceof BadRequestException){
                error;
            }
            throw new InternalServerErrorException('Error interno al extender la práctica');
        }
    }
    
}