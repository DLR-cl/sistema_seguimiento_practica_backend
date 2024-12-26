import { Module } from '@nestjs/common';
import { EvaluacionAcademicaController } from './evaluacion-academica.controller';
import { EvaluacionAcademicaService } from './evaluacion-academica.service';
import { DatabaseModule } from '../../../database/database/database.module';
import { GeneratorPdfService } from './services/generator-pdf.service';

@Module({
  controllers: [EvaluacionAcademicaController],
  providers: [EvaluacionAcademicaService, GeneratorPdfService],
  exports: [EvaluacionAcademicaService],
  imports: [DatabaseModule]
})
export class EvaluacionAcademicaModule {}
