import { Injectable } from '@nestjs/common';
import { AppProperties } from 'src/app-properties/app-properties';
import {
  IReverseResolverCache,
  ReverseCacheEntry,
} from './reverse-resolver.cache';

@Injectable()
export class InMemoryReverseResolverCache implements IReverseResolverCache {
  private readonly expiry: number;
  private readonly disabled: boolean;
  private readonly cache = new Map<string, ReverseCacheEntry>();

  constructor(appProperties: AppProperties) {
    this.expiry = appProperties.reverseResolveCacheExpiry;
    this.disabled = this.expiry === 0;
  }

  isEnabled(): boolean {
    return !this.disabled;
  }

  get(address: string): ReverseCacheEntry | null {
    if (this.disabled) return null;
    const entry = this.cache.get(address.toLowerCase());
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(address.toLowerCase());
      return null;
    }
    return entry;
  }

  set(address: string, name: string | null): void {
    if (this.disabled) return;
    this.cache.set(address.toLowerCase(), {
      name,
      cachedAt: Date.now(),
      expiresAt: Date.now() + this.expiry,
    });
  }
}
