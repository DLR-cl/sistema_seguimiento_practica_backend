import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './database/database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EmpresasModule } from './modules/empresas/empresas.module';
import { PracticasModule } from './modules/practicas/practicas.module';
import { JefeAlumnoModule } from './modules/jefe_alumno/jefe_alumno.module';
import { AlumnoPracticaDto } from './modules/alumno_practica/dto/alumno-practica.dto';
import { InformeAlumnoModule } from './modules/informe_alumno/informe_alumno.module';
import { InformeConfidencialModule } from './modules/informe-confidencial/informe-confidencial.module';
import { PreguntasModule } from './modules/preguntas/preguntas.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PreguntasImplementadasConfidencialModule } from './modules/preguntas-implementadas-confidencial/preguntas-implementadas-confidencial.module';
import { PreguntasImplementadasInformeAlumnoModule } from './modules/preguntas-implementadas-informe-alumno/preguntas-implementadas-informe-alumno.module';
import { DimensionesEvaluativasModule } from './modules/dimensiones-evaluativas/dimensiones-evaluativas.module';
import { MailModule } from './mail/mail.module';
import { SwaggerModule } from '@nestjs/swagger';
import { AsignaturasModule } from './modules/asignaturas/asignaturas.module';
import { AcademicosModule } from './modules/academicos/academicos.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { EmailAvisosModule } from './modules/email-avisos/email-avisos.module';
import { RespuestaInformeConfidencialController } from './modules/respuesta-informe-confidencial/respuesta-informe-confidencial.controller';
import { RespuestaInformeConfidencialModule } from './modules/respuesta-informe-confidencial/respuesta-informe-confidencial.module';
import { AlumnosNominaModule } from './modules/alumnos-nomina/alumnos-nomina.module';
import { ReportesPracticaModule } from './modules/reportes-practica/reportes-practica.module';
import { BullModule } from '@nestjs/bull';
import { bullConfig } from './config/bull.config';

@Module({
  imports: [
    UsersModule, 
    DatabaseModule, 
    AuthModule,
    EmpresasModule,
    PracticasModule,
    JefeAlumnoModule,
    AlumnoPracticaDto,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Usar directamente el archivo único
    }),
    InformeAlumnoModule,
    InformeConfidencialModule,
    PreguntasModule,
    ScheduleModule.forRoot(),
    BullModule.forRoot(bullConfig),
    BullModule.registerQueue({
      name: 'reportes',
    }),
    PreguntasImplementadasConfidencialModule,
    PreguntasImplementadasInformeAlumnoModule,
    DimensionesEvaluativasModule,
    MailModule,
    SwaggerModule,
    AsignaturasModule,
    AcademicosModule,
    DashboardModule,
    EmailAvisosModule,
    RespuestaInformeConfidencialModule,
    AlumnosNominaModule,
    ReportesPracticaModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
