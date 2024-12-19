import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CrearDimensionDto } from './dto/crear-dimension.dto';
import { DimensionesEvaluativasService } from './dimensiones-evaluativas.service';
import { get } from 'http';

@Controller('dimensiones-evaluativas')
export class DimensionesEvaluativasController {

    constructor(
        private readonly _dimensionesService: DimensionesEvaluativasService,
    ){}
    @Post()
    public async crearDimension(@Body() dimension: CrearDimensionDto){
        return await this._dimensionesService.crearDimension(dimension);
    }

    @Post('crear-varios')
    public async crearDimensiones(@Body() dimensiones: CrearDimensionDto[]){
        return await this._dimensionesService.crearDimensiones(dimensiones);
    }
    @Get()
    public async obtenerDimensiones(){
        return await this._dimensionesService.obtenerDimensiones()
    }


 
}
