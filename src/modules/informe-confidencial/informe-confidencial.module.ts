import { Module } from '@nestjs/common';
import { InformeConfidencialController } from './informe-confidencial.controller';
import { InformeConfidencialService } from './informe-confidencial.service';
import { DatabaseModule } from 'src/database/database/database.module';

@Module({
  controllers: [InformeConfidencialController],
  providers: [InformeConfidencialService],
  imports: [DatabaseModule],
  exports: [InformeConfidencialService]
})
export class InformeConfidencialModule {}
