import { Module } from '@nestjs/common';
import { ParserModule } from './modules/parser/parser.module';
import { GraphsModule } from './modules/graphs/graphs.module';

@Module({
  imports: [ParserModule, GraphsModule],
})
export class AppModule {}
