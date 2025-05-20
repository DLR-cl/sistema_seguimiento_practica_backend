import { Test, TestingModule } from '@nestjs/testing';
import { ResultadoAcademicoService } from './resultado-academico.service';

describe('ResultadoAcademicoService', () => {
  let service: ResultadoAcademicoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResultadoAcademicoService],
    }).compile();

    service = module.get<ResultadoAcademicoService>(ResultadoAcademicoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
