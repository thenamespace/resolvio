/**
 * Fixed-size LRU cache. When full, the least recently used entry is evicted,
 * so memory stays bounded no matter how many distinct keys are requested.
 * A maxEntries of 0 stores nothing.
 */
export class BoundedCache<V> {
  // Map keeps insertion order; re-inserting on access moves a key to the end,
  // so the first key is always the least recently used.
  private readonly map = new Map<string, V>();

  constructor(
    private readonly maxEntries: number,
    private readonly onEvict?: (key: string, value: V) => void,
  ) {}

  get size(): number {
    return this.map.size;
  }

  get(key: string): V | undefined {
    const value = this.map.get(key);
    if (value === undefined) return undefined;
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  /** Reads without updating recency. */
  peek(key: string): V | undefined {
    return this.map.get(key);
  }

  set(key: string, value: V): void {
    if (this.maxEntries <= 0) return;
    this.map.delete(key);
    this.map.set(key, value);
    while (this.map.size > this.maxEntries) {
      const oldest = this.map.keys().next().value as string;
      const evicted = this.map.get(oldest) as V;
      this.map.delete(oldest);
      this.onEvict?.(oldest, evicted);
    }
  }

  delete(key: string): boolean {
    return this.map.delete(key);
  }

  keys(): IterableIterator<string> {
    return this.map.keys();
  }

  entries(): IterableIterator<[string, V]> {
    return this.map.entries();
  }
}
