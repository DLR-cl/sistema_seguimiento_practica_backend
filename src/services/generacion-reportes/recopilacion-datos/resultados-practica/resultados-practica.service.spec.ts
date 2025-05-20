import { Test, TestingModule } from '@nestjs/testing';
import { ResultadosPracticaService } from './resultados-practica.service';

describe('ResultadosPracticaService', () => {
  let service: ResultadosPracticaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResultadosPracticaService],
    }).compile();

    service = module.get<ResultadosPracticaService>(ResultadosPracticaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
