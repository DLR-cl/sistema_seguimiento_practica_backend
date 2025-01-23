import { Test, TestingModule } from '@nestjs/testing';
import { AcademicosReporteService } from './academicos-reporte.service';

describe('AcademicosReporteService', () => {
  let service: AcademicosReporteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AcademicosReporteService],
    }).compile();

    service = module.get<AcademicosReporteService>(AcademicosReporteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
