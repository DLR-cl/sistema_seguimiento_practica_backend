import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DatabaseModule } from 'src/database/database/database.module';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  imports: [DatabaseModule]
})
export class DashboardModule {}
