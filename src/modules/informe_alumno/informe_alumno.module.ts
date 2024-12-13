import { Module } from '@nestjs/common';
import { InformeAlumnoService } from './informe_alumno.service';
import { InformeAlumnoController } from './informe_alumno.controller';
import { DatabaseModule } from 'src/database/database/database.module';
import { AlumnoPracticaModule } from '../alumno_practica/alumno_practica.module';
import { PracticasModule } from '../practicas/practicas.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from '../users/users.module';
import { EmailAvisosService } from '../email-avisos/email-avisos.service';
import { EmailAvisosModule } from '../email-avisos/email-avisos.module';

@Module({
  providers: [InformeAlumnoService,Object],
  controllers: [InformeAlumnoController],
  exports: [InformeAlumnoService],
  imports: [DatabaseModule, AlumnoPracticaModule, PracticasModule, AuthModule, UsersModule, EmailAvisosModule]
})
export class InformeAlumnoModule {}
