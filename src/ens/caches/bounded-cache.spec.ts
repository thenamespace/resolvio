import { AppProperties } from 'src/app-properties/app-properties';
import { BoundedCache } from './bounded-cache';
import { InMemoryForwardResolverCache } from './in-memory-forward-resolver.cache';
import { InMemoryReverseResolverCache } from './in-memory-reverse-resolver.cache';

const props = (overrides: Partial<AppProperties>): AppProperties =>
  ({
    forwardResolveCacheExpiry: 60_000,
    reverseResolveCacheExpiry: 60_000,
    forwardResolveCacheMaxEntries: 100,
    reverseResolveCacheMaxEntries: 100,
    ...overrides,
  }) as AppProperties;

describe('BoundedCache', () => {
  it('never holds more than maxEntries', () => {
    const cache = new BoundedCache<number>(3);
    for (let i = 0; i < 10; i++) cache.set(`k${i}`, i);

    expect(cache.size).toBe(3);
    expect([...cache.keys()]).toEqual(['k7', 'k8', 'k9']);
  });

  it('evicts the least recently used entry', () => {
    const evicted: string[] = [];
    const cache = new BoundedCache<number>(2, (key) => evicted.push(key));
    cache.set('a', 1);
    cache.set('b', 2);
    cache.get('a');
    cache.set('c', 3);

    expect(evicted).toEqual(['b']);
    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBeUndefined();
  });

  it('peek does not update recency', () => {
    const cache = new BoundedCache<number>(2);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.peek('a');
    cache.set('c', 3);

    expect(cache.peek('a')).toBeUndefined();
  });

  it('overwriting a key does not grow the cache', () => {
    const cache = new BoundedCache<number>(2);
    cache.set('a', 1);
    cache.set('a', 2);

    expect(cache.size).toBe(1);
    expect(cache.get('a')).toBe(2);
  });

  it('stores nothing when maxEntries is 0', () => {
    const cache = new BoundedCache<number>(0);
    cache.set('a', 1);

    expect(cache.size).toBe(0);
  });
});

describe('InMemoryForwardResolverCache size limit', () => {
  it('stays bounded across many distinct names and cleans up the name index', () => {
    const cache = new InMemoryForwardResolverCache(
      props({ forwardResolveCacheMaxEntries: 50 }),
    );
    for (let i = 0; i < 1_000; i++) {
      const name = `name${i}.eth`;
      cache.setText(name, 'avatar', null);
      cache.setAddress(name, 60, null);
    }

    const internals = cache as unknown as {
      cache: BoundedCache<unknown>;
      nameIndex: Map<string, Set<string>>;
    };
    expect(internals.cache.size).toBe(50);
    // 2 entries per name, so only the last 25 names remain indexed
    expect(internals.nameIndex.size).toBe(25);
    expect(cache.getText('name0.eth', 'avatar')).toBeNull();
    expect(cache.getText('name999.eth', 'avatar')).not.toBeNull();
  });

  it('deletes only the requested record kind', () => {
    const cache = new InMemoryForwardResolverCache(props({}));
    cache.setText('a.eth', 'avatar', { key: 'avatar', value: 'x' });
    cache.setAddress('a.eth', 60, null);

    cache.deleteText('a.eth');

    expect(cache.getText('a.eth', 'avatar')).toBeNull();
    expect(cache.getAddress('a.eth', 60)).not.toBeNull();
  });

  it('is disabled when max entries is 0', () => {
    const cache = new InMemoryForwardResolverCache(
      props({ forwardResolveCacheMaxEntries: 0 }),
    );
    cache.setText('a.eth', 'avatar', null);

    expect(cache.isEnabled()).toBe(false);
    expect(cache.getText('a.eth', 'avatar')).toBeNull();
  });
});

describe('InMemoryReverseResolverCache size limit', () => {
  it('never holds more than the configured entries', () => {
    const cache = new InMemoryReverseResolverCache(
      props({ reverseResolveCacheMaxEntries: 10 }),
    );
    for (let i = 0; i < 100; i++) cache.set(`0x${i}`, null);

    expect(cache.get('0x0')).toBeNull();
    expect(cache.get('0x99')).not.toBeNull();
  });
});
