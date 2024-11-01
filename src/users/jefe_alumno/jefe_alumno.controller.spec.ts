import { Test, TestingModule } from '@nestjs/testing';
import { JefeAlumnoController } from './jefe_alumno.controller';

describe('JefeAlumnoController', () => {
  let controller: JefeAlumnoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JefeAlumnoController],
    }).compile();

    controller = module.get<JefeAlumnoController>(JefeAlumnoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
