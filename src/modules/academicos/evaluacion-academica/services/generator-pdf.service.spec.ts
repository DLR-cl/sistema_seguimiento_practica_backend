import { Test, TestingModule } from '@nestjs/testing';
import { GeneratorPdfService } from './generator-pdf.service';

describe('GeneratorPdfService', () => {
  let service: GeneratorPdfService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeneratorPdfService],
    }).compile();

    service = module.get<GeneratorPdfService>(GeneratorPdfService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
