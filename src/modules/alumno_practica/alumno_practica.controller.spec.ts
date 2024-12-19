import { Test, TestingModule } from '@nestjs/testing';
import { AlumnoPracticaController } from './alumno_practica.controller';

describe('AlumnoPracticaController', () => {
  let controller: AlumnoPracticaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlumnoPracticaController],
    }).compile();

    controller = module.get<AlumnoPracticaController>(AlumnoPracticaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
