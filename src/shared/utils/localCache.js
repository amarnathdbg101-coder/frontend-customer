/**
 * ShopSilo Customer Frontend - Enterprise Local Cache Service
 * 
 * Implements Stale-While-Revalidate (SWR) caching pattern:
 * 1. 0ms Instant Hydration: screens render instantly from local cache without loading spinners.
 * 2. Background Revalidation: fresh API data updates cache silently without UI flashing.
 * 3. Offline Resilience: browsing continues seamlessly if the device is offline or network is slow.
 * 4. Quota-Safe: automatic eviction of expired entries if localStorage quota is exceeded.
 * 5. Memory Fallback: graceful degradation when localStorage is blocked or unavailable.
 */

// In-memory fallback if localStorage is disabled or throws
const memoryCache = new Map();

const isStorageAvailable = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const testKey = '__shopsilo_cache_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const hasLocalStorage = isStorageAvailable();

export const CACHE_KEYS = {
  SHOPS: 'shopsilo_cache_shops',
  PRODUCTS: 'shopsilo_cache_products',
  STOREFRONT: (slug) => `shopsilo_cache_storefront_${slug}`,
  STOREFRONT_PRODUCTS: (slug) => `shopsilo_cache_storefront_products_${slug}`,
  DEALS: 'shopsilo_cache_deals',
  KHATA_SUMMARY: 'shopsilo_cache_khata_summary',
  KHATA_PASSBOOK: (id) => `shopsilo_cache_khata_passbook_${id}`,
  RESERVATIONS: 'shopsilo_cache_reservations',
  SEARCH_HISTORY: 'shopsilo_cache_search_history',
  LANGUAGE: 'shopsilo_customer_language',
  THEME: 'shopsilo_theme',
};

// Default TTLs in minutes
export const DEFAULT_TTL = {
  SHOPS: 30, // 30 minutes
  PRODUCTS: 20, // 20 minutes
  STOREFRONT: 30,
  DEALS: 15,
  KHATA: 5, // 5 minutes for ledger
  RESERVATIONS: 5,
  SEARCH_HISTORY: 1440, // 24 hours
};

class LocalCacheService {
  /**
   * Synchronously retrieve cached data (even if stale) for 0ms instant UI rendering.
   */
  get(key, fallback = null) {
    try {
      let raw = null;
      if (hasLocalStorage) {
        raw = window.localStorage.getItem(key);
      } else {
        raw = memoryCache.get(key) || null;
      }

      if (!raw) return fallback;

      const parsed = JSON.parse(raw);
      // Validate wrapper structure
      if (parsed && typeof parsed === 'object' && '__shopsilo_cached' in parsed) {
        return parsed.data !== undefined ? parsed.data : fallback;
      }

      // Legacy direct values
      return parsed !== null ? parsed : fallback;
    } catch (e) {
      console.warn(`[LocalCache] Failed to parse key '${key}':`, e);
      return fallback;
    }
  }

  /**
   * Retrieve cached data only if it is fresh (within TTL).
   */
  getFresh(key, fallback = null) {
    try {
      let raw = null;
      if (hasLocalStorage) {
        raw = window.localStorage.getItem(key);
      } else {
        raw = memoryCache.get(key) || null;
      }

      if (!raw) return fallback;

      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && '__shopsilo_cached' in parsed) {
        const now = Date.now();
        const age = now - (parsed.timestamp || 0);
        if (age < (parsed.ttlMs || 0)) {
          return parsed.data;
        }
        return fallback; // expired
      }

      return parsed !== null ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * Get cached data with freshness metadata
   */
  getMeta(key) {
    try {
      let raw = null;
      if (hasLocalStorage) {
        raw = window.localStorage.getItem(key);
      } else {
        raw = memoryCache.get(key) || null;
      }

      if (!raw) {
        return { data: null, hasCache: false, isStale: true, ageMs: Infinity };
      }

      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && '__shopsilo_cached' in parsed) {
        const now = Date.now();
        const ageMs = now - (parsed.timestamp || 0);
        const isStale = ageMs >= (parsed.ttlMs || 0);
        return {
          data: parsed.data,
          hasCache: true,
          isStale,
          timestamp: parsed.timestamp,
          ageMs,
        };
      }

      return { data: parsed, hasCache: true, isStale: false, ageMs: 0 };
    } catch {
      return { data: null, hasCache: false, isStale: true, ageMs: Infinity };
    }
  }

  /**
   * Save data with TTL into local storage
   */
  set(key, data, ttlMinutes = 30) {
    const payload = {
      __shopsilo_cached: true,
      timestamp: Date.now(),
      ttlMs: ttlMinutes * 60 * 1000,
      version: '1.0',
      data,
    };

    const serialized = JSON.stringify(payload);

    if (hasLocalStorage) {
      try {
        window.localStorage.setItem(key, serialized);
      } catch (err) {
        // Handle QuotaExceededError: evict older cache entries
        if (err.name === 'QuotaExceededError' || err.code === 22) {
          console.warn('[LocalCache] Quota exceeded. Evicting stale cache items...');
          this._evictStale();
          try {
            window.localStorage.setItem(key, serialized);
          } catch {
            memoryCache.set(key, serialized);
          }
        } else {
          memoryCache.set(key, serialized);
        }
      }
    } else {
      memoryCache.set(key, serialized);
    }
  }

  /**
   * Check if a cache key is stale
   */
  isStale(key) {
    const meta = this.getMeta(key);
    return !meta.hasCache || meta.isStale;
  }

  /**
   * Remove a single cached key
   */
  remove(key) {
    try {
      if (hasLocalStorage) {
        window.localStorage.removeItem(key);
      }
      memoryCache.delete(key);
    } catch (e) {
      console.warn(`[LocalCache] Failed to remove '${key}':`, e);
    }
  }

  /**
   * Clear all cache keys matching a prefix
   */
  clearPrefix(prefix = 'shopsilo_cache_') {
    try {
      if (hasLocalStorage) {
        const keysToRemove = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(prefix)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => window.localStorage.removeItem(k));
      }
      for (const k of memoryCache.keys()) {
        if (k.startsWith(prefix)) {
          memoryCache.delete(k);
        }
      }
    } catch (e) {
      console.warn('[LocalCache] Failed to clear prefix:', e);
    }
  }

  /**
   * Evict stale or older cache items when storage quota is tight
   */
  _evictStale() {
    try {
      if (!hasLocalStorage) return;
      const now = Date.now();
      const keysToRemove = [];

      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith('shopsilo_cache_')) {
          try {
            const item = JSON.parse(window.localStorage.getItem(k));
            if (item && item.__shopsilo_cached) {
              const age = now - (item.timestamp || 0);
              if (age > (item.ttlMs || 0)) {
                keysToRemove.push(k);
              }
            }
          } catch {
            keysToRemove.push(k);
          }
        }
      }

      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    } catch (e) {
      console.warn('[LocalCache] Eviction error:', e);
    }
  }
}

export const localCache = new LocalCacheService();
export default localCache;
