import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseService } from 'src/database/database/database.service';

import { AuthService } from 'src/auth/auth.service';
import { JefeAlumnoController } from '../jefe_alumno/jefe_alumno.controller';
import { JefeAlumnoService } from '../jefe_alumno/jefe_alumno.service';
import { AlumnoPracticaModule } from '../alumno_practica/alumno_practica.module';
import { JefeAlumnoModule } from '../jefe_alumno/jefe_alumno.module';
import { AuthModule } from 'src/auth/auth.module';
import { DatabaseModule } from 'src/database/database/database.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
  imports: [DatabaseModule]
})
export class UsersModule {}
