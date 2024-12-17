import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { UserFromToken } from 'src/auth/decorators/userToken.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly _dashboardService: DashboardService) {}

  @Get()
  public async obtenerCantidadEstudiantesEnPractica() {
    return await this._dashboardService.obtenerCantidadEstudiantesEnPractica();
  }

  @Get('info-informes')
  public async obtenerInfoInformesAcademicos(@UserFromToken() user: any) {
    const id_academico = user.id_usuario;
    return await this._dashboardService.obtenerInformacionInformes(id_academico);
  }

  @Get('pendientes-informes')
  public async obtenerInformesPendientesAcademico(@UserFromToken() user: any) {
    const id_academico = user.id_usuario;
    return await this._dashboardService.cantidadInformesPendientes(id_academico);
  }

  @Get('informes-criticos')
  public async obtenerInformesCriticos(@UserFromToken() user: any) {
    const id_academico = user.id_usuario;
    return await this._dashboardService.obtenerEntregaCritica(id_academico);
  }

  @Get('informes-supervisor')
  public async obtenerInformesAsociados(@UserFromToken() user: any) {
    const id_supervisor = user.id_usuario;
    return await this._dashboardService.infoTablaSupervisorPractica(id_supervisor);
  }

  @Get('cantidad-alumnos-asignados')
  public async obtenerCantidadAlumnosAsignadosSupervisor(@UserFromToken() user: any) {
    const id_supervisor = user.id_usuario;
    return await this._dashboardService.obtenerCantidadAlumnosAsignadosSupervisor(id_supervisor);
  }

  @Get('estadistica-practicas-dashboard-jefe-carrera')
  public async obtenerEstadisticas(){
    return await this._dashboardService.estadisticaPractica();
  }

  @Get('aprobacion-practicas')
  public async obtenerAprobacionPracticas(){
    return await this._dashboardService.obtenerAprobacionPracticas();
  }

  @Get('alumnos-activos-practica')
  public async obtenerCantidadAlumnosPorPracticaCursando(){
    return await this._dashboardService.obtenerTotalPracticaAlumnos ();
  }

  @Get('obtener-detalles-practica')
  public async obtenerDetallesPracticaTodo(){
    return await this._dashboardService.obtenerDetallesPracticaTodos();
  }
}
