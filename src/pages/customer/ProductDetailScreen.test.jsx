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
import { ProductDetailScreen } from './ProductDetailScreen';
import { productApi } from '../../api/product.api';
import { shopApi } from '../../api/shop.api';

const AllTestProviders = ({ children, initialEntries = ['/'] }) => (
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

vi.mock('../../api/product.api', () => ({
  productApi: {
    getById: vi.fn(),
    getBySlug: vi.fn(),
    listByShopSlug: vi.fn(),
    listProducts: vi.fn(),
  },
}));

vi.mock('../../api/shop.api', () => ({
  shopApi: {
    getShopBySlug: vi.fn(),
    listPublicShops: vi.fn(),
  },
}));

const mockProduct = {
  id: 'prod-101',
  name: 'Clinic Plus Strong & Long Shampoo 340ml',
  price: 185,
  compare_price: 215,
  stock_quantity: 15,
  brand: 'Clinic Plus',
  category_name: 'Hair Care',
  images: ['/images/products/shop-1/clinic-plus.jpg'],
  description: 'Milk protein formula for stronger hair.',
  shop_id: 'shop-1',
  shop_name: 'Om Kirana Store',
  shop_slug: 'om-kirana-store',
};

const mockShop = {
  id: 'shop-1',
  name: 'Om Kirana Store',
  slug: 'om-kirana-store',
  phone: '7979014637',
  address: 'Dhoi, Darbhanga',
  latitude: 26.1515,
  longitude: 85.9668,
  is_open: true,
};

const mockSimilarProducts = [
  {
    id: 'prod-102',
    name: 'Dove Daily Shine Shampoo 340ml',
    price: 195,
    compare_price: 230,
    stock_quantity: 8,
    images: ['/images/products/shop-1/dove.jpg'],
    shop_id: 'shop-1',
    shop_name: 'Om Kirana Store',
    shop_slug: 'om-kirana-store',
  },
  {
    id: 'prod-103',
    name: 'Head & Shoulders Anti-Dandruff 340ml',
    price: 210,
    compare_price: 240,
    stock_quantity: 12,
    images: ['/images/products/shop-1/head-shoulders.jpg'],
    shop_id: 'shop-1',
    shop_name: 'Om Kirana Store',
    shop_slug: 'om-kirana-store',
  },
];

describe('ProductDetailScreen Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders product details and similar products carousel successfully', async () => {
    productApi.getById.mockResolvedValueOnce(mockProduct);
    shopApi.getShopBySlug.mockResolvedValueOnce(mockShop);
    productApi.listByShopSlug.mockResolvedValueOnce({
      products: [mockProduct, ...mockSimilarProducts],
      total_count: 3,
    });

    render(
      <AllTestProviders initialEntries={['/shop/om-kirana-store/product/prod-101']}>
        <Routes>
          <Route path="/shop/:slug/product/:productId" element={<ProductDetailScreen />} />
        </Routes>
      </AllTestProviders>
    );

    // Verify main product name rendered
    await waitFor(() => {
      expect(screen.getAllByText(/Clinic Plus Strong & Long Shampoo/i).length).toBeGreaterThan(0);
    });

    // Verify similar products section rendered
    await waitFor(() => {
      expect(screen.getByText(/मिलते-जुलते सामान|Similar Products/i)).toBeInTheDocument();
      expect(screen.getByText(/Dove Daily Shine Shampoo/i)).toBeInTheDocument();
      expect(screen.getByText(/Head & Shoulders Anti-Dandruff/i)).toBeInTheDocument();
    });
  });

  it('falls back to global catalog when shop has no other products', async () => {
    productApi.getById.mockResolvedValueOnce(mockProduct);
    shopApi.getShopBySlug.mockResolvedValueOnce(mockShop);
    // Shop only has the 1 item itself
    productApi.listByShopSlug.mockResolvedValueOnce({
      products: [mockProduct],
      total_count: 1,
    });
    // Fallback catalog query returns recommendations
    productApi.listProducts.mockResolvedValueOnce({
      products: mockSimilarProducts,
      total_count: 2,
    });

    render(
      <AllTestProviders initialEntries={['/product/prod-101']}>
        <Routes>
          <Route path="/product/:productId" element={<ProductDetailScreen />} />
        </Routes>
      </AllTestProviders>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Clinic Plus Strong & Long Shampoo/i).length).toBeGreaterThan(0);
    });

    await waitFor(() => {
      expect(screen.getByText(/Dove Daily Shine Shampoo/i)).toBeInTheDocument();
    });
  });

  it('displays not available state if product cannot be found', async () => {
    productApi.getById.mockRejectedValueOnce(new Error('Product not found'));

    render(
      <AllTestProviders initialEntries={['/product/invalid-id']}>
        <Routes>
          <Route path="/product/:productId" element={<ProductDetailScreen />} />
        </Routes>
      </AllTestProviders>
    );

    await waitFor(() => {
      expect(screen.getByText(/उत्पाद उपलब्ध नहीं है|Product Not Available/i)).toBeInTheDocument();
    });
  });
});
