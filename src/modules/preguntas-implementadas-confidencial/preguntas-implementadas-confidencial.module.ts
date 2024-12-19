import { Module } from '@nestjs/common';
import { PreguntasImplementadasConfidencialController } from './preguntas-implementadas-confidencial.controller';
import { PreguntasImplementadasConfidencialService } from './preguntas-implementadas-confidencial.service';
import { DatabaseModule } from 'src/database/database/database.module';

@Module({
  controllers: [PreguntasImplementadasConfidencialController],
  providers: [PreguntasImplementadasConfidencialService],
  imports: [DatabaseModule]
})
export class PreguntasImplementadasConfidencialModule {}
