import { Test, TestingModule } from '@nestjs/testing';
import { AutoFuncService } from './auto-func.service';

describe('AutoFuncService', () => {
  let service: AutoFuncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutoFuncService],
    }).compile();

    service = module.get<AutoFuncService>(AutoFuncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
