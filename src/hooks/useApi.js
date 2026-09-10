/**
 * useApi Hook
 * 
 * Custom hook for API calls with automatic loading, error, and data states.
 * Supports manual trigger, abort on unmount, and refetch.
 * 
 * Usage:
 *   const { data, loading, error, refetch } = useApi(
 *     () => shopApi.listPublicShops(params),
 *     [params.lat, params.lng, params.radius_km]
 *   );
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export const useApi = (apiFunction, deps = [], { immediate = true } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const mountedRef = useRef(true);

  const execute = useCallback(async (...args) => {
    // Cancel previous in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      if (mountedRef.current && !controller.signal.aborted) {
        setData(result);
      }
      return result;
    } catch (err) {
      if (mountedRef.current && !controller.signal.aborted) {
        setError(err);
      }
      return null;
    } finally {
      if (mountedRef.current && !controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [apiFunction]);

  useEffect(() => {
    mountedRef.current = true;
    if (immediate) {
      execute();
    }
    return () => {
      mountedRef.current = false;
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: execute };
};
