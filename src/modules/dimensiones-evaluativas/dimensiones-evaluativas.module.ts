import { Module } from '@nestjs/common';
import { DimensionesEvaluativasService } from './dimensiones-evaluativas.service';
import { DatabaseModule } from 'src/database/database/database.module';
import { DimensionesEvaluativasController } from './dimensiones-evaluativas.controller';
import { RespuestasInformeAlumnoModule } from '../respuestas-informe-alumno/respuestas-informe-alumno.module';

@Module({
  providers: [DimensionesEvaluativasService],
  imports: [DatabaseModule],
  controllers: [DimensionesEvaluativasController, RespuestasInformeAlumnoModule]
})
export class DimensionesEvaluativasModule {}
