import { Test, TestingModule } from '@nestjs/testing';
import { PreguntasImplementadasInformeAlumnoController } from './preguntas-implementadas-informe-alumno.controller';

describe('PreguntasImplementadasInformeAlumnoController', () => {
  let controller: PreguntasImplementadasInformeAlumnoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreguntasImplementadasInformeAlumnoController],
    }).compile();

    controller = module.get<PreguntasImplementadasInformeAlumnoController>(PreguntasImplementadasInformeAlumnoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
