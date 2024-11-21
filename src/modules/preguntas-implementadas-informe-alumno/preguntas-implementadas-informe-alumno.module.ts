import { Module } from '@nestjs/common';
import { PreguntasImplementadasInformeAlumnoService } from './preguntas-implementadas-informe-alumno.service';
import { PreguntasImplementadasInformeAlumnoController } from './preguntas-implementadas-informe-alumno.controller';
import { DatabaseModule } from 'src/database/database/database.module';

@Module({
  providers: [PreguntasImplementadasInformeAlumnoService],
  controllers: [PreguntasImplementadasInformeAlumnoController],
  exports: [PreguntasImplementadasInformeAlumnoService],
  imports: [DatabaseModule]
})
export class PreguntasImplementadasInformeAlumnoModule {}
