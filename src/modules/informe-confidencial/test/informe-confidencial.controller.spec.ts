import { Test, TestingModule } from '@nestjs/testing';
import { InformeConfidencialController } from './informe-confidencial.controller';

describe('InformeConfidencialController', () => {
  let controller: InformeConfidencialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InformeConfidencialController],
    }).compile();

    controller = module.get<InformeConfidencialController>(InformeConfidencialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
