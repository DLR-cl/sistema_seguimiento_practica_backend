import { Module } from '@nestjs/common';
import { EvaluacionAcademicaController } from './evaluacion-academica.controller';
import { EvaluacionAcademicaService } from './evaluacion-academica.service';
import { DatabaseModule } from 'src/database/database/database.module';

@Module({
  controllers: [EvaluacionAcademicaController],
  providers: [EvaluacionAcademicaService],
  exports: [EvaluacionAcademicaService],
  imports: [DatabaseModule]
})
export class EvaluacionAcademicaModule {}
