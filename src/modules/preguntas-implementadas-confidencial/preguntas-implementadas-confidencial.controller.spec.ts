import { Test, TestingModule } from '@nestjs/testing';
import { PreguntasImplementadasConfidencialController } from './preguntas-implementadas-confidencial.controller';

describe('PreguntasImplementadasConfidencialController', () => {
  let controller: PreguntasImplementadasConfidencialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreguntasImplementadasConfidencialController],
    }).compile();

    controller = module.get<PreguntasImplementadasConfidencialController>(PreguntasImplementadasConfidencialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
