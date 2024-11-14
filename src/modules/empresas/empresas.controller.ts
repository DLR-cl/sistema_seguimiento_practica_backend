import { Body, Controller, Get, Post } from "@nestjs/common";
import { EmpresasService } from "./empresas.service";
import { Empresas } from "@prisma/client";
import { createEmpresasDto } from "./dto/create-empresas.dto";

@Controller('empresas')
export class EmpresasController {
    
    constructor(
        private readonly _empresasService: EmpresasService,
    ){}

    @Post('registrar-empresa')
    public registrar(@Body() empresa: createEmpresasDto){
        return this._empresasService.crearEmpresas(empresa);
    }

    @Get()
    public getEmpresas(){
        return this._empresasService.getEmpresas();
    }
}