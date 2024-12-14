import { Module } from '@nestjs/common';
import { AlumnosNominaService } from './alumnos-nomina.service';
import { AlumnosNominaController } from './alumnos-nomina.controller';

@Module({
  providers: [AlumnosNominaService],
  controllers: [AlumnosNominaController]
})
export class AlumnosNominaModule {}
