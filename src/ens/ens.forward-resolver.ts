import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EthClients } from 'src/web3/eth.clients';
import { chainNameForCoin, coinTypeForChain } from './supported-chains';
import { FORWARD_RESOLVER_CACHE } from './interface/forward-resolver.cache';
import type { IForwardResolverCache } from './interface/forward-resolver.cache';
import { EnsTextRecord } from './ens.types';
import {
  AddressResult,
  ContenthashResult,
  EnsAddressesRequest,
  EnsTextsRequest,
  ForwardAddressesResponse,
  ForwardCacheType,
  ForwardTextsResponse,
  TextResult,
} from './dto';

const ETH_COIN_TYPE = 60;

@Injectable()
export class EnsForwardResolver {
  constructor(
    private readonly client: EthClients,
    @Inject(FORWARD_RESOLVER_CACHE)
    private readonly cache: IForwardResolverCache,
  ) {}

  public async resolveTexts(
    name: string,
    request: EnsTextsRequest,
  ): Promise<ForwardTextsResponse> {
    const { keys = [], noCache = false } = request;
    const texts: TextResult[] = [];
    const missedKeys: string[] = [];

    if (keys.length === 0) {
        throw new BadRequestException("At least on text key required");
    }

    if (!noCache && this.cache.isEnabled()) {
      for (const key of keys) {
        const cached = this.cache.getText(name, key);
        if (cached !== null) {
          texts.push(cached.isEmpty
            ? { key, exists: false }
            : { key, value: cached.data!.value, exists: true });
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
        texts.push(textRecord
          ? { key, value: textRecord.value, exists: true }
          : { key, exists: false });
      }
    }

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
        if (coin === null) throw new BadRequestException(`Unsupported chain: ${chain}`);
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
          addresses.push(cached.isEmpty
            ? { coin, chain, exists: false }
            : { coin, chain, value: cached.data!.address, exists: true });
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
        this.cache.setAddress(name, coin, record
          ? { coin: record.id, name: record.name, address: record.value }
          : null);
        const chain = chainNameForCoin(coin);
        addresses.push(record
          ? { coin, chain, value: record.value, exists: true }
          : { coin, chain, exists: false });
      }
    }

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
    return { value, exists: true };
  }

  public resolveProfile() {
    // TODO: implement
  }

  public clearCache(name: string, type: ForwardCacheType = ForwardCacheType.ALL): void {
    if (type === ForwardCacheType.TEXTS)     return this.cache.deleteText(name);
    if (type === ForwardCacheType.ADDRESSES) return this.cache.deleteAddress(name);
    this.cache.deleteAll(name);
  }

  private ens() {
    return this.client.getEnsClient();
  }
}
