import { Test, TestingModule } from '@nestjs/testing';
import { EmailAvisosService } from './email-avisos.service';

describe('EmailAvisosService', () => {
  let service: EmailAvisosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailAvisosService],
    }).compile();

    service = module.get<EmailAvisosService>(EmailAvisosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
