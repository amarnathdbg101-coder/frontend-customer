import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Specification-compliant Mock LocalStorage Proxy
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};

  return new Proxy(
    {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = String(value);
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      key: (index: number) => Object.keys(store)[index] ?? null,
      get length() {
        return Object.keys(store).length;
      },
    },
    {
      get(target, prop: string | symbol) {
        if (prop in target) {
          return (target as any)[prop];
        }
        if (typeof prop === 'string') {
          return store[prop] ?? null;
        }
        return undefined;
      },
      set(target, prop: string | symbol, value: any) {
        if (typeof prop === 'string' && !(prop in target)) {
          store[prop] = String(value);
          return true;
        }
        return Reflect.set(target, prop, value);
      },
      deleteProperty(target, prop: string | symbol) {
        if (typeof prop === 'string') {
          delete store[prop];
          return true;
        }
        return false;
      },
      ownKeys() {
        return Object.keys(store);
      },
      getOwnPropertyDescriptor(target, prop) {
        if (typeof prop === 'string' && prop in store) {
          return {
            enumerable: true,
            configurable: true,
            writable: true,
            value: store[prop],
          };
        }
        return Reflect.getOwnPropertyDescriptor(target, prop);
      },
    }
  );
};

Object.defineProperty(window, 'localStorage', {
  value: createLocalStorageMock(),
  writable: true,
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: () => {},
  writable: true,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
