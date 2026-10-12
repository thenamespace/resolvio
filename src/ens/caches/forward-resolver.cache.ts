import { EnsAddressRecord, EnsTextRecord } from '../ens.types';

export const FORWARD_RESOLVER_CACHE = Symbol('FORWARD_RESOLVER_CACHE');

export type CacheEntry<T> = {
  data: T | null;
  isEmpty: boolean;
  cachedAt: number;
  expiresAt: number;
};

export interface IForwardResolverCache {
  getText(name: string, key: string): CacheEntry<EnsTextRecord> | null;
  setText(name: string, key: string, data: EnsTextRecord | null): void;
  deleteText(name: string): void;

  getAddress(name: string, coin: number): CacheEntry<EnsAddressRecord> | null;
  setAddress(name: string, coin: number, data: EnsAddressRecord | null): void;
  deleteAddress(name: string): void;

  getContenthash(name: string): CacheEntry<string> | null;
  setContenthash(name: string, value: string | null): void;
  deleteContenthash(name: string): void;

  deleteAll(name: string): void;
  isEnabled(): boolean;
}
