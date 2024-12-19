import { Test, TestingModule } from '@nestjs/testing';
import { DimensionesEvaluativasController } from './dimensiones-evaluativas.controller';

describe('DimensionesEvaluativasController', () => {
  let controller: DimensionesEvaluativasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DimensionesEvaluativasController],
    }).compile();

    controller = module.get<DimensionesEvaluativasController>(DimensionesEvaluativasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
