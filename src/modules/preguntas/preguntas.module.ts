import { Module } from '@nestjs/common';
import { PreguntasService } from './preguntas.service';
import { PreguntasController } from './preguntas.controller';
import { DatabaseModule } from 'src/database/database/database.module';

@Module({
  providers: [PreguntasService],
  controllers: [PreguntasController],
  exports: [PreguntasService],
  imports: [DatabaseModule]
})
export class PreguntasModule {}
