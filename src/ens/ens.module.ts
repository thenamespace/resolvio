import { Module } from '@nestjs/common';
import { EnsResolver } from '../deprecated/ens.resolver';
import { InMemoryEnsCache } from '../deprecated/in-memory-ens.cache';
import { Web3Module } from 'src/web3/web3.module';
import {
  EnsForwardResolutionController,
  EnsReverseResolutionController,
} from '../deprecated/ens.controller';
import { EnsReverseResolver } from '../deprecated/ens-reverse.resolver';
import { EnsForwardResolver } from './ens.forward-resolver';
import { EnsForwardController } from './ens.forward-controller';
import { EnsReverseResolverV2 } from './ens.reverse-resolver';
import { EnsReverseController } from './ens.reverse-controller';
import { InMemoryForwardResolverCache } from './caches/in-memory-forward-resolver.cache';
import { FORWARD_RESOLVER_CACHE } from './caches/forward-resolver.cache';
import { InMemoryReverseResolverCache } from './caches/in-memory-reverse-resolver.cache';
import { REVERSE_RESOLVER_CACHE } from './caches/reverse-resolver.cache';

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
    EnsReverseResolverV2,
    InMemoryReverseResolverCache,
    {
      provide: REVERSE_RESOLVER_CACHE,
      useClass: InMemoryReverseResolverCache,
    },
  ],
  controllers: [
    EnsForwardResolutionController,
    EnsReverseResolutionController,
    EnsForwardController,
    EnsReverseController,
  ],
  imports: [Web3Module],
})
export class ENSModule {}
