import { Test, TestingModule } from '@nestjs/testing';
import { InformeConfidencialService } from './informe-confidencial.service';

describe('InformeConfidencialService', () => {
  let service: InformeConfidencialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InformeConfidencialService],
    }).compile();

    service = module.get<InformeConfidencialService>(InformeConfidencialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
