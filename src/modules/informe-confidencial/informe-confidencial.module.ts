import { Module } from '@nestjs/common';
import { InformeConfidencialController } from './informe-confidencial.controller';
import { InformeConfidencialService } from './informe-confidencial.service';
import { DatabaseModule } from '../../database/database/database.module';
import { AlumnoPracticaModule } from '../alumno_practica/alumno_practica.module';
import { PracticasModule } from '../practicas/practicas.module';

@Module({
  controllers: [InformeConfidencialController],
  providers: [InformeConfidencialService],
  imports: [DatabaseModule, PracticasModule],
  exports: [InformeConfidencialService]
})
export class InformeConfidencialModule {}
