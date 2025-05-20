import { Test, TestingModule } from '@nestjs/testing';
import { GeneracionExcelService } from './generacion-excel.service';

describe('GeneracionExcelService', () => {
  let service: GeneracionExcelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeneracionExcelService],
    }).compile();

    service = module.get<GeneracionExcelService>(GeneracionExcelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
