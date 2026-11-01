import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '../../context/ThemeContext';
import { CartProvider } from '../../context/CartContext';
import { SavedProvider } from '../../context/SavedContext';
import { LanguageProvider } from '../../context/LanguageContext';
import { AuthProvider } from '../../context/AuthContext';
import { LocationProvider } from '../../context/LocationContext';
import { StorefrontScreen } from './StorefrontScreen';
import { productApi } from '../../api/product.api';
import { shopApi } from '../../api/shop.api';
import { dealsApi } from '../../api/deals.api';

vi.mock('../../api/product.api', () => ({
  productApi: {
    listByShopSlug: vi.fn(),
    getSearchSuggestions: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../api/shop.api', () => ({
  shopApi: {
    getShopBySlug: vi.fn(),
    listPublicShops: vi.fn(),
    getShopReviews: vi.fn().mockResolvedValue([]),
    getShopOffers: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../api/deals.api', () => ({
  dealsApi: {
    getShopOffers: vi.fn().mockResolvedValue([]),
    listDeals: vi.fn().mockResolvedValue([]),
  },
}));

const mockShop = {
  id: 'shop-om-1',
  name: 'Om Clothes & Cosmetics',
  slug: 'om-clothes-cosmetics',
  category: 'General Store',
  phone: '7979014637',
  address: 'Dhoi, pipal chowk',
  city: 'Darbhanga',
  is_open: true,
  is_currently_open: true,
  is_active: true,
  opening_time: '07:00',
  closing_time: '21:00',
  logo_url: '/images/shops/logo.jpg',
  banners: ['/images/shops/banner.jpg'],
};

const mockProducts = [
  {
    id: 'prod-saree-1',
    name: 'Raj Paree Red & Gold Saree',
    price: 999,
    compare_price: 1499,
    stock_quantity: 10,
    category: 'Clothing & Apparel',
    category_name: 'Clothing & Apparel',
    images: ['/images/products/saree.jpg'],
    shop_id: 'shop-om-1',
    shop_name: 'Om Clothes & Cosmetics',
    shop_slug: 'om-clothes-cosmetics',
    is_active: true,
  },
  {
    id: 'prod-kit-2',
    name: 'RL Beauty Makeup Kit',
    price: 499,
    compare_price: 799,
    stock_quantity: 5,
    category: 'Personal Care',
    category_name: 'Personal Care',
    images: ['/images/products/makeup.jpg'],
    shop_id: 'shop-om-1',
    shop_name: 'Om Clothes & Cosmetics',
    shop_slug: 'om-clothes-cosmetics',
    is_active: true,
  },
];

const AllTestProviders = ({ children, initialEntries = ['/shop/om-clothes-cosmetics'] }) => (
  <ThemeProvider>
    <LanguageProvider>
      <AuthProvider>
        <LocationProvider>
          <SavedProvider>
            <CartProvider>
              <MemoryRouter initialEntries={initialEntries}>
                {children}
              </MemoryRouter>
            </CartProvider>
          </SavedProvider>
        </LocationProvider>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
);

describe('StorefrontScreen Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders shop information and live product catalog without local cache lock', async () => {
    shopApi.getShopBySlug.mockResolvedValueOnce(mockShop);
    productApi.listByShopSlug.mockResolvedValueOnce({
      products: mockProducts,
      total_count: 2,
    });

    render(
      <AllTestProviders initialEntries={['/shop/om-clothes-cosmetics']}>
        <Routes>
          <Route path="/shop/:slug" element={<StorefrontScreen />} />
        </Routes>
      </AllTestProviders>
    );

    // Verify shop name displayed in header / document
    await waitFor(() => {
      expect(screen.getAllByText(/Om Clothes & Cosmetics/i).length).toBeGreaterThan(0);
    });

    // Verify live catalog items displayed
    await waitFor(() => {
      expect(screen.getAllByText(/Raj Paree Red & Gold Saree/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/RL Beauty Makeup Kit/i).length).toBeGreaterThan(0);
    });
  });

  it('renders search input for inside-store isolated catalog search', async () => {
    shopApi.getShopBySlug.mockResolvedValueOnce(mockShop);
    productApi.listByShopSlug.mockResolvedValueOnce({
      products: mockProducts,
      total_count: 2,
    });

    render(
      <AllTestProviders initialEntries={['/shop/om-clothes-cosmetics']}>
        <Routes>
          <Route path="/shop/:slug" element={<StorefrontScreen />} />
        </Routes>
      </AllTestProviders>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/खोजें|Search/i)).toBeInTheDocument();
    });
  });
});
