import { Test, TestingModule } from '@nestjs/testing';
import { PreguntasImplementadasInformeAlumnoService } from './preguntas-implementadas-informe-alumno.service';

describe('PreguntasImplementadasInformeAlumnoService', () => {
  let service: PreguntasImplementadasInformeAlumnoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PreguntasImplementadasInformeAlumnoService],
    }).compile();

    service = module.get<PreguntasImplementadasInformeAlumnoService>(PreguntasImplementadasInformeAlumnoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
