import { Test, TestingModule } from '@nestjs/testing';
import { ValidacionInformeAlumnoService } from './validacion-informe-alumno.service';

describe('ValidacionInformeAlumnoService', () => {
  let service: ValidacionInformeAlumnoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidacionInformeAlumnoService],
    }).compile();

    service = module.get<ValidacionInformeAlumnoService>(ValidacionInformeAlumnoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
