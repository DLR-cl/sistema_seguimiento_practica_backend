import { Test, TestingModule } from '@nestjs/testing';
import { EvaluacionAcademicaService } from './evaluacion-academica.service';

describe('EvaluacionAcademicaService', () => {
  let service: EvaluacionAcademicaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvaluacionAcademicaService],
    }).compile();

    service = module.get<EvaluacionAcademicaService>(EvaluacionAcademicaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
