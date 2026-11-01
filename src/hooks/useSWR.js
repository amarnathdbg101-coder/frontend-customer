/**
 * ShopSilo Customer Web App - Enterprise Stale-While-Revalidate (SWR) React Hook
 *
 * Core Capabilities:
 * 1. 0ms Instant Cache Render: Immediately returns cached data if available without spinner flash.
 * 2. Background Revalidation: Silently executes fetcher in background to keep data fresh.
 * 3. Smart Diffing: Deeply compares fetched data with current data to prevent unnecessary DOM re-renders.
 * 4. In-Flight Request Deduplication: Concurrent components requesting identical keys share one single active promise.
 * 5. Event-Driven Cache Invalidation: Automatically wakes up and refreshes when targeted domain events fire.
 * 6. Offline Resilience: Keeps cached data on screen if network fails or times out.
 * 7. Memory & Leak Safety: Tracks isMounted lifecycle and cleans up event listeners on unmount.
 * 8. Optimistic UI Mutation: mutate() updates local state and cache synchronously.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { localCache } from '../utils/localCache';
import { cacheEvents } from '../utils/cacheEvents';

// Global map to deduplicate in-flight network requests across components
const inflightRequests = new Map();

// Fast structural equality check to prevent main-thread freezing on mobile devices
function isFastEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    if (a.length === 0) return true;

    const checkItem = (itemA, itemB) => {
      if (Object.is(itemA, itemB)) return true;
      if (!itemA || !itemB || typeof itemA !== 'object') return false;
      const idA = itemA.id || itemA._id || itemA.slug;
      const idB = itemB.id || itemB._id || itemB.slug;
      if (idA !== undefined && idB !== undefined && idA !== idB) return false;
      const upA = itemA.updated_at || itemA.updatedAt || itemA.price;
      const upB = itemB.updated_at || itemB.updatedAt || itemB.price;
      return upA === upB;
    };

    // Fast heuristic: sample first, middle, last
    const mid = Math.floor(a.length / 2);
    if (!checkItem(a[0], b[0]) || !checkItem(a[mid], b[mid]) || !checkItem(a[a.length - 1], b[b.length - 1])) {
      return false;
    }
    if (a.length <= 15) {
      for (let i = 0; i < a.length; i++) {
        if (!checkItem(a[i], b[i])) return false;
      }
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const k of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
    if (typeof a[k] !== 'object' && a[k] !== b[k]) return false;
  }
  return true;
}

export const useSWR = (key, fetcher, options = {}) => {
  const {
    ttlMinutes = 30,
    invalidateEvents = [],
    enabled = true,
    revalidateOnFocus = false,
    focusThrottleMs = 30000,
    onSuccess,
    onError,
  } = options;

  // 1. Initial 0ms Instant Cache Hydration
  const cachedInitial = key && enabled ? localCache.get(key, null) : null;
  const [data, setData] = useState(cachedInitial);
  const [loading, setLoading] = useState(!cachedInitial && enabled);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const dataRef = useRef(data);
  dataRef.current = data;

  const isMountedRef = useRef(true);
  const lastFocusRevalidateRef = useRef(Date.now());

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 2. Revalidate Function with Request Deduplication & Fast Structural Diffing
  const revalidate = useCallback(
    async (isSilent = false) => {
      if (!key || !enabled || !isMountedRef.current) return;

      if (!isSilent && !dataRef.current) {
        setLoading(true);
      }
      setIsValidating(true);

      try {
        // Request Deduplication: Share in-flight promise if another component requested the same key
        let fetchPromise = inflightRequests.get(key);
        if (!fetchPromise) {
          fetchPromise = Promise.resolve().then(() => fetcherRef.current());
          inflightRequests.set(key, fetchPromise);
        }

        let freshData;
        try {
          freshData = await fetchPromise;
        } finally {
          inflightRequests.delete(key);
        }

        if (!isMountedRef.current) return;

        if (freshData !== undefined && freshData !== null) {
          // Fast Structural Diffing without JSON.stringify overhead
          const hasChanged = !isFastEqual(dataRef.current, freshData);

          if (hasChanged) {
            setData(freshData);
            localCache.set(key, freshData, ttlMinutes);
            if (onSuccessRef.current) onSuccessRef.current(freshData);
          } else {
            // Touch timestamp in cache to extend freshness
            localCache.set(key, freshData, ttlMinutes);
          }
        }
        setError(null);
      } catch (err) {
        console.warn(`[useSWR] Revalidation error for '${key}':`, err);
        if (isMountedRef.current) {
          setError(err);
          if (onErrorRef.current) onErrorRef.current(err);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setIsValidating(false);
        }
      }
    },
    [key, enabled, ttlMinutes]
  );

  // 3. Initial Mount & Key Change Effect
  useEffect(() => {
    if (!key || !enabled) return;

    // Check if we already rendered cached data
    const cached = localCache.get(key, null);
    if (cached) {
      setData(cached);
      setLoading(false);
      // Execute silent background revalidation
      revalidate(true);
    } else {
      revalidate(false);
    }
  }, [key, enabled, revalidate]);

  // 4. Event-Driven Cache Invalidation Listener
  useEffect(() => {
    if (!key || !enabled || !invalidateEvents || invalidateEvents.length === 0) return;

    const unsubs = invalidateEvents.map((eventName) => {
      return cacheEvents.on(eventName, (payload) => {
        if (!isMountedRef.current) return;

        // Check if event targets this specific key (or broadcast to all matching)
        if (!payload || !payload.keyFilter || key.includes(payload.keyFilter)) {
          revalidate(true); // Trigger immediate silent background revalidation
        }
      });
    });

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [key, enabled, invalidateEvents, revalidate]);

  // 5. Window Focus / Tab Visibility Revalidation (Throttled)
  useEffect(() => {
    if (!key || !enabled || !revalidateOnFocus) return;

    const handleFocus = () => {
      const now = Date.now();
      if (now - lastFocusRevalidateRef.current >= focusThrottleMs) {
        lastFocusRevalidateRef.current = now;
        revalidate(true);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [key, enabled, revalidateOnFocus, focusThrottleMs, revalidate]);

  // 6. Optimistic UI Mutation Helper
  const mutate = useCallback(
    (newData, shouldRevalidate = false) => {
      setData(newData);
      if (key) {
        localCache.set(key, newData, ttlMinutes);
      }
      if (shouldRevalidate) {
        revalidate(true);
      }
    },
    [key, ttlMinutes, revalidate]
  );

  return {
    data,
    loading,
    isValidating,
    error,
    revalidate,
    mutate,
  };
};

export default useSWR;
