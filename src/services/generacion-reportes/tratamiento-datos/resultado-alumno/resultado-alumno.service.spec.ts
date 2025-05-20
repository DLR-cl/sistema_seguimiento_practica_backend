import { Test, TestingModule } from '@nestjs/testing';
import { ResultadoAlumnoService } from './resultado-alumno.service';

describe('ResultadoAlumnoService', () => {
  let service: ResultadoAlumnoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResultadoAlumnoService],
    }).compile();

    service = module.get<ResultadoAlumnoService>(ResultadoAlumnoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
