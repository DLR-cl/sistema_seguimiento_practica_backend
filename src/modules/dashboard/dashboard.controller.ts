import { BadRequestException, Body, Controller, Get, InternalServerErrorException, Param, ParseIntPipe, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { UserFromToken } from '../../auth/decorators/userToken.decorator';
import { CantidadPracticaPorMesesDto } from './dto/cantidad-practica-meses.dto';
import { AnaliticaService } from './services/analitica.service';
import { TipoPractica } from '@prisma/client';
import { DashboardEstadisticasPracticaService } from './services/dashboard-estadisticas-practica/dashboard-estadisticas-practica.service';
import type { EstadisticaAprobacionPorPractica } from './interface/dashboard-estadistica.interface';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly _dashboardService: DashboardService,
    private readonly _analiticaService: AnaliticaService,
    private readonly _dashboardEstadisticaService: DashboardEstadisticasPracticaService,
  ) { }

  @Get()
  public async obtenerCantidadEstudiantesEnPractica() {
    return await this._dashboardService.obtenerCantidadEstudiantesEnPractica();
  }

  @Get('informe-confidencial/resultados-historicos/:id')
  public async obtenerRespuestasHistoricoInformeConfidencialByDimension(@Param('id', ParseIntPipe) id_dimension: number) {
    try {
      return await this.obtenerRespuestasHistoricoInformeConfidencialByDimension(id_dimension);
    } catch (error) {
      throw new InternalServerErrorException('Error interno al obtener los resultados historicos');
    }
  }


  @Get('informe-alumno/respuestas-historicas')
  public async obtenerRespuestasHistoricasInformeEvaluacion() {
    return await this._analiticaService.obtenerTotalHistoricoRespuestasInformeEvaluacion();
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

  @Get('empresa/estadisticas/tipo-empresas')
  public async obtenerCantidadPorTipoEmpresa() {
    try {
      return await this._analiticaService.obtenerCantidadTipoEmpresa();
    } catch (error) {
      throw new InternalServerErrorException('Error interno al obtener la cantida de empresas por tipo')
    }
  }

  @Get('estadistica-practicas-dashboard-jefe-carrera')
  public async obtenerEstadisticas() {
    return await this._dashboardService.estadisticaPractica();
  }

  @Get('aprobacion-practicas')
  public async obtenerAprobacionPracticas() {
    return await this._dashboardService.obtenerAprobacionPracticas();
  }

  @Get('alumnos-activos-practica')
  public async obtenerCantidadAlumnosPorPracticaCursando() {
    return await this._dashboardService.obtenerTotalPracticaAlumnos();
  }

  @Get('obtener-detalles-practica')
  public async obtenerDetallesPracticaTodo() {
    return await this._dashboardService.obtenerDetallesPracticaTodos();
  }


  @Get('obtener-practicas-meses/:year')
  public async obtenerPracticasPorMes(@Param('year', ParseIntPipe) year: number) {
    return await this._dashboardService.obtenerCantidadPracticasPorTipoPorMesSegunAnno(year);
  }

  @Get('obtener-promedio-nota-empresa')
  public async obtenerPromedioNotas() {
    return await this._dashboardService.obtenerNotaPromedioDeInformesEmpresas();
  }

  @Get('obtener-seguimiento-academicos')
  public async obtenerSeguimientoAcademicos() {
    return await this._dashboardService.obtenerSeguimientoAcademicos();
  }

  @Get('academico/informes/conteo/:id_academico')
  public async obtenerResumenInformes(@Param('id_academico', ParseIntPipe) id_academico: number) {
    return await this._dashboardService.obtenerResumenInformes(id_academico);
  }

  @Get('empleador/informes/obtener-respuestas')
  async obtenerRespuestasConfidenciales(
    @Query('fecha_ini') fechaInicio: string,
    @Query('fecha_fin') fechaFin: string,
    @Query('tipo_practica') tipoPractica: string,
  ) {
    try {
      // Validar parámetros obligatorios
      if (!fechaInicio || !fechaFin || !tipoPractica) {
        throw new BadRequestException('Los parámetros fecha_ini, fecha_fin y tipo_practica son obligatorios.');
      }

      // Convertir parámetros a tipos adecuados
      const fechaIni = new Date(fechaInicio);
      const fechaFinDate = new Date(fechaFin);

      // Validar fechas
      if (isNaN(fechaIni.getTime()) || isNaN(fechaFinDate.getTime())) {
        throw new BadRequestException('Los parámetros fecha_ini y fecha_fin deben ser fechas válidas.');
      }

      // Validar tipo de práctica
      if (!['PRACTICA_UNO', 'PRACTICA_DOS'].includes(tipoPractica)) {
        throw new BadRequestException('El parámetro tipo_practica debe ser PRACTICA_UNO o PRACTICA_DOS.');
      }

      // Llamar al servicio para obtener los datos
      const respuestas = await this._analiticaService.obtenerRespuestasConfidencialesPorPeriodoYPractica(
        fechaIni,
        fechaFinDate,
        tipoPractica as TipoPractica,
      );

      // Retornar los datos al cliente
      return {
        success: true,
        message: 'Datos obtenidos correctamente.',
        data: respuestas,
      };
    } catch (error) {
      console.error('Error al obtener las respuestas confidenciales:', error);
      throw new BadRequestException('No se pudo obtener las respuestas confidenciales.');
    }
  }

  @Get('estadisticas/practicas')
  async obtenerEstadisticasAprobacion(): Promise<EstadisticaAprobacionPorPractica> {
    return this._dashboardEstadisticaService.obtenerEstadisticasAprobacionPorPractica()
  }

}
