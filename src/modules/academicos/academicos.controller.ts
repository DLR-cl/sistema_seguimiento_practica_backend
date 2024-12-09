import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateAcademicoDto } from './dto/create-academicos.dto';
import { AcademicosService } from './academicos.service';

@Controller('academicos')
export class AcademicosController {

    constructor(
        private readonly _academicoService: AcademicosService,
    ){}

    @Post('registrar')
    public registrarAcademico(@Body() academico: CreateAcademicoDto){
        return this._academicoService.crearAcademico(academico);
    }

    @Get('cantidad-informes')
    public async obtenerCantidadInformes(){
        return await this._academicoService.cantidadInformesPorAcademico()
    }
    
    @Get(':id')
    public async obtenerAcademico(@Param('id') id_academico: string){
        return await this._academicoService.obtenerAcademico(+id_academico);
    }
}
