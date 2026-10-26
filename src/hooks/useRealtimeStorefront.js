/**
 * ShopSilo Customer Web App - Enterprise Real-Time Storefront Hook
 *
 * Connects to GoBackend Public Storefront WebSocket (/shops/:slug/live).
 * Delivers instantaneous (<15ms) updates when a merchant alters product pricing,
 * marks clearance offers, updates stock, or toggles store status.
 *
 * Automatically mutates local SWR cache and fires domain events to eliminate stale data.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { getWebSocketUrl } from '../utils/websocket';
import { localCache, CACHE_KEYS } from '../utils/localCache';
import { cacheEvents, CACHE_EVENTS } from '../utils/cacheEvents';

export const useRealtimeStorefront = (slug, options = {}) => {
  const { onProductMutated, onStockChanged, onShopStatusChanged, onOfferMutated } = options;
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef(null);
  const heartbeatTimerRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const isUnmountedRef = useRef(false);

  // Keep latest callbacks in refs to avoid reconnection on function identity change
  const callbacksRef = useRef(options);
  callbacksRef.current = options;

  const cleanup = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (_) {}
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (!slug || typeof window === 'undefined' || typeof WebSocket === 'undefined') {
      return;
    }

    cleanup();

    const wsUrl = getWebSocketUrl(`/shops/${encodeURIComponent(slug)}/live`);
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isUnmountedRef.current) return;
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Heartbeat ping every 25 seconds
        heartbeatTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
            } catch (_) {}
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        if (isUnmountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          if (!data || typeof data !== 'object') return;

          const eventType = data.event || data.type;
          const payload = data.payload || {};

          switch (eventType) {
            case 'PRODUCT_CREATED':
            case 'PRODUCT_MUTATED': {
              const prodId = payload.id || payload.product_id;
              // Synchronously update localCache storefront product list
              const cached = localCache.get(CACHE_KEYS.STOREFRONT_PRODUCTS(slug));
              if (Array.isArray(cached) && prodId) {
                const idx = cached.findIndex((p) => (p.id || p.product_id) === prodId);
                let updatedList;
                if (idx >= 0) {
                  updatedList = [...cached];
                  updatedList[idx] = { ...updatedList[idx], ...payload };
                } else {
                  updatedList = [payload, ...cached];
                }
                localCache.set(CACHE_KEYS.STOREFRONT_PRODUCTS(slug), updatedList);
              }

              callbacksRef.current.onProductMutated?.(payload);
              cacheEvents.emit(CACHE_EVENTS.STOREFRONT_MUTATED, { slug, payload });
              break;
            }

            case 'PRODUCT_DELETED': {
              const prodId = payload.product_id || payload.id;
              const cached = localCache.get(CACHE_KEYS.STOREFRONT_PRODUCTS(slug));
              if (Array.isArray(cached) && prodId) {
                const updatedList = cached.filter((p) => (p.id || p.product_id) !== prodId);
                localCache.set(CACHE_KEYS.STOREFRONT_PRODUCTS(slug), updatedList);
              }

              callbacksRef.current.onProductMutated?.(payload);
              cacheEvents.emit(CACHE_EVENTS.STOREFRONT_MUTATED, { slug, payload });
              break;
            }

            case 'STOCK_CHANGED': {
              const prodId = payload.product_id || payload.id;
              if (!prodId) break;

              if (payload.stock !== undefined && payload.stock !== null) {
                const newStock = Number(payload.stock);

                const cached = localCache.get(CACHE_KEYS.STOREFRONT_PRODUCTS(slug));
                if (Array.isArray(cached)) {
                  const idx = cached.findIndex((p) => (p.id || p.product_id) === prodId);
                  if (idx >= 0) {
                    const updatedList = [...cached];
                    updatedList[idx] = {
                      ...updatedList[idx],
                      stock_quantity: newStock,
                      available_quantity: newStock,
                    };
                    localCache.set(CACHE_KEYS.STOREFRONT_PRODUCTS(slug), updatedList);
                  }
                }

                callbacksRef.current.onStockChanged?.({ ...payload, stock: newStock });
                cacheEvents.emit(CACHE_EVENTS.STOREFRONT_MUTATED, { slug, payload });
              } else {
                // If stock number is omitted, trigger SWR background revalidation instead of resetting to 0
                cacheEvents.emit(CACHE_EVENTS.STOREFRONT_MUTATED, { slug, payload });
              }
              break;
            }

            case 'SHOP_STATUS_CHANGED': {
              const cachedShop = localCache.get(CACHE_KEYS.STOREFRONT(slug));
              if (cachedShop && typeof cachedShop === 'object') {
                const updatedShop = { ...cachedShop, ...payload };
                localCache.set(CACHE_KEYS.STOREFRONT(slug), updatedShop);
              }

              callbacksRef.current.onShopStatusChanged?.(payload);
              cacheEvents.emit(CACHE_EVENTS.STOREFRONT_MUTATED, { slug, payload });
              break;
            }

            case 'OFFER_MUTATED': {
              callbacksRef.current.onOfferMutated?.(payload);
              cacheEvents.emit('OFFER_MUTATED', { slug, payload });
              break;
            }

            default:
              break;
          }
        } catch (e) {
          console.warn('[useRealtimeStorefront] Error parsing message:', e);
        }
      };

      ws.onerror = () => {
        if (isUnmountedRef.current) return;
        setIsConnected(false);
      };

      ws.onclose = () => {
        if (isUnmountedRef.current) return;
        setIsConnected(false);

        // Exponential backoff reconnect
        reconnectAttemptsRef.current += 1;
        const delay = Math.min(30000, reconnectAttemptsRef.current * 3000);
        reconnectTimerRef.current = setTimeout(() => {
          if (!isUnmountedRef.current) {
            connect();
          }
        }, delay);
      };
    } catch (err) {
      console.warn('[useRealtimeStorefront] Connection failed:', err);
      setIsConnected(false);
    }
  }, [slug, cleanup]);

  useEffect(() => {
    isUnmountedRef.current = false;
    connect();

    return () => {
      isUnmountedRef.current = true;
      cleanup();
    };
  }, [connect, cleanup]);

  return { isConnected };
};

export default useRealtimeStorefront;
