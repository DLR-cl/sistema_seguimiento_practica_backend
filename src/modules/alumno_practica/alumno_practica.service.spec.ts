import { Test, TestingModule } from '@nestjs/testing';
import { AlumnoPracticaService } from './alumno_practica.service';

describe('AlumnoPracticaService', () => {
  let service: AlumnoPracticaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlumnoPracticaService],
    }).compile();

    service = module.get<AlumnoPracticaService>(AlumnoPracticaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
