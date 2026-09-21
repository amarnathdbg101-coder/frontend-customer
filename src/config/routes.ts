/**
 * Application Typed Route Paths
 */

export const ROUTES = {
  HOME: '/',
  EXPLORE: '/explore',
  STOREFRONT: (slug: string = ':slug') => `/shop/${slug}`,
  DEALS: '/deals',
  KHATA: '/khata',
  RESERVATIONS: '/reservations',
  PROFILE: '/profile',
  LOGIN: '/login',
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password',
} as const;
