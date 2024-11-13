import { Module } from '@nestjs/common';
import { AlumnoPracticaController } from './alumno_practica.controller';
import { AlumnoPracticaService } from './alumno_practica.service';
import { UsersService } from '../users/users.service';
import { AuthService } from 'src/auth/auth.service';
import { DatabaseService } from 'src/database/database/database.service';

@Module({
  controllers: [AlumnoPracticaController],
  providers: [AlumnoPracticaService, AuthService, DatabaseService, UsersService]
})
export class AlumnoPracticaModule {}
