import { Test, TestingModule } from '@nestjs/testing';
import { InformeAlumnoService } from './informe_alumno.service';

describe('InformeAlumnoService', () => {
  let service: InformeAlumnoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InformeAlumnoService],
    }).compile();

    service = module.get<InformeAlumnoService>(InformeAlumnoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
