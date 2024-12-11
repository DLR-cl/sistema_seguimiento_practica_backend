import { Controller, Get, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {

    constructor( 
        private readonly _dashboardService: DashboardService,
    ){}

    @Get()
    public async obtenerCantidadEstudiantesEnPractica(){
        return await this._dashboardService.obtenerCantidadEstudiantesEnPractica();
    }

    @Get('info-informes/:id')
    public async obtenerInfoInformesAcademicos(@Param('id') id_academico: string){
        return await this._dashboardService.obtenerInformacionInformes(+id_academico);
    }

    @Get('pendientes-informes/:id')
    public async obtenerInformesPendientesAcademico(@Param('id') id_academico: string){
        return await this._dashboardService.cantidadInformesPendientes(+id_academico);
    }
    @Get('informes-criticos/:id')
    public async obtenerInformesCriticos(@Param('id') id_academico: string){
        return await this._dashboardService.obtenerEntregaCritica(+id_academico);
    }
}
