import { Module } from '@nestjs/common';
import { AsignaturasRespuestaAlumnoController } from './asignaturas-respuesta-alumno.controller';
import { AsignaturasRespuestaAlumnoService } from './asignaturas-respuesta-alumno.service';
import { InformeAlumnoModule } from '../informe_alumno/informe_alumno.module';
import { RespuestasInformeAlumnoModule } from '../respuestas-informe-alumno/respuestas-informe-alumno.module';
import { DatabaseModule } from 'src/database/database/database.module';


@Module({
  controllers: [AsignaturasRespuestaAlumnoController],
  providers: [AsignaturasRespuestaAlumnoService],
  imports: [InformeAlumnoModule, RespuestasInformeAlumnoModule, DatabaseModule]
})
export class AsignaturasRespuestaAlumnoModule {}
