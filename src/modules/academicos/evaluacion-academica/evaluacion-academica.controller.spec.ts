import { Test, TestingModule } from '@nestjs/testing';
import { EvaluacionAcademicaController } from './evaluacion-academica.controller';

describe('EvaluacionAcademicaController', () => {
  let controller: EvaluacionAcademicaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluacionAcademicaController],
    }).compile();

    controller = module.get<EvaluacionAcademicaController>(EvaluacionAcademicaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
