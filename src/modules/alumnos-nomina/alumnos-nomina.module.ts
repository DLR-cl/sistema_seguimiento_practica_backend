import { Module } from '@nestjs/common';
import { AlumnosNominaService } from './alumnos-nomina.service';
import { AlumnosNominaController } from './alumnos-nomina.controller';
import { DatabaseService } from 'src/database/database/database.service';
import { DatabaseModule } from 'src/database/database/database.module';

@Module({
  providers: [AlumnosNominaService],
  controllers: [AlumnosNominaController],
  imports: [DatabaseModule]
})
export class AlumnosNominaModule {}
