import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CrearDimensionDto, CrearSubDimensionDto } from './dto/crear-dimension.dto';
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

    @Get()
    public async obtenerDimensiones(){
        return await this._dimensionesService.obtenerDimensiones()
    }

    @Post('subdimensiones')
    public async crearSubDimension(@Body() subDimension: CrearSubDimensionDto){
        return await this._dimensionesService.crearSubDimension(subDimension);
    }

    @Post('subdimensiones/varios')
    public async crearSubDimensiones(@Body() subDimensiones: CrearSubDimensionDto[]){
        return await this._dimensionesService.crearVariasSubDimensiones(subDimensiones)
    }

    @Get('subdimensiones')
    public async obtenerSubdimensiones() {
        return await this._dimensionesService.obtenerSubdimensiones();
    }

    @Get('subdimensiones/:id')
    public async obtenerSubdimension(@Param('id') id_sub: string){
        return await this._dimensionesService.obtenerSubdimension(+id_sub);
    }
}
