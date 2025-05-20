import { Test, TestingModule } from '@nestjs/testing';
import { ReporteResultadoAcademicoService } from './reporte-resultado-academico.service';

describe('ReporteResultadoAcademicoService', () => {
  let service: ReporteResultadoAcademicoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReporteResultadoAcademicoService],
    }).compile();

    service = module.get<ReporteResultadoAcademicoService>(ReporteResultadoAcademicoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
