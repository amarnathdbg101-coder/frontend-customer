/**
 * Route Preloader & Instant Navigation Utility for ShopSilo Customer Web App
 *
 * Pre-fetches lazy-loaded page route chunks during idle time to achieve 0ms screen transitions.
 */

export const preloadAllCustomerRoutes = () => {
  if (typeof window === 'undefined') return;

  const preloader = () => {
    // Background pre-fetch of route JS chunks
    import('../pages/customer/ProductDetailScreen').catch(() => {});
    import('../pages/customer/StorefrontScreen').catch(() => {});
    import('../pages/customer/DealsScreen').catch(() => {});
    import('../pages/customer/SavedScreen').catch(() => {});
    import('../pages/customer/ReservationsScreen').catch(() => {});
    import('../pages/customer/CustomerKhataScreen').catch(() => {});
    import('../pages/customer/CustomerProfileScreen').catch(() => {});
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preloader, { timeout: 2500 });
  } else {
    setTimeout(preloader, 1000);
  }
};

/**
 * Pre-fetches a specific route chunk on hover or touch start
 */
export const preloadRouteOnHover = (routeName) => {
  switch (routeName) {
    case 'product':
      import('../pages/customer/ProductDetailScreen').catch(() => {});
      break;
    case 'shop':
      import('../pages/customer/StorefrontScreen').catch(() => {});
      break;
    case 'deals':
      import('../pages/customer/DealsScreen').catch(() => {});
      break;
    case 'reservations':
      import('../pages/customer/ReservationsScreen').catch(() => {});
      break;
    case 'khata':
      import('../pages/customer/CustomerKhataScreen').catch(() => {});
      break;
    case 'saved':
      import('../pages/customer/SavedScreen').catch(() => {});
      break;
    case 'profile':
      import('../pages/customer/CustomerProfileScreen').catch(() => {});
      break;
    default:
      break;
  }
};
