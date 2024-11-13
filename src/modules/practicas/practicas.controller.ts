import { Body, Controller, Post } from "@nestjs/common";
import { PracticasService } from "./practicas.service";
import { createPracticaDto } from "./dto/create-practicas.dto";

@Controller('practicas')
export class PracticasController {
    constructor(
        private readonly _practicaService: PracticasService,
    ){}

    @Post('generar')
    public generarPractica(@Body() practica: createPracticaDto){
        return this._practicaService.generarPractica(practica);
    }
}