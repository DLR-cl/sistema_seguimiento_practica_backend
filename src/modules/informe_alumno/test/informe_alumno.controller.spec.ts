import { Test, TestingModule } from '@nestjs/testing';
import { InformeAlumnoController } from './informe_alumno.controller';

describe('InformeAlumnoController', () => {
  let controller: InformeAlumnoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InformeAlumnoController],
    }).compile();

    controller = module.get<InformeAlumnoController>(InformeAlumnoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
