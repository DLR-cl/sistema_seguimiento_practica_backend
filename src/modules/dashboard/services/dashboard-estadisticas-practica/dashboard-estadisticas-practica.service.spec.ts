import { Test, TestingModule } from '@nestjs/testing';
import { DashboardEstadisticasPracticaService } from './dashboard-estadisticas-practica.service';
import { beforeEach, describe, it } from 'node:test';

describe('DashboardEstadisticasPracticaService', () => {
  let service: DashboardEstadisticasPracticaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardEstadisticasPracticaService],
    }).compile();

    service = module.get<DashboardEstadisticasPracticaService>(DashboardEstadisticasPracticaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
