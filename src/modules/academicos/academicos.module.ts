import { Module } from '@nestjs/common';
import { AcademicosController } from './academicos.controller';
import { AcademicosService } from './academicos.service';
import { DatabaseService } from 'src/database/database/database.service';
import { DatabaseModule } from 'src/database/database/database.module';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { EmailAvisosModule } from '../email-avisos/email-avisos.module';
import { EvaluacionAcademicaModule } from './evaluacion-academica/evaluacion-academica.module';

@Module({
  controllers: [AcademicosController],
  providers: [AcademicosService],
  imports: [DatabaseModule, UsersModule, EmailAvisosModule, EvaluacionAcademicaModule]
})
export class AcademicosModule {}
