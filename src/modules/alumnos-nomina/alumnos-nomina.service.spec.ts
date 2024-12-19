import { Test, TestingModule } from '@nestjs/testing';
import { AlumnosNominaService } from './alumnos-nomina.service';

describe('AlumnosNominaService', () => {
  let service: AlumnosNominaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlumnosNominaService],
    }).compile();

    service = module.get<AlumnosNominaService>(AlumnosNominaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
