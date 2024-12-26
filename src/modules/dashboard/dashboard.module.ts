import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DatabaseModule } from 'src/database/database/database.module';
import { AnaliticaService } from './services/analitica.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, AnaliticaService],
  imports: [DatabaseModule]
})
export class DashboardModule {}
