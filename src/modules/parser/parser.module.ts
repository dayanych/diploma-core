import { Module } from '@nestjs/common';
import { ParserService } from './service/parser.service';
import { ParserController } from './controller/parser.controller';

@Module({
  controllers: [ParserController],
  providers: [ParserService],
})
export class ParserModule {}
