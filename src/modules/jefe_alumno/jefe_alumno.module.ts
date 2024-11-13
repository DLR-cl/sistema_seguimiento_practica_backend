import { Module } from '@nestjs/common';
import { JefeAlumnoController } from './jefe_alumno.controller';
import { JefeAlumnoService } from './jefe_alumno.service';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from '../users/users.service';
import { DatabaseService } from 'src/database/database/database.service';
;

@Module({
    controllers: [JefeAlumnoController],
    providers: [JefeAlumnoService, AuthService, DatabaseService, UsersService],
})
export class JefeAlumnoModule {}
