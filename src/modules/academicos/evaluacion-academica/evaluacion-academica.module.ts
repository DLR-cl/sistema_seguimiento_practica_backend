import { Module } from '@nestjs/common';
import { EvaluacionAcademicaController } from './evaluacion-academica.controller';
import { EvaluacionAcademicaService } from './evaluacion-academica.service';
import { DatabaseModule } from '../../../database/database/database.module';
import { GeneratorPdfService } from './services/generator-pdf.service';
import { ReportesExcelService } from './services/reportes-excel.service';
import { DashboardModule } from '../../dashboard/dashboard.module';

@Module({
  controllers: [EvaluacionAcademicaController],
  providers: [EvaluacionAcademicaService, GeneratorPdfService, ReportesExcelService],
  exports: [EvaluacionAcademicaService],
  imports: [DatabaseModule, DashboardModule]
})
export class EvaluacionAcademicaModule {}
