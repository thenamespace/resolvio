import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EthClients } from 'src/web3/eth.clients';
import { chainNameForCoin, coinTypeForChain } from './supported-chains';
import { FORWARD_RESOLVER_CACHE } from './caches/forward-resolver.cache';
import type { IForwardResolverCache } from './caches/forward-resolver.cache';
import { EnsTextRecord } from './ens.types';
import {
  AddressResult,
  ContenthashResult,
  DEFAULT_PROFILE_ADDRESSES,
  DEFAULT_PROFILE_CHAINS,
  DEFAULT_PROFILE_CONTENTHASH,
  DEFAULT_PROFILE_TEXTS,
  EnsAddressesRequest,
  EnsTextsRequest,
  ForwardAddressesResponse,
  ForwardCacheType,
  ForwardTextsResponse,
  ProfileRequest,
  ProfileResponse,
  TextResult,
} from './dto';
import { ContextLogger, LoggerService } from 'src/logger/logger.service';

const ETH_COIN_TYPE = 60;

@Injectable()
export class EnsForwardResolver {
  private readonly logger: ContextLogger;

  constructor(
    private readonly client: EthClients,
    @Inject(FORWARD_RESOLVER_CACHE)
    private readonly cache: IForwardResolverCache,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService.forContext(EnsForwardResolver.name);
  }

  public async resolveTexts(
    name: string,
    request: EnsTextsRequest,
  ): Promise<ForwardTextsResponse> {
    const { keys = [], noCache = false } = request;
    const texts: TextResult[] = [];
    const missedKeys: string[] = [];

    if (keys.length === 0) {
      throw new BadRequestException('At least on text key required');
    }

    if (!noCache && this.cache.isEnabled()) {
      for (const key of keys) {
        const cached = this.cache.getText(name, key);
        if (cached !== null) {
          texts.push(
            cached.isEmpty
              ? { key, exists: false }
              : { key, value: cached.data!.value, exists: true },
          );
        } else {
          missedKeys.push(key);
        }
      }
    } else {
      missedKeys.push(...keys);
    }

    if (missedKeys.length > 0) {
      const result = await this.ens().getRecords({ name, texts: missedKeys });
      const fetchedByKey = new Map(result.texts.map((t) => [t.key, t]));

      for (const key of missedKeys) {
        const record = fetchedByKey.get(key) ?? null;
        const textRecord: EnsTextRecord | null = record
          ? { key: record.key, value: record.value }
          : null;
        this.cache.setText(name, key, textRecord);
        texts.push(
          textRecord
            ? { key, value: textRecord.value, exists: true }
            : { key, exists: false },
        );
      }
    }

    this.logger.debug(`resolveTexts ${name} keys=[${keys.join(',')}] -> ${texts.length} records`);
    return { name, texts };
  }

  public async resolveAddresses(
    name: string,
    request: EnsAddressesRequest,
  ): Promise<ForwardAddressesResponse> {
    
    if (request.coins?.length && request.chains?.length) {
      throw new BadRequestException('Provide either coins or chains, not both');
    }

    let requestedCoins: number[];

    if (request.chains?.length) {
      const resolved = request.chains.map((chain) => {
        const coin = coinTypeForChain(chain);
        if (coin === null)
          throw new BadRequestException(`Unsupported chain: ${chain}`);
        return coin;
      });
      requestedCoins = resolved;
    } else {
      requestedCoins = request.coins?.length ? request.coins : [ETH_COIN_TYPE];
    }

    const noCache = request.noCache ?? false;
    const addresses: AddressResult[] = [];
    const missedCoins: number[] = [];

    if (!noCache && this.cache.isEnabled()) {
      for (const coin of requestedCoins) {
        const cached = this.cache.getAddress(name, coin);
        if (cached !== null) {
          const chain = chainNameForCoin(coin);
          addresses.push(
            cached.isEmpty
              ? { coin, chain, exists: false }
              : { coin, chain, value: cached.data!.address, exists: true },
          );
        } else {
          missedCoins.push(coin);
        }
      }
    } else {
      missedCoins.push(...requestedCoins);
    }

    if (missedCoins.length > 0) {
      const result = await this.ens().getRecords({ name, coins: missedCoins });
      const fetchedByCoin = new Map(result.coins.map((c) => [c.id, c]));

      for (const coin of missedCoins) {
        const record = fetchedByCoin.get(coin) ?? null;
        this.cache.setAddress(
          name,
          coin,
          record
            ? { coin: record.id, name: record.name, address: record.value }
            : null,
        );
        const chain = chainNameForCoin(coin);
        addresses.push(
          record
            ? { coin, chain, value: record.value, exists: true }
            : { coin, chain, exists: false },
        );
      }
    }

    this.logger.debug(`resolveAddresses ${name} coins=[${requestedCoins.join(',')}] -> ${addresses.length} records`);
    return { name, addresses };
  }

