import { Controller, Get } from '@nestjs/common';
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
}
