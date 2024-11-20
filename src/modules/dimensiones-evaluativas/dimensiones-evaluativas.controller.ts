import { Body, Controller, Post } from '@nestjs/common';
import { CrearDimensionDto } from './dto/crear-dimension.dto';
import { DimensionesEvaluativasService } from './dimensiones-evaluativas.service';

@Controller('dimensiones-evaluativas')
export class DimensionesEvaluativasController {

    constructor(
        private readonly _dimensionesService: DimensionesEvaluativasService,
    ){}
    @Post('crear')
    public async crearDimension(@Body() dimension: CrearDimensionDto){
        return await this._dimensionesService.crearDimension(dimension);
    }
}
