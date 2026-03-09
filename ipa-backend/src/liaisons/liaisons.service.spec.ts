import { Test, TestingModule } from '@nestjs/testing';
import { LiaisonsService } from './liaisons.service';

describe('LiaisonsService', () => {
  let service: LiaisonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LiaisonsService],
    }).compile();

    service = module.get<LiaisonsService>(LiaisonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
