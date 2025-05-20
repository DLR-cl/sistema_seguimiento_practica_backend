import { Test, TestingModule } from '@nestjs/testing';
import { ReportesPracticaController } from './reportes-practica.controller';

describe('ReportesPracticaController', () => {
  let controller: ReportesPracticaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportesPracticaController],
    }).compile();

    controller = module.get<ReportesPracticaController>(ReportesPracticaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
