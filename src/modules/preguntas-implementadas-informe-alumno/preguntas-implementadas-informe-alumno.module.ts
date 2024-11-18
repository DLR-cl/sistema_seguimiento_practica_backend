import { Module } from '@nestjs/common';
import { PreguntasImplementadasInformeAlumnoService } from './preguntas-implementadas-informe-alumno.service';
import { PreguntasImplementadasInformeAlumnoController } from './preguntas-implementadas-informe-alumno.controller';

@Module({
  providers: [PreguntasImplementadasInformeAlumnoService],
  controllers: [PreguntasImplementadasInformeAlumnoController],
  exports: [PreguntasImplementadasInformeAlumnoService]
})
export class PreguntasImplementadasInformeAlumnoModule {}
