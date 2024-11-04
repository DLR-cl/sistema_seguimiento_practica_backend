import { Test, TestingModule } from '@nestjs/testing';
import { JefeAlumnoService } from './jefe_alumno.service';

describe('JefeAlumnoService', () => {
  let service: JefeAlumnoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JefeAlumnoService],
    }).compile();

    service = module.get<JefeAlumnoService>(JefeAlumnoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
