/**
 * Shared Safe LocalStorage Helper
 */

export const storage = {
  get: <T = any>(key: string, fallback: T | null = null): T | null => {
    if (typeof window === 'undefined') return fallback;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },

  set: <T = any>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving to storage key ${key}:`, e);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing storage key ${key}:`, e);
    }
  },
};
