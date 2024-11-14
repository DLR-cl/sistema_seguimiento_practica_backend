import { Module } from '@nestjs/common';
import { InformeAlumnoService } from './informe_alumno.service';
import { InformeAlumnoController } from './informe_alumno.controller';

@Module({
  providers: [InformeAlumnoService],
  controllers: [InformeAlumnoController]
})
export class InformeAlumnoModule {}
