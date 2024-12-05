import { Body, Controller, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { PracticasService } from "./practicas.service";
import { createPracticaDto } from "./dto/create-practicas.dto";

@Controller('practicas')
export class PracticasController {
    constructor(
        private readonly _practicaService: PracticasService,
    ){}

    @Post()
    public generarPractica(@Body() practica: createPracticaDto){
        return this._practicaService.generarPractica(practica);
    }

    @Get(':id')
    public async getPractica(@Param('id', ParseIntPipe) id_practica: number){
        return await this._practicaService.getPractica(id_practica);
    }

}