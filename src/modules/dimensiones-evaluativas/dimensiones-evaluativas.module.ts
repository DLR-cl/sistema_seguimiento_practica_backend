import { Module } from '@nestjs/common';
import { DimensionesEvaluativasService } from './dimensiones-evaluativas.service';
import { DatabaseModule } from 'src/database/database/database.module';
import { DimensionesEvaluativasController } from './dimensiones-evaluativas.controller';

@Module({
  providers: [DimensionesEvaluativasService],
  imports: [DatabaseModule],
  controllers: [DimensionesEvaluativasController]
})
export class DimensionesEvaluativasModule {}
