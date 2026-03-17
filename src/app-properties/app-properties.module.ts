import { Global, Module } from '@nestjs/common';
import { AppProperties } from './app-properties';

@Global()
@Module({
  providers: [AppProperties],
  exports: [AppProperties],
})
export class AppPropertiesModule {}
