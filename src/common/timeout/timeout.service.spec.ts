import { Test, TestingModule } from '@nestjs/testing';
import { TimeoutService } from './timeout.service';

describe('TimeoutService', () => {
  let service: TimeoutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimeoutService],
    }).compile();

    service = module.get<TimeoutService>(TimeoutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
