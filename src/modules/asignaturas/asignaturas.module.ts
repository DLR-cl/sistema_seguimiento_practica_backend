import { Module } from '@nestjs/common';
import { AsignaturasService } from './asignaturas.service';
import { AsignaturasController } from './asignaturas.controller';

@Module({
  providers: [AsignaturasService],
  controllers: [AsignaturasController]
})
export class AsignaturasModule {}
