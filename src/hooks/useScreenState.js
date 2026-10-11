/**
 * useScreenState - Universal Screen State & Scroll Restoration Hook
 * 
 * Automatically preserves:
 * 1. Exact vertical scroll position across screen navigations.
 * 2. Active tab, category filters, and search inputs in sessionStorage.
 * 3. Restores position smoothly on re-mount without jarring jumping.
 */

import { useEffect, useRef, useCallback } from 'react';
import { sessionState } from '../utils/sessionState';

export function useScreenState(screenKey, options = {}) {
  const { restoreScroll = true, isDataReady = true } = options;
  const scrollTimeoutRef = useRef(null);
  const hasRestoredRef = useRef(false);

  // 1. Scroll tracking with debouncing
  useEffect(() => {
    if (!restoreScroll || !screenKey) return;

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        sessionState.saveScroll(screenKey, window.scrollY);
      }, 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      // Save exact scroll position on unmount immediately
      sessionState.saveScroll(screenKey, window.scrollY);
    };
  }, [screenKey, restoreScroll]);

  // 2. Restore scroll once data is ready
  useEffect(() => {
    if (!restoreScroll || !screenKey || !isDataReady || hasRestoredRef.current) return;

    const savedScroll = sessionState.getScroll(screenKey);
    if (savedScroll > 0) {
      // Use requestAnimationFrame to ensure DOM is painted
      requestAnimationFrame(() => {
        window.scrollTo({
          top: savedScroll,
          behavior: 'instant',
        });
        hasRestoredRef.current = true;
      });
    } else {
      hasRestoredRef.current = true;
    }
  }, [screenKey, restoreScroll, isDataReady]);

  // 3. Screen State Get / Save helpers
  const getPersistedState = useCallback(
    (fallback = {}) => {
      return sessionState.getScreenState(screenKey, fallback);
    },
    [screenKey]
  );

  const persistState = useCallback(
    (data) => {
      sessionState.saveScreenState(screenKey, data);
    },
    [screenKey]
  );

  return {
    getPersistedState,
    persistState,
  };
}
