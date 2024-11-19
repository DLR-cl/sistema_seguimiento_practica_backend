import { Test, TestingModule } from '@nestjs/testing';
import { AsignaturasRespuestaAlumnoController } from './asignaturas-respuesta-alumno.controller';

describe('AsignaturasRespuestaAlumnoController', () => {
  let controller: AsignaturasRespuestaAlumnoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AsignaturasRespuestaAlumnoController],
    }).compile();

    controller = module.get<AsignaturasRespuestaAlumnoController>(AsignaturasRespuestaAlumnoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
