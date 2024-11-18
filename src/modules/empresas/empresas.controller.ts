import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { EmpresasService } from "./empresas.service";
import { Empresas, Tipo_usuario } from "@prisma/client";
import { createEmpresasDto } from "./dto/create-empresas.dto";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { Roles } from "src/auth/decorators/roles.decorator";

@Controller('empresas')
export class EmpresasController {
    
    constructor(
        private readonly _empresasService: EmpresasService,
    ){}
    
    @Post('registrar-empresa')
    public registrar(@Body() empresa: createEmpresasDto){
        return this._empresasService.crearEmpresas(empresa);
    }
    
    @Roles(Tipo_usuario.JEFE_DEPARTAMENTO)
    @Get()
    public getEmpresas(){
        return this._empresasService.getEmpresas();
    }
}