import { Test, TestingModule } from '@nestjs/testing';
import { LiaisonsController } from './liaisons.controller';

describe('LiaisonsController', () => {
  let controller: LiaisonsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiaisonsController],
    }).compile();

    controller = module.get<LiaisonsController>(LiaisonsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
