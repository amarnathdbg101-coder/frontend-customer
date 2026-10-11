/**
 * ShopSilo Customer Web App - Universal Session & Navigation State Manager
 * 
 * Preserves user screen state, scroll offsets, active tabs, filters, and routes
 * within the browser session until the browser/tab is closed or logged out.
 * 
 * Guarantees that:
 * 1. Navigating to a new screen and returning restores the exact screen state & scroll offset.
 * 2. Reloading or resuming restores the active screen instead of dumping the user onto dashboard.
 * 3. Logging in redirects back to the screen the user was trying to access.
 */

const KEYS = {
  ACTIVE_ROUTE: 'shopsilo_customer_active_route',
  PREVIOUS_ROUTE: 'shopsilo_customer_prev_route',
  REDIRECT_AFTER_LOGIN: 'shopsilo_redirect_after_login',
  EXPLORE_STATE: 'shopsilo_state_explore',
  SCROLL_PREFIX: 'shopsilo_scroll_',
  SCREEN_STATE_PREFIX: 'shopsilo_state_',
};

const isAvailable = () => {
  try {
    return typeof window !== 'undefined' && !!window.sessionStorage;
  } catch {
    return false;
  }
};

export const sessionState = {
  // --- Route Tracking ---
  saveActiveRoute(route) {
    if (!isAvailable() || !route) return;
    // Don't track transient auth routes as the primary screen
    if (
      route.startsWith('/login') ||
      route.startsWith('/register') ||
      route.startsWith('/reset-password')
    ) {
      return;
    }

    try {
      const current = window.sessionStorage.getItem(KEYS.ACTIVE_ROUTE);
      if (current && current !== route) {
        window.sessionStorage.setItem(KEYS.PREVIOUS_ROUTE, current);
      }
      window.sessionStorage.setItem(KEYS.ACTIVE_ROUTE, route);
    } catch (e) {
      console.warn('[SessionState] Failed to save route:', e);
    }
  },

  getActiveRoute() {
    if (!isAvailable()) return null;
    try {
      return window.sessionStorage.getItem(KEYS.ACTIVE_ROUTE) || null;
    } catch {
      return null;
    }
  },

  getPreviousRoute() {
    if (!isAvailable()) return null;
    try {
      return window.sessionStorage.getItem(KEYS.PREVIOUS_ROUTE) || null;
    } catch {
      return null;
    }
  },

  clearActiveRoute() {
    if (!isAvailable()) return;
    try {
      window.sessionStorage.removeItem(KEYS.ACTIVE_ROUTE);
      window.sessionStorage.removeItem(KEYS.PREVIOUS_ROUTE);
    } catch {}
  },

  // --- Auth Redirect Preservation ---
  saveRedirectAfterLogin(route) {
    if (!isAvailable() || !route) return;
    try {
      window.sessionStorage.setItem(KEYS.REDIRECT_AFTER_LOGIN, route);
    } catch {}
  },

  getRedirectAfterLogin(clear = true) {
    if (!isAvailable()) return null;
    try {
      const val = window.sessionStorage.getItem(KEYS.REDIRECT_AFTER_LOGIN);
      if (val && clear) {
        window.sessionStorage.removeItem(KEYS.REDIRECT_AFTER_LOGIN);
      }
      return val;
    } catch {
      return null;
    }
  },

  // --- Screen State (Tabs, Filters, Search, Modals) ---
  saveScreenState(screenKey, data) {
    if (!isAvailable() || !screenKey) return;
    try {
      const key = `${KEYS.SCREEN_STATE_PREFIX}${screenKey}`;
      window.sessionStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`[SessionState] Failed to save screen state for ${screenKey}:`, e);
    }
  },

  getScreenState(screenKey, fallback = {}) {
    if (!isAvailable() || !screenKey) return fallback;
    try {
      const key = `${KEYS.SCREEN_STATE_PREFIX}${screenKey}`;
      const saved = window.sessionStorage.getItem(key);
      if (!saved) return fallback;
      const parsed = JSON.parse(saved);
      return { ...fallback, ...parsed };
    } catch {
      return fallback;
    }
  },

  clearScreenState(screenKey) {
    if (!isAvailable() || !screenKey) return;
    try {
      window.sessionStorage.removeItem(`${KEYS.SCREEN_STATE_PREFIX}${screenKey}`);
    } catch {}
  },

  // --- Scroll Position Preservation ---
  saveScroll(screenKey, scrollY) {
    if (!isAvailable() || !screenKey) return;
    try {
      const key = `${KEYS.SCROLL_PREFIX}${screenKey}`;
      window.sessionStorage.setItem(key, String(Math.max(0, Math.round(scrollY || 0))));
    } catch {}
  },

  getScroll(screenKey) {
    if (!isAvailable() || !screenKey) return 0;
    try {
      const key = `${KEYS.SCROLL_PREFIX}${screenKey}`;
      const saved = window.sessionStorage.getItem(key);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  },

  // --- Full Cleanup on Explicit Logout ---
  clearAll() {
    if (!isAvailable()) return;
    try {
      const keysToRemove = [];
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const k = window.sessionStorage.key(i);
        if (k && k.startsWith('shopsilo_')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => window.sessionStorage.removeItem(k));
    } catch {}
  },
};
