import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { Address } from 'viem';
import { EthClients } from 'src/web3/eth.clients';
import { AppProperties } from 'src/app-properties/app-properties';
import { REVERSE_RESOLVER_CACHE } from './caches/reverse-resolver.cache';
import type { IReverseResolverCache } from './caches/reverse-resolver.cache';
import { ReverseResolveResult } from './dto';
import { ContextLogger, LoggerService } from 'src/logger/logger.service';

@Injectable()
export class EnsReverseResolverV2 {
  private readonly maxBulk: number;
  private readonly logger: ContextLogger;

  constructor(
    private readonly client: EthClients,
    @Inject(REVERSE_RESOLVER_CACHE)
    private readonly cache: IReverseResolverCache,
    appProperties: AppProperties,
    loggerService: LoggerService,
  ) {
    this.maxBulk = appProperties.maxBulkReverseRequest;
    this.logger = loggerService.forContext(EnsReverseResolverV2.name);
  }

  public async resolveOne(
    address: Address,
    noCache = false,
  ): Promise<ReverseResolveResult> {
    const key = address.toLowerCase();

    if (!noCache && this.cache.isEnabled()) {
      const cached = this.cache.get(key);
      if (cached !== null) {
        return {
          address,
          hasReverseRecord: cached.name !== null,
          name: cached.name ?? undefined,
        };
      }
    }

    const result = await this.client.getEnsClient().getName({ address });
    const name = result?.name ?? null;
    this.cache.set(key, name);

    this.logger.debug(`resolveOne ${address} -> ${name ?? 'no record'}`);
    return {
      address,
      hasReverseRecord: name !== null,
      name: name ?? undefined,
    };
  }

  public async resolveBulk(
    addresses: Address[],
    noCache = false,
  ): Promise<ReverseResolveResult[]> {
    if (addresses.length === 0) return [];
    if (addresses.length > this.maxBulk) {
      throw new BadRequestException(
        `Bulk reverse supports up to ${this.maxBulk} addresses`,
      );
    }

    // Deduplicate
    const unique = [...new Set(addresses.map((a) => a.toLowerCase() as Address))];

    return Promise.all(unique.map((addr) => this.resolveOne(addr, noCache)));
  }
}
