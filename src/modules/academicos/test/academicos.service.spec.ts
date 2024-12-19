import { Test, TestingModule } from '@nestjs/testing';
import { AcademicosService } from '../academicos.service';

describe('AcademicosService', () => {
  let service: AcademicosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AcademicosService],
    }).compile();

    service = module.get<AcademicosService>(AcademicosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
