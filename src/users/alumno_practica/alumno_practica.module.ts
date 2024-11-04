import { Module } from '@nestjs/common';
import { AlumnoPracticaController } from './alumno_practica.controller';
import { AlumnoPracticaService } from './alumno_practica.service';
import { AuthService } from '../../auth/auth.service';
import { DatabaseService } from '../../database/database/database.service';
import { UsersService } from '../users.service';

@Module({
  controllers: [AlumnoPracticaController],
  providers: [AlumnoPracticaService, AuthService, DatabaseService, UsersService]
})
export class AlumnoPracticaModule {}
