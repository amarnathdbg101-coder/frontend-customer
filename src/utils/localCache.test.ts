import { describe, it, expect, beforeEach, vi } from 'vitest';
import { localCache, CACHE_KEYS } from './localCache';

describe('LocalCache System Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should set and get data synchronously with 0ms instant retrieval', () => {
    const mockShops = [{ id: 's1', name: 'Gupta Kirana' }];
    localCache.set(CACHE_KEYS.SHOPS, mockShops, 30);

    const retrieved = localCache.get(CACHE_KEYS.SHOPS);
    expect(retrieved).toEqual(mockShops);
  });

  it('should return fallback when key does not exist or is invalid JSON', () => {
    expect(localCache.get('non_existent_key', 'fallback_val')).toBe('fallback_val');

    localStorage.setItem('invalid_json_key', '{bad_json');
    expect(localCache.get('invalid_json_key', null)).toBeNull();
  });

  it('should differentiate between fresh and expired data in getFresh', () => {
    const mockData = { items: [1, 2, 3] };
    const key = 'test_fresh_key';

    // Set with 10 minute TTL
    localCache.set(key, mockData, 10);
    expect(localCache.getFresh(key)).toEqual(mockData);

    // Fast-forward time past 10 minutes (11 minutes = 11 * 60 * 1000 ms)
    const originalNow = Date.now;
    Date.now = vi.fn(() => originalNow() + 11 * 60 * 1000);

    expect(localCache.getFresh(key, null)).toBeNull();
    expect(localCache.isStale(key)).toBe(true);

    Date.now = originalNow;
  });

  it('should invalidate pattern and remove matched cache keys', () => {
    localCache.set('shopsilo_cache_storefront_shop1', { name: 'Shop 1' });
    localCache.set('shopsilo_cache_storefront_shop2', { name: 'Shop 2' });
    localCache.set('shopsilo_cache_deals', { deals: [] });

    expect(localCache.get('shopsilo_cache_storefront_shop1')).not.toBeNull();

    localCache.invalidatePattern('storefront');

    expect(localCache.get('shopsilo_cache_storefront_shop1')).toBeNull();
    expect(localCache.get('shopsilo_cache_storefront_shop2')).toBeNull();
    expect(localCache.get('shopsilo_cache_deals')).not.toBeNull();
  });

  it('should purge private user data on clearUserData()', () => {
    localCache.set('shopsilo_cache_khata_summary', { balance: 500 });
    localCache.set('shopsilo_cache_reservations', [{ id: 'res1' }]);
    localCache.set('shopsilo_cache_shops', [{ id: 'shop1' }]);

    localCache.clearUserData();

    expect(localCache.get('shopsilo_cache_khata_summary')).toBeNull();
    expect(localCache.get('shopsilo_cache_reservations')).toBeNull();
    expect(localCache.get('shopsilo_cache_shops')).not.toBeNull(); // Public data retained
  });
});
