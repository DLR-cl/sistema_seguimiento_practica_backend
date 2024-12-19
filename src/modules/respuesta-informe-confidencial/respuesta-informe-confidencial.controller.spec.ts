import { Test, TestingModule } from '@nestjs/testing';
import { RespuestaInformeConfidencialController } from './respuesta-informe-confidencial.controller';

describe('RespuestaInformeConfidencialController', () => {
  let controller: RespuestaInformeConfidencialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RespuestaInformeConfidencialController],
    }).compile();

    controller = module.get<RespuestaInformeConfidencialController>(RespuestaInformeConfidencialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
