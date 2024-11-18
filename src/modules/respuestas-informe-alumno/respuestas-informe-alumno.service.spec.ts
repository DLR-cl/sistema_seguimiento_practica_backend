import { Test, TestingModule } from '@nestjs/testing';
import { RespuestasInformeAlumnoService } from './respuestas-informe-alumno.service';

describe('RespuestasInformeAlumnoService', () => {
  let service: RespuestasInformeAlumnoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RespuestasInformeAlumnoService],
    }).compile();

    service = module.get<RespuestasInformeAlumnoService>(RespuestasInformeAlumnoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
