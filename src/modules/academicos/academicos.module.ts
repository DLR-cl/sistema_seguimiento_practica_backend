import { Module } from '@nestjs/common';
import { AcademicosController } from './academicos.controller';
import { AcademicosService } from './academicos.service';
import { DatabaseService } from 'src/database/database/database.service';

@Module({
  controllers: [AcademicosController],
  providers: [AcademicosService, DatabaseService]
})
export class AcademicosModule {}
