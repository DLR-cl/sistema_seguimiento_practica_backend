import { Controller, Post } from '@nestjs/common';
import { CreateAcademicoDto } from './dto/create-academicos.dto';
import { AcademicosService } from './academicos.service';

@Controller('academicos')
export class AcademicosController {

    constructor(
        private readonly _academicoService: AcademicosService,
    ){}

    @Post('registrar')
    public registrarAcademico(academico: CreateAcademicoDto){
        return this._academicoService.crearAcademico(academico);
    }
}
