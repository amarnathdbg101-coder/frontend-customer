import { describe, it, expect } from 'vitest';
import { getWebSocketUrl } from './websocket';
import { localCache, CACHE_KEYS } from './localCache';
import { cacheEvents, CACHE_EVENTS } from './cacheEvents';

describe('Real-Time WebSocket & Cache Sync Tests', () => {
  it('correctly converts http/https URLs into ws/wss protocols', () => {
    const wsUrl = getWebSocketUrl('/shops/test-kirana/live');
    expect(wsUrl).toMatch(/^wss?:\/\/.+\/shops\/test-kirana\/live$/);
  });

  it('emits STOREFRONT_MUTATED event and purges cache keys', () => {
    const slug = 'ramesh-general-store';
    localCache.set(CACHE_KEYS.STOREFRONT(slug), { name: 'Ramesh Store' });
    localCache.set(CACHE_KEYS.STOREFRONT_PRODUCTS(slug), [{ id: 'p1', name: 'Tata Salt' }]);

    expect(localCache.get(CACHE_KEYS.STOREFRONT(slug))).not.toBeNull();
    expect(localCache.get(CACHE_KEYS.STOREFRONT_PRODUCTS(slug))).not.toBeNull();

    cacheEvents.emit(CACHE_EVENTS.STOREFRONT_MUTATED, { slug });

    expect(localCache.get(CACHE_KEYS.STOREFRONT(slug))).toBeNull();
    expect(localCache.get(CACHE_KEYS.STOREFRONT_PRODUCTS(slug))).toBeNull();
  });

  it('emits RESERVATIONS_MUTATED event and purges reservations cache', () => {
    localCache.set(CACHE_KEYS.RESERVATIONS, [{ id: 'r1', status: 'pending' }]);
    expect(localCache.get(CACHE_KEYS.RESERVATIONS)).not.toBeNull();

    cacheEvents.emit(CACHE_EVENTS.RESERVATIONS_MUTATED, { reservationId: 'r1' });
    expect(localCache.get(CACHE_KEYS.RESERVATIONS)).toBeNull();
  });
});
