/**
 * ShopSilo Customer Web App - Enterprise Event Bus for Event-Driven Cache Invalidation
 *
 * Enables zero-lag event-driven cache invalidation:
 * When a user completes an action (like reservation, review, cart update, khata payment),
 * events are emitted to instantly invalidate specific SWR cache keys and trigger UI revalidation.
 */

import { localCache, CACHE_KEYS } from './localCache';

export const CACHE_EVENTS = {
  SHOPS_MUTATED: 'SHOPS_MUTATED',
  STOREFRONT_MUTATED: 'STOREFRONT_MUTATED',
  PRODUCTS_MUTATED: 'PRODUCTS_MUTATED',
  RESERVATIONS_MUTATED: 'RESERVATIONS_MUTATED',
  KHATA_MUTATED: 'KHATA_MUTATED',
  DEALS_MUTATED: 'DEALS_MUTATED',
  CART_MUTATED: 'CART_MUTATED',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  SAVED_MUTATED: 'SAVED_MUTATED',
};

class CacheEventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribe to a cache invalidation event.
   * Returns an unsubscribe function for automatic React cleanup in useEffect.
   */
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);

    return () => this.off(event, handler);
  }

  /**
   * Unsubscribe a handler from an event.
   */
  off(event, handler) {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(handler);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emit an event to notify all active subscribers and automatically invalidate targeted cache keys in localCache.
   */
  emit(event, payload = {}) {
    // 1. Automatic persistent cache invalidation
    try {
      this._invalidateTargetedCache(event, payload);
    } catch (e) {
      console.warn(`[CacheEventBus] Auto-invalidation error for '${event}':`, e);
    }

    // 2. Notify all active in-memory listeners
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((handler) => {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[CacheEventBus] Error in handler for event '${event}':`, err);
        }
      });
    }
  }

  /**
   * Internal helper to purge specific cached items based on event type
   */
  _invalidateTargetedCache(event, payload) {
    switch (event) {
      case CACHE_EVENTS.RESERVATIONS_MUTATED:
        localCache.remove(CACHE_KEYS.RESERVATIONS);
        break;

      case CACHE_EVENTS.KHATA_MUTATED:
        localCache.remove(CACHE_KEYS.KHATA_SUMMARY);
        localCache.clearPrefix('shopsilo_cache_khata_passbook_');
        break;

      case CACHE_EVENTS.STOREFRONT_MUTATED:
        if (payload?.slug) {
          localCache.remove(CACHE_KEYS.STOREFRONT(payload.slug));
          localCache.remove(CACHE_KEYS.STOREFRONT_PRODUCTS(payload.slug));
        } else {
          localCache.clearPrefix('shopsilo_cache_storefront_');
        }
        break;

      case CACHE_EVENTS.SHOPS_MUTATED:
        localCache.clearPrefix('shopsilo_cache_shops');
        break;

      case CACHE_EVENTS.PRODUCTS_MUTATED:
        localCache.clearPrefix('shopsilo_cache_products');
        break;

      case CACHE_EVENTS.DEALS_MUTATED:
        localCache.clearPrefix('shopsilo_cache_deals');
        break;

      case CACHE_EVENTS.AUTH_LOGOUT:
        localCache.clearUserData();
        break;

      default:
        break;
    }
  }

  /**
   * Remove all active listeners (useful for testing or full app reset).
   */
  removeAll() {
    this.listeners.clear();
  }
}

export const cacheEvents = new CacheEventBus();
export default cacheEvents;
