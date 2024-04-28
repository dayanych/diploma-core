import { Module } from '@nestjs/common';
import { GraphsController } from './controller/graphs.controller';
import { GraphsService } from './service/graphs.service';

@Module({
  controllers: [GraphsController],
  providers: [GraphsService],
})
export class GraphsModule {}
