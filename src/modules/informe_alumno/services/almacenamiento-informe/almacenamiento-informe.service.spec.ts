import { Test, TestingModule } from '@nestjs/testing';
import { AlmacenamientoInformeService } from './almacenamiento-informe.service';

describe('AlmacenamientoInformeService', () => {
  let service: AlmacenamientoInformeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlmacenamientoInformeService],
    }).compile();

    service = module.get<AlmacenamientoInformeService>(AlmacenamientoInformeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
