import { Injectable, Logger } from '@nestjs/common';
import { AppProperties } from 'src/app-properties/app-properties';
import { EnsAddressRecord, EnsTextRecord } from '../ens.types';
import {
  CacheEntry,
  IForwardResolverCache,
} from './forward-resolver.cache';

@Injectable()
export class InMemoryForwardResolverCache implements IForwardResolverCache {
  private readonly logger = new Logger(InMemoryForwardResolverCache.name);
  private readonly expiry: number;
  private readonly disabled: boolean;

  private readonly textCache = new Map<string, CacheEntry<EnsTextRecord>>();
  private readonly addressCache = new Map<
    string,
    CacheEntry<EnsAddressRecord>
  >();
  private readonly contenthashCache = new Map<string, CacheEntry<string>>();

  // Tracks all cache keys per name across all caches for O(1) bulk deletes
  private readonly nameIndex = new Map<string, Set<string>>();

  constructor(appProperties: AppProperties) {
    this.expiry = appProperties.forwardResolveCacheExpiry;
    this.disabled = this.expiry === 0;
  }

  isEnabled(): boolean {
    return !this.disabled;
  }

  // --- Texts ---

  getText(name: string, key: string): CacheEntry<EnsTextRecord> | null {
    if (this.disabled) return null;
    const entry = this.getOrNull(this.textKey(name, key), this.textCache);
    if (entry?.isEmpty) {
      this.logger.debug(`Cache hit (empty) text ${name}/${key}`);
    }
    return entry;
  }

  setText(name: string, key: string, data: EnsTextRecord | null): void {
    if (this.disabled) return;
    const cacheKey = this.textKey(name, key);
    this.textCache.set(cacheKey, {
      data,
      isEmpty: data === null,
      cachedAt: Date.now(),
      expiresAt: Date.now() + this.expiry,
    });
    this.trackKey(name, cacheKey);
  }

  deleteText(name: string): void {
    this.deleteFromCache(name, this.textCache);
  }

  // --- Addresses ---

  getAddress(name: string, coin: number): CacheEntry<EnsAddressRecord> | null {
    if (this.disabled) return null;
    const entry = this.getOrNull(
      this.addressKey(name, coin),
      this.addressCache,
    );
    if (entry?.isEmpty) {
      this.logger.debug(`Cache hit (empty) address ${name}/${coin}`);
    }
    return entry;
  }

  setAddress(name: string, coin: number, data: EnsAddressRecord | null): void {
    if (this.disabled) return;
    const cacheKey = this.addressKey(name, coin);
    this.addressCache.set(cacheKey, {
      data,
      isEmpty: data === null,
      cachedAt: Date.now(),
      expiresAt: Date.now() + this.expiry,
    });
    this.trackKey(name, cacheKey);
  }

  deleteAddress(name: string): void {
    this.deleteFromCache(name, this.addressCache);
  }

  // --- Contenthash ---

  getContenthash(name: string): CacheEntry<string> | null {
    if (this.disabled) return null;
    const entry = this.getOrNull(
      this.contenthashKey(name),
      this.contenthashCache,
    );
    if (entry?.isEmpty) {
      this.logger.debug(`Cache hit (empty) contenthash ${name}`);
    }
    return entry;
  }

  setContenthash(name: string, value: string | null): void {
    if (this.disabled) return;
    const cacheKey = this.contenthashKey(name);
    this.contenthashCache.set(cacheKey, {
      data: value,
      isEmpty: value === null,
      cachedAt: Date.now(),
      expiresAt: Date.now() + this.expiry,
    });
    this.trackKey(name, cacheKey);
  }

  deleteContenthash(name: string): void {
    this.deleteFromCache(name, this.contenthashCache);
  }

  // --- Delete all entries for a name across all caches ---

  deleteAll(name: string): void {
    const keys = this.nameIndex.get(name);
    if (!keys) return;
    for (const key of keys) {
      this.textCache.delete(key);
      this.addressCache.delete(key);
      this.contenthashCache.delete(key);
    }
    this.nameIndex.delete(name);
  }

  // --- Internals ---

  private getOrNull<T>(
    key: string,
    cache: Map<string, CacheEntry<T>>,
  ): CacheEntry<T> | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      return null;
    }
    return entry;
  }

  private deleteFromCache<T>(
    name: string,
    cache: Map<string, CacheEntry<T>>,
  ): void {
    const keys = this.nameIndex.get(name);
    if (!keys) return;
    for (const key of keys) {
      cache.delete(key);
    }
  }

  private trackKey(name: string, cacheKey: string): void {
    let keys = this.nameIndex.get(name);
    if (!keys) {
      keys = new Set();
      this.nameIndex.set(name, keys);
    }
    keys.add(cacheKey);
  }

  private textKey(name: string, key: string): string {
    return `${name}-text-${key}`;
  }

  private addressKey(name: string, coin: number): string {
    return `${name}-addr-${coin}`;
  }

  private contenthashKey(name: string): string {
    return `${name}-hash`;
  }
}
