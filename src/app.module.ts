import { Module } from '@nestjs/common';
import { ENSModule } from './ens/ens.module';
import { ResolverModule } from './resolver/resolver.module';

@Module({
  imports: [ENSModule, ResolverModule],
})
export class AppModule {}