  public async resolveContenthash(
    name: string,
    noCache = false,
  ): Promise<ContenthashResult> {
    if (!noCache && this.cache.isEnabled()) {
      const cached = this.cache.getContenthash(name);
      if (cached !== null) {
        return cached.isEmpty
          ? { exists: false }
          : { value: cached.data!, exists: true };
      }
    }

    const result = await this.ens().getRecords({ name, contentHash: true });
    if (!result.contentHash) {
      this.cache.setContenthash(name, null);
      return { exists: false };
    }

    const value = `${result.contentHash.protocolType}://${result.contentHash.decoded}`;
    this.cache.setContenthash(name, value);
    this.logger.debug(`resolveContenthash ${name} -> ${value}`);
    return { value, exists: true };
  }

  public async resolveProfile(
    name: string,
    request: ProfileRequest,
  ): Promise<ProfileResponse> {

    const noTextsRequest      = !request.texts     || request.texts.length     === 0;
    const noAddressesRequest  = !request.addresses || request.addresses.length === 0;
    const noContenthashRequest = request.contenthash === undefined; // explicit false ≠ unset

    const useDefaultProfile = noTextsRequest && noAddressesRequest && noContenthashRequest;

    const textKeys         = noTextsRequest ? DEFAULT_PROFILE_TEXTS : request.texts!;
    const includeContenthash = request.contenthash ?? DEFAULT_PROFILE_CONTENTHASH;
    const noCache          = request.noCache ?? false;

    // When no params at all: use DEFAULT_PROFILE_CHAINS (a richer default set, populated later).
    // When some params are explicit: fall back to DEFAULT_PROFILE_ADDRESSES for addresses.
    const addressInputs = useDefaultProfile
      ? (DEFAULT_PROFILE_CHAINS.length > 0 ? DEFAULT_PROFILE_CHAINS : DEFAULT_PROFILE_ADDRESSES)
      : (noAddressesRequest ? DEFAULT_PROFILE_ADDRESSES : request.addresses!);

    // Each address input is either a coin type number ("60") or a chain name ("eth").
    const requestedCoins: number[] = addressInputs.map((input) => {
      const asNum = Number(input);
      if (!isNaN(asNum) && input.trim() !== '') return asNum;
      const coin = coinTypeForChain(input);
      if (coin === null)
        throw new BadRequestException(`Unsupported chain: ${input}`);
      return coin;
    });

    // --- Read per-item caches, collect misses ---
    const texts: TextResult[] = [];
    const missedKeys: string[] = [];
    const addresses: AddressResult[] = [];
    const missedCoins: number[] = [];
    let contenthash: ContenthashResult | null = null;
    let fetchContenthash = includeContenthash;
    let resolverAddress: `0x${string}` | undefined;

    const cacheEnabled = !noCache && this.cache.isEnabled();

    if (cacheEnabled) {
      for (const key of textKeys) {
        const cached = this.cache.getText(name, key);
        if (cached !== null) {
          texts.push(
            cached.isEmpty
              ? { key, exists: false }
              : { key, value: cached.data!.value, exists: true },
          );
        } else {
          missedKeys.push(key);
        }
      }

      for (const coin of requestedCoins) {
        const cached = this.cache.getAddress(name, coin);
        if (cached !== null) {
          const chain = chainNameForCoin(coin);
          addresses.push(
            cached.isEmpty
              ? { coin, chain, exists: false }
              : { coin, chain, value: cached.data!.address, exists: true },
          );
        } else {
          missedCoins.push(coin);
        }
      }

      if (includeContenthash) {
        const cached = this.cache.getContenthash(name);
        if (cached !== null) {
          contenthash = cached.isEmpty
            ? { exists: false }
            : { value: cached.data!, exists: true };
          fetchContenthash = false;
        }
      }
    } else {
      missedKeys.push(...textKeys);
      missedCoins.push(...requestedCoins);
    }

    // --- Single getRecords call for all misses ---

    if (missedKeys.length > 0 || missedCoins.length > 0 || fetchContenthash) {
      const result = await this.ens().getRecords({
        name,
        texts: missedKeys,
        coins: missedCoins,
        ...(fetchContenthash ? { contentHash: true } : {}),
      });

      resolverAddress = result.resolverAddress;

      const fetchedByKey = new Map(result.texts.map((t) => [t.key, t]));
      for (const key of missedKeys) {
        const record = fetchedByKey.get(key) ?? null;
        this.cache.setText(
          name,
          key,
          record ? { key: record.key, value: record.value } : null,
        );
        texts.push(
          record
            ? { key, value: record.value, exists: true }
            : { key, exists: false },
        );
      }

      const fetchedByCoin = new Map(result.coins.map((c) => [c.id, c]));
      for (const coin of missedCoins) {
        const record = fetchedByCoin.get(coin) ?? null;
        const chain = chainNameForCoin(coin);
        this.cache.setAddress(
          name,
          coin,
          record
            ? { coin: record.id, name: record.name, address: record.value }
            : null,
        );
        addresses.push(
          record
            ? { coin, chain, value: record.value, exists: true }
            : { coin, chain, exists: false },
        );
      }

      if (fetchContenthash) {
        const ch = 'contentHash' in result ? result.contentHash : null;
        if (ch) {
          const value = `${ch.protocolType}://${ch.decoded}`;
          this.cache.setContenthash(name, value);
          contenthash = { value, exists: true };
        } else {
          this.cache.setContenthash(name, null);
          contenthash = { exists: false };
        }
      }
    }

    // Restore original request order (cache hits arrive first, misses are appended).
    const textOrder = new Map(textKeys.map((k, i) => [k, i]));
    texts.sort(
      (a, b) => (textOrder.get(a.key) ?? 0) - (textOrder.get(b.key) ?? 0),
    );

    const coinOrder = new Map(requestedCoins.map((c, i) => [c, i]));
    addresses.sort(
      (a, b) => (coinOrder.get(a.coin) ?? 0) - (coinOrder.get(b.coin) ?? 0),
    );

    const response = {
      name,
      texts,
      addresses,
      contenthash: contenthash ?? { exists: false },
      resolver: resolverAddress,
    };
    this.logger.debug(
      `resolveProfile ${name} texts=${texts.length} addresses=${addresses.length} contenthash=${response.contenthash.exists}`,
    );
    return response;
  }

  public clearCache(
    name: string,
    type: ForwardCacheType = ForwardCacheType.ALL,
  ): void {
    if (type === ForwardCacheType.TEXTS) return this.cache.deleteText(name);
    if (type === ForwardCacheType.ADDRESSES)
      return this.cache.deleteAddress(name);
    this.cache.deleteAll(name);
  }

  private ens() {
    return this.client.getEnsClient();
  }
}
