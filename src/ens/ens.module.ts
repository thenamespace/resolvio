import { Module } from '@nestjs/common';
import { EnsResolver } from './ens.resolver';
import { InMemoryEnsCache } from './in-memory-ens.cache';
import { Web3Module } from 'src/web3/web3.module';
import {
  EnsForwardResolutionController,
  EnsReverseResolutionController,
} from './ens.controller';
import { EnsReverseResolver } from './ens-resverse.resolver';
import { EnsForwardResolver } from './ens.forward-resolver';
import { InMemoryForwardResolverCache } from './in-memory-forward-resolver.cache';
import { FORWARD_RESOLVER_CACHE } from './interface/forward-resolver.cache';
import { EnsForwardController } from './ens.forward-controller';

@Module({
  exports: [EnsResolver, EnsForwardResolver],
  providers: [
    EnsResolver,
    InMemoryEnsCache,
    EnsReverseResolver,
    EnsForwardResolver,
    InMemoryForwardResolverCache,
    {
      provide: FORWARD_RESOLVER_CACHE,
      useClass: InMemoryForwardResolverCache,
    },
  ],
  controllers: [
    EnsForwardResolutionController,
    EnsReverseResolutionController,
    EnsForwardController,
  ],
  imports: [Web3Module],
})
export class ENSModule {}
