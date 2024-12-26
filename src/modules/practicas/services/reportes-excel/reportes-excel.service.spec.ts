import { Test, TestingModule } from '@nestjs/testing';
import { ReportesExcelService } from './reportes-excel.service';

describe('ReportesExcelService', () => {
  let service: ReportesExcelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportesExcelService],
    }).compile();

    service = module.get<ReportesExcelService>(ReportesExcelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
