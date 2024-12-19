import { Module } from '@nestjs/common';
import { PreguntasService } from './preguntas.service';
import { PreguntasController } from './preguntas.controller';
import { DatabaseModule } from '../../database/database/database.module';
import { DimensionesEvaluativasModule } from '../dimensiones-evaluativas/dimensiones-evaluativas.module';

@Module({
  providers: [PreguntasService],
  controllers: [PreguntasController],
  exports: [PreguntasService],
  imports: [DatabaseModule, DimensionesEvaluativasModule]
})
export class PreguntasModule {}
