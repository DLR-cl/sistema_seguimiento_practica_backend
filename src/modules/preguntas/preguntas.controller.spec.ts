import { Test, TestingModule } from '@nestjs/testing';
import { PreguntasController } from './preguntas.controller';

describe('PreguntasController', () => {
  let controller: PreguntasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreguntasController],
    }).compile();

    controller = module.get<PreguntasController>(PreguntasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
