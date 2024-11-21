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
import { PreguntasImplementadasConfidencialController } from './modules/preguntas-implementadas-confidencial/preguntas-implementadas-confidencial.controller';
import { PreguntasImplementadasConfidencialModule } from './modules/preguntas-implementadas-confidencial/preguntas-implementadas-confidencial.module';
import { PreguntasImplementadasInformeAlumnoModule } from './modules/preguntas-implementadas-informe-alumno/preguntas-implementadas-informe-alumno.module';


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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
