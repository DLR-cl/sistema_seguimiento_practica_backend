import { Module } from '@nestjs/common';
import { EvaluacionAcademicaController } from './evaluacion-academica.controller';
import { EvaluacionAcademicaService } from './evaluacion-academica.service';
import { DatabaseModule } from '../../../database/database/database.module';
import { ReportesExcelService } from './services/reportes-excel.service';
import { DashboardModule } from '../../dashboard/dashboard.module';
import { AnaliticaService } from 'modules/dashboard/services/analitica.service';
import { EstadisticaService } from '../services/estadistica.service';
import { DataGeneracionInformeService } from './services/data-generacion-informe-pdf/data-generacion-informe.service';
import { GenerarPdfInformeService } from './services/generar-pdf-informe/generar-pdf-informe.service';
@Module({
  controllers: [EvaluacionAcademicaController],
  providers: [EvaluacionAcademicaService, ReportesExcelService, EstadisticaService, DataGeneracionInformeService, GenerarPdfInformeService],
  exports: [EvaluacionAcademicaService],
  imports: [DatabaseModule, DashboardModule]
})
export class EvaluacionAcademicaModule {}

