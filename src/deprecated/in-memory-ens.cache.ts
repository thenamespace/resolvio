import { Injectable } from '@nestjs/common';
import { CacheType, EnsCache } from './interface/ens.cache';
import { EnsAddressRecord, EnsProfile, EnsTextRecord } from '../ens/ens.types';
import { Address, namehash } from 'viem';
import { ReverseResolveResult } from '../ens/dto';
import { AppProperties } from 'src/app-properties/app-properties';
import { BoundedCache } from 'src/ens/caches/bounded-cache';

type CacheWrapper<T> = {
  data: T;
  expiration: number;
};

@Injectable()
export class InMemoryEnsCache implements EnsCache {
  private readonly cacheExpiration: number;

  private readonly addressesCache: BoundedCache<
    CacheWrapper<EnsAddressRecord[]>
  >;
  private readonly textsCache: BoundedCache<CacheWrapper<EnsTextRecord[]>>;
  private readonly contentCache: BoundedCache<CacheWrapper<string>>;
  private readonly profileCache: BoundedCache<CacheWrapper<EnsProfile>>;
  private readonly primaryNameCache: BoundedCache<
    CacheWrapper<ReverseResolveResult>
  >;

  constructor(appProperties: AppProperties) {
    this.cacheExpiration = appProperties.forwardResolveCacheExpiry;
    // v1 entries hold whole record sets (~20x a v2 single-record entry),
    // so each v1 cache gets a proportionally smaller limit
    const forwardMax = Math.ceil(
      appProperties.forwardResolveCacheMaxEntries / 20,
    );
    this.addressesCache = new BoundedCache(forwardMax);
    this.textsCache = new BoundedCache(forwardMax);
    this.contentCache = new BoundedCache(forwardMax);
    this.profileCache = new BoundedCache(forwardMax);
    this.primaryNameCache = new BoundedCache(
      appProperties.reverseResolveCacheMaxEntries,
    );
  }

  public getPrimaryName(
    address: Address,
    chain_id: number,
  ): ReverseResolveResult | null {
    const cacheKey = `${address.toLocaleLowerCase()}-${chain_id}`;
    return this.getCacheOrNull(cacheKey, this.primaryNameCache);
  }

  public setPrimaryName(result: ReverseResolveResult, chain_id: number) {
    const now = new Date().getTime();
    const cacheKey = `${result.address.toLocaleLowerCase()}-${chain_id}`;
    this.primaryNameCache.set(cacheKey, {
      expiration: now + this.cacheExpiration,
      data: result,
    });
  }

  public setProfile(name: string, profile: EnsProfile) {
    const now = new Date().getTime();
    this.profileCache.set(name, {
      expiration: now + this.cacheExpiration,
      data: profile,
    });
  }

  public getProfile(name: string): EnsProfile | null {
    return this.getCacheOrNull(name, this.profileCache);
  }

  public setAddresses(
    name: string,
    coins: number[],
    addresses: EnsAddressRecord[],
  ) {
    const addrKey = this.addrCacheKey(name, coins);
    const now = new Date().getTime();
    this.addressesCache.set(addrKey, {
      expiration: now + this.cacheExpiration,
      data: addresses,
    });
  }

  public getAddresses(
    name: string,
    coins: number[],
  ): EnsAddressRecord[] | null {
    const key = this.addrCacheKey(name, coins);
    return this.getCacheOrNull(key, this.addressesCache);
  }

  public setTexts(name: string, texts: string[], data: EnsTextRecord[]): void {
    const key = this.textCacheKey(name, texts);
    const now = new Date().getTime();
    this.textsCache.set(key, {
      expiration: now + this.cacheExpiration,
      data: data,
    });
  }

  public getTexts(name: string, texts: string[]): EnsTextRecord[] | null {
    const key = this.textCacheKey(name, texts);
    return this.getCacheOrNull(key, this.textsCache);
  }

  public getContenthash(name: string): string | null {
    return this.getCacheOrNull(name, this.contentCache);
  }

  public setContenthash(name: string, contenthash: string) {
    const now = new Date().getTime();
    this.contentCache.set(name, {
      expiration: now + this.cacheExpiration,
      data: contenthash,
    });
  }

  public clearCacheForName(name: string, types: CacheType[]) {
    for (const cacheType of types) {
      if (cacheType === CacheType.ALL || cacheType === CacheType.ADDRESS) {
        this.clearAddressCache(name);
      }

      if (cacheType === CacheType.ALL || cacheType === CacheType.TEXT) {
        this.clearTextCache(name);
      }

      if (cacheType === CacheType.CONTENTHASH || cacheType === CacheType.ALL) {
        this.clearContenthashCache(name);
      }
    }
  }

  private clearAddressCache(name: string) {
    const hash = namehash(name);
    for (const key of [...this.addressesCache.keys()]) {
      if (key.startsWith(hash)) {
        this.addressesCache.delete(key);
      }
    }
  }

  private clearTextCache(name: string) {
    const hash = namehash(name);
    for (const key of [...this.textsCache.keys()]) {
      if (key.startsWith(hash)) {
        this.textsCache.delete(key);
      }
    }
  }

  private clearContenthashCache(name: string) {
    this.contentCache.delete(name);
  }

  private addrCacheKey(name: string, coins: number[]): string {
    let base_key = namehash(name) + '-';
    coins.forEach((coin) => {
      base_key += `${coin}`;
    });
    return base_key;
  }

  private textCacheKey(name: string, keys: string[]): string {
    let base_key = namehash(name) + '-';
    keys.forEach((key) => {
      base_key += key;
    });
    return base_key;
  }

  private isExpiredCache(cache: CacheWrapper<unknown>): boolean {
    const now = new Date().getTime();
    return now > cache.expiration;
  }

  private getCacheOrNull<T>(
    key: string,
    cache: BoundedCache<CacheWrapper<T>>,
  ): T | null {
    const currentCache = cache.get(key);
    if (
      currentCache &&
      currentCache.data &&
      !this.isExpiredCache(currentCache)
    ) {
      return currentCache.data;
    }
    return null;
  }
}
