import { Test, TestingModule } from '@nestjs/testing';
import { PreguntasImplementadasConfidencialService } from './preguntas-implementadas-confidencial.service';

describe('PreguntasImplementadasConfidencialService', () => {
  let service: PreguntasImplementadasConfidencialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PreguntasImplementadasConfidencialService],
    }).compile();

    service = module.get<PreguntasImplementadasConfidencialService>(PreguntasImplementadasConfidencialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
