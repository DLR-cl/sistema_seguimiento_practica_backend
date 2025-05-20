import { Test, TestingModule } from '@nestjs/testing';
import { GenerarPdfInformeService } from './generar-pdf-informe.service';

describe('GenerarPdfInformeService', () => {
  let service: GenerarPdfInformeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GenerarPdfInformeService],
    }).compile();

    service = module.get<GenerarPdfInformeService>(GenerarPdfInformeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
