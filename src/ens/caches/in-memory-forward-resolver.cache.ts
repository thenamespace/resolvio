import { Injectable, Logger } from '@nestjs/common';
import { AppProperties } from 'src/app-properties/app-properties';
import { EnsAddressRecord, EnsTextRecord } from '../ens.types';
import { BoundedCache } from './bounded-cache';
import { CacheEntry, IForwardResolverCache } from './forward-resolver.cache';

type RecordKind = 'text' | 'addr' | 'hash';

type StoredEntry = {
  name: string;
  kind: RecordKind;
  entry: CacheEntry<unknown>;
};

@Injectable()
export class InMemoryForwardResolverCache implements IForwardResolverCache {
  private readonly logger = new Logger(InMemoryForwardResolverCache.name);
  private readonly expiry: number;
  private readonly disabled: boolean;

  // Texts, addresses and contenthashes share one fixed-size store
  private readonly cache: BoundedCache<StoredEntry>;

  // Tracks all cache keys per name for O(1) bulk deletes
  private readonly nameIndex = new Map<string, Set<string>>();

  constructor(appProperties: AppProperties) {
    this.expiry = appProperties.forwardResolveCacheExpiry;
    this.disabled =
      this.expiry === 0 || appProperties.forwardResolveCacheMaxEntries === 0;
    this.cache = new BoundedCache<StoredEntry>(
      appProperties.forwardResolveCacheMaxEntries,
      (key, stored) => this.untrackKey(stored.name, key),
    );
  }

  isEnabled(): boolean {
    return !this.disabled;
  }

  // --- Texts ---

  getText(name: string, key: string): CacheEntry<EnsTextRecord> | null {
    if (this.disabled) return null;
    const entry = this.getOrNull<EnsTextRecord>(this.textKey(name, key));
    if (entry?.isEmpty) {
      this.logger.debug(`Cache hit (empty) text ${name}/${key}`);
    }
    return entry;
  }

  setText(name: string, key: string, data: EnsTextRecord | null): void {
    this.setEntry(name, 'text', this.textKey(name, key), data);
  }

  deleteText(name: string): void {
    this.deleteKind(name, 'text');
  }

  // --- Addresses ---

  getAddress(name: string, coin: number): CacheEntry<EnsAddressRecord> | null {
    if (this.disabled) return null;
    const entry = this.getOrNull<EnsAddressRecord>(this.addressKey(name, coin));
    if (entry?.isEmpty) {
      this.logger.debug(`Cache hit (empty) address ${name}/${coin}`);
    }
    return entry;
  }

  setAddress(name: string, coin: number, data: EnsAddressRecord | null): void {
    this.setEntry(name, 'addr', this.addressKey(name, coin), data);
  }

  deleteAddress(name: string): void {
    this.deleteKind(name, 'addr');
  }

  // --- Contenthash ---

  getContenthash(name: string): CacheEntry<string> | null {
    if (this.disabled) return null;
    const entry = this.getOrNull<string>(this.contenthashKey(name));
    if (entry?.isEmpty) {
      this.logger.debug(`Cache hit (empty) contenthash ${name}`);
    }
    return entry;
  }

  setContenthash(name: string, value: string | null): void {
    this.setEntry(name, 'hash', this.contenthashKey(name), value);
  }

  deleteContenthash(name: string): void {
    this.deleteKind(name, 'hash');
  }

  // --- Delete all entries for a name ---

  deleteAll(name: string): void {
    const keys = this.nameIndex.get(name);
    if (!keys) return;
    for (const key of keys) {
      this.cache.delete(key);
    }
    this.nameIndex.delete(name);
  }

  // --- Internals ---

  private getOrNull<T>(key: string): CacheEntry<T> | null {
    const stored = this.cache.get(key);
    if (!stored) return null;
    if (Date.now() > stored.entry.expiresAt) {
      this.cache.delete(key);
      this.untrackKey(stored.name, key);
      return null;
    }
    return stored.entry as CacheEntry<T>;
  }

  private setEntry<T>(
    name: string,
    kind: RecordKind,
    key: string,
    data: T | null,
  ): void {
    if (this.disabled) return;
    const now = Date.now();
    // Track before inserting so an eviction triggered by this insert
    // never leaves the index pointing at a missing key
    this.trackKey(name, key);
    this.cache.set(key, {
      name,
      kind,
      entry: {
        data,
        isEmpty: data === null,
        cachedAt: now,
        expiresAt: now + this.expiry,
      },
    });
  }

  private deleteKind(name: string, kind: RecordKind): void {
    const keys = this.nameIndex.get(name);
    if (!keys) return;
    for (const key of [...keys]) {
      if (this.cache.peek(key)?.kind === kind) {
        this.cache.delete(key);
        this.untrackKey(name, key);
      }
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

  private untrackKey(name: string, cacheKey: string): void {
    const keys = this.nameIndex.get(name);
    if (!keys) return;
    keys.delete(cacheKey);
    if (keys.size === 0) this.nameIndex.delete(name);
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
