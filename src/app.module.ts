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
import { MailerModule } from '@nestjs-modules/mailer';


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
    }),
    InformeAlumnoModule,
    InformeConfidencialModule,
    PreguntasModule,
    ScheduleModule.forRoot(),
    PreguntasImplementadasConfidencialModule,
    PreguntasImplementadasInformeAlumnoModule,
    DimensionesEvaluativasModule,
    MailModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        }
      }
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
