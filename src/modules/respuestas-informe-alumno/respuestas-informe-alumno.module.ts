import { Module } from '@nestjs/common';
import { RespuestasInformeAlumnoService } from './respuestas-informe-alumno.service';
import { RespuestasInformeAlumnoController } from './respuestas-informe-alumno.controller';
import { InformeAlumnoModule } from '../informe_alumno/informe_alumno.module';
import { PreguntasImplementadasInformeAlumnoModule } from '../preguntas-implementadas-informe-alumno/preguntas-implementadas-informe-alumno.module';
import { DatabaseModule } from 'src/database/database/database.module';

@Module({
  providers: [RespuestasInformeAlumnoService],
  controllers: [RespuestasInformeAlumnoController],
  imports: [InformeAlumnoModule, PreguntasImplementadasInformeAlumnoModule, DatabaseModule],
  exports: [RespuestasInformeAlumnoService]
})
export class RespuestasInformeAlumnoModule {}
