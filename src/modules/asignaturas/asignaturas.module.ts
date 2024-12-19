import { Module } from '@nestjs/common';
import { AsignaturasService } from './asignaturas.service';
import { AsignaturasController } from './asignaturas.controller';
import { DatabaseModule } from '../../database/database/database.module';

@Module({
  providers: [AsignaturasService],
  controllers: [AsignaturasController],
  imports: [DatabaseModule]
})
export class AsignaturasModule {}
