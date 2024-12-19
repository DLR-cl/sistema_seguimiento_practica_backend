import { Module } from '@nestjs/common';
import { JefeAlumnoController } from './jefe_alumno.controller';
import { JefeAlumnoService } from './jefe_alumno.service';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from '../users/users.service';
import { DatabaseService } from 'src/database/database/database.service';
import { DatabaseModule } from 'src/database/database/database.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from '../users/users.module';
;

@Module({
    controllers: [JefeAlumnoController],
    providers: [JefeAlumnoService],
    imports: [DatabaseModule, AuthModule, UsersModule],
    exports: [JefeAlumnoService]
})
export class JefeAlumnoModule {}
