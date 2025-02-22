import { Module } from '@nestjs/common';
import { AlumnoPracticaController } from './alumno_practica.controller';
import { AlumnoPracticaService } from './alumno_practica.service';
import { UsersService } from '../users/users.service';
import { AuthService } from '../../auth/auth.service';
import { DatabaseService } from '../../database/database/database.service';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database/database.module';
import { UsersModule } from '../users/users.module';
import { EmailAvisosModule } from '../email-avisos/email-avisos.module';

@Module({
  controllers: [AlumnoPracticaController],
  providers: [AlumnoPracticaService],
  exports: [AlumnoPracticaService],
  imports: [AuthModule, DatabaseModule, UsersModule, EmailAvisosModule]
})
export class AlumnoPracticaModule {}
