import { Test, TestingModule } from '@nestjs/testing';
import { AcademicosController } from '../academicos.controller';

describe('AcademicosController', () => {
  let controller: AcademicosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcademicosController],
    }).compile();

    controller = module.get<AcademicosController>(AcademicosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
