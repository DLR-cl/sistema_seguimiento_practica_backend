import { Test, TestingModule } from '@nestjs/testing';
import { AutoGeneradoService } from './auto-generado.service';

describe('AutoGeneradoService', () => {
  let service: AutoGeneradoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutoGeneradoService],
    }).compile();

    service = module.get<AutoGeneradoService>(AutoGeneradoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
