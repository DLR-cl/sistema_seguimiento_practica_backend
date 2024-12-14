import { Test, TestingModule } from '@nestjs/testing';
import { AlumnosNominaController } from './alumnos-nomina.controller';

describe('AlumnosNominaController', () => {
  let controller: AlumnosNominaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlumnosNominaController],
    }).compile();

    controller = module.get<AlumnosNominaController>(AlumnosNominaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
