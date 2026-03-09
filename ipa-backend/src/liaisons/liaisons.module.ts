import { Module } from '@nestjs/common';
import { LiaisonsController } from './liaisons.controller';
import { LiaisonsService } from './liaisons.service';

@Module({
  controllers: [LiaisonsController],
  providers: [LiaisonsService]
})
export class LiaisonsModule {}
