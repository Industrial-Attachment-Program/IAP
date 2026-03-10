import { Module } from '@nestjs/common';
import { LiaisonsController } from './liaisons.controller';
import { LiaisonsService } from './liaisons.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LiaisonsController],
  providers: [LiaisonsService]
})
export class LiaisonsModule { }
