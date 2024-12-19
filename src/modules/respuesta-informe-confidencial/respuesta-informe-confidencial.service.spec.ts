import { Test, TestingModule } from '@nestjs/testing';
import { RespuestaInformeConfidencialService } from './respuesta-informe-confidencial.service';

describe('RespuestaInformeConfidencialService', () => {
  let service: RespuestaInformeConfidencialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RespuestaInformeConfidencialService],
    }).compile();

    service = module.get<RespuestaInformeConfidencialService>(RespuestaInformeConfidencialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
