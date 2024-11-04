import { Module } from '@nestjs/common';
import { JefeAlumnoController } from './jefe_alumno.controller';
import { JefeAlumnoService } from './jefe_alumno.service';
import { AuthService } from '../../auth/auth.service';
import { DatabaseService } from '../../database/database/database.service';
import { UsersService } from '../users.service';

@Module({
    controllers: [JefeAlumnoController],
    providers: [JefeAlumnoService, AuthService, DatabaseService, UsersService],
})
export class JefeAlumnoModule {}
