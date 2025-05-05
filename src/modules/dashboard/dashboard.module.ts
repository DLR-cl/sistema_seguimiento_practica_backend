import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DatabaseModule } from '../../database/database/database.module';
import { AnaliticaService } from './services/analitica.service';
import { DashboardEstadisticasPracticaService } from './services/dashboard-estadisticas-practica/dashboard-estadisticas-practica.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, AnaliticaService, DashboardEstadisticasPracticaService],
  imports: [DatabaseModule],
  exports: [AnaliticaService]
})
export class DashboardModule {}
