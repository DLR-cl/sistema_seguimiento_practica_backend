import { Test, TestingModule } from '@nestjs/testing';
import { RecopilacionDatosService } from './recopilacion-datos-confidencial.service';

describe('RecopilacionDatosService', () => {
  let service: RecopilacionDatosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecopilacionDatosService],
    }).compile();

    service = module.get<RecopilacionDatosService>(RecopilacionDatosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
