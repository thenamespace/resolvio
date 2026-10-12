export const REVERSE_RESOLVER_CACHE = Symbol('REVERSE_RESOLVER_CACHE');

export type ReverseCacheEntry = {
  /** Resolved name, or null if address has no reverse record. */
  name: string | null;
  cachedAt: number;
  expiresAt: number;
};

export interface IReverseResolverCache {
  /** Returns null when the address is not in cache (cache miss). */
  get(address: string): ReverseCacheEntry | null;
  set(address: string, name: string | null): void;
  isEnabled(): boolean;
}
