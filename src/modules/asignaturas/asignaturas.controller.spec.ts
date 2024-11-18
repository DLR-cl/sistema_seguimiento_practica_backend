import { Test, TestingModule } from '@nestjs/testing';
import { AsignaturasController } from './asignaturas.controller';

describe('AsignaturasController', () => {
  let controller: AsignaturasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AsignaturasController],
    }).compile();

    controller = module.get<AsignaturasController>(AsignaturasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
