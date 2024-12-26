import { Module } from '@nestjs/common';
import { RespuestaInformeConfidencialController } from './respuesta-informe-confidencial.controller';
import { RespuestaInformeConfidencialService } from './respuesta-informe-confidencial.service';
import { DatabaseModule } from '../../database/database/database.module';

@Module({
  controllers: [RespuestaInformeConfidencialController],
  providers: [RespuestaInformeConfidencialService],
  exports: [RespuestaInformeConfidencialService],
  imports: [DatabaseModule]
})
export class RespuestaInformeConfidencialModule {}
