import { Module } from '@nestjs/common';
import { InformeAlumnoService } from './informe_alumno.service';
import { InformeAlumnoController } from './informe_alumno.controller';
import { DatabaseService } from 'src/database/database/database.service';
import { AlumnoPracticaService } from '../alumno_practica/alumno_practica.service';
import { PracticasService } from '../practicas/practicas.service';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from '../users/users.service';
import { DatabaseModule } from 'src/database/database/database.module';
import { AlumnoPracticaModule } from '../alumno_practica/alumno_practica.module';
import { PracticasModule } from '../practicas/practicas.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  providers: [InformeAlumnoService],
  controllers: [InformeAlumnoController],
  exports: [InformeAlumnoService],
  imports: [DatabaseModule, AlumnoPracticaModule, PracticasModule, AuthModule, UsersModule]
})
export class InformeAlumnoModule {}
