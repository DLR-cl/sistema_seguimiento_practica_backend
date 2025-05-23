import { Module } from '@nestjs/common';
import { InformeAlumnoService } from './informe_alumno.service';
import { InformeAlumnoController } from './informe_alumno.controller';
import { DatabaseModule } from '../../database/database/database.module';
import { AlumnoPracticaModule } from '../alumno_practica/alumno_practica.module';
import { PracticasModule } from '../practicas/practicas.module';
import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { EmailAvisosService } from '../email-avisos/email-avisos.service';
import { EmailAvisosModule } from '../email-avisos/email-avisos.module';
import { InformeManagementService } from './services/informe-management.service';
import { InformeRevisionService } from './services/informe-revision.service';
import { InformeStorageService } from './services/informe-storage.service';
import { ValidacionInformeAlumnoService } from './services/validacion-informe-alumno/validacion-informe-alumno.service';
import { AlmacenamientoInformeService } from './services/almacenamiento-informe/almacenamiento-informe.service';
@Module({   
  providers: [InformeAlumnoService, InformeManagementService, InformeRevisionService, InformeStorageService, ValidacionInformeAlumnoService, AlmacenamientoInformeService],
  controllers: [InformeAlumnoController],
  exports: [InformeAlumnoService],
  imports: [DatabaseModule, AlumnoPracticaModule, PracticasModule, AuthModule, UsersModule, EmailAvisosModule]
})
export class InformeAlumnoModule {}
