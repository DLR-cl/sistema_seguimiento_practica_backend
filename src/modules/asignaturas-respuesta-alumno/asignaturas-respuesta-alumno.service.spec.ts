import { Test, TestingModule } from '@nestjs/testing';
import { AsignaturasRespuestaAlumnoService } from './asignaturas-respuesta-alumno.service';

describe('AsignaturasRespuestaAlumnoService', () => {
  let service: AsignaturasRespuestaAlumnoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AsignaturasRespuestaAlumnoService],
    }).compile();

    service = module.get<AsignaturasRespuestaAlumnoService>(AsignaturasRespuestaAlumnoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
