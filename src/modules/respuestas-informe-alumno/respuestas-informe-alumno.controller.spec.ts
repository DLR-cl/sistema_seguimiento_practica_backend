import { Test, TestingModule } from '@nestjs/testing';
import { RespuestasInformeAlumnoController } from './respuestas-informe-alumno.controller';

describe('RespuestasInformeAlumnoController', () => {
  let controller: RespuestasInformeAlumnoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RespuestasInformeAlumnoController],
    }).compile();

    controller = module.get<RespuestasInformeAlumnoController>(RespuestasInformeAlumnoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
