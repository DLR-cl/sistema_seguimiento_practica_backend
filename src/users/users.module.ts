import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseService } from 'src/database/database/database.service';
import { AlumnoPracticaModule } from './alumno_practica/alumno_practica.module';
import { JefeAlumnoService } from './jefe_alumno/jefe_alumno.service';
import { JefeAlumnoController } from './jefe_alumno/jefe_alumno.controller';
import { JefeAlumnoModule } from './jefe_alumno/jefe_alumno.module';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [UsersController, JefeAlumnoController],
  providers: [UsersService, DatabaseService, JefeAlumnoService, AuthService],
  exports: [UsersService],
  imports: [AlumnoPracticaModule, JefeAlumnoModule]
})
export class UsersModule {}
