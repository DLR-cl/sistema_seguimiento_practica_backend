import { Test, TestingModule } from '@nestjs/testing';
import { DimensionesEvaluativasService } from './dimensiones-evaluativas.service';

describe('DimensionesEvaluativasService', () => {
  let service: DimensionesEvaluativasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DimensionesEvaluativasService],
    }).compile();

    service = module.get<DimensionesEvaluativasService>(DimensionesEvaluativasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
