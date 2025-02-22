import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { EmpresasService } from "./empresas.service";
import { Empresas, Tipo_usuario } from "@prisma/client";
import { createEmpresasDto } from "./dto/create-empresas.dto";


@Controller('empresas')
export class EmpresasController {
    
    constructor(
        private readonly _empresasService: EmpresasService,
    ){}
    
    @Post()
    public registrar(@Body() empresa: createEmpresasDto){
        return this._empresasService.crearEmpresas(empresa);
    }
    
    @Get()
    public getEmpresas(){
        return this._empresasService.getEmpresas();
    }
}