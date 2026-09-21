/**
 * Application Constants & Environment Config
 */

const rawApiUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
export const API_BASE_URL = rawApiUrl ? rawApiUrl.replace(/\/+$/, '') : 'https://api.shopsilo.in';

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '328255141048-v4r4fga1oas928b5imvh9jpbaemrc9a8.apps.googleusercontent.com';

export const STORAGE_KEYS = {
  TOKEN: 'shopsilo_token',
  USER: 'shopsilo_user',
  CART: 'shopsilo_cart',
  SAVED_SHOPS: 'shopsilo_saved_shops',
  SAVED_PRODUCTS: 'shopsilo_saved_products',
  THEME: 'shopsilo_theme',
  LANG: 'shopsilo_lang',
} as const;

export const DEFAULT_PAGE_LIMIT = 20;

export const DEFAULT_GEO_COORDS = {
  LATITUDE: 26.1542,
  LONGITUDE: 85.8918,
  CITY: 'Darbhanga',
} as const;
