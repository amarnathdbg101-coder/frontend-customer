import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '../../context/CartContext';
import { LanguageProvider } from '../../context/LanguageContext';
import { AuthProvider } from '../../context/AuthContext';
import { LocationProvider } from '../../context/LocationContext';
import { ProductStudioView } from './ProductStudioView';
import { ProductDetailModal } from '../common/ProductDetailModal';

const mockProduct = {
  id: 'prod-99',
  name: 'Amul Taaza Milk 1L',
  price: 54,
  compare_price: 60,
  stock_quantity: 12,
  brand: 'Amul',
  category: 'Dairy & Eggs',
  unit: '1 Litre',
  images: [
    'https://example.com/amul-1.jpg',
    'https://example.com/amul-2.jpg'
  ],
  description: 'Fresh toned pasteurized milk with 3.0% fat and 8.5% SNF.',
  shop_name: 'Sharma General Store',
  shop_slug: 'sharma-general-store',
  shop_phone: '9876543210',
};

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <LanguageProvider>
            <CartProvider>
              {ui}
            </CartProvider>
          </LanguageProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('ProductStudioView & ProductDetailModal Showcase Tests', () => {
  it('should render product name, brand, category, and pricing correctly', () => {
    renderWithProviders(
      <ProductStudioView product={mockProduct} />
    );

    expect(screen.getByText('Amul Taaza Milk 1L')).toBeDefined();
    expect(screen.getAllByText('Amul').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Dairy & Eggs').length).toBeGreaterThan(0);
    expect(screen.getByText('₹54')).toBeDefined();
    expect(screen.getByText('₹60')).toBeDefined();
    expect(screen.getAllByText(/10% OFF/i).length).toBeGreaterThan(0);
  });

  it('should render studio hero badges (discount and in-stock indicator)', () => {
    renderWithProviders(
      <ProductStudioView product={mockProduct} />
    );

    // Matches either English (12 In Stock) or Hindi (12 उपलब्ध)
    expect(screen.getByText(/12 (In Stock|उपलब्ध)/i)).toBeDefined();
    expect(screen.getByText(/1 \/ 2/i)).toBeDefined();
  });

  it('should render inside ProductDetailModal with modal backdrop and clean header', () => {
    const { container } = renderWithProviders(
      <ProductDetailModal product={mockProduct} onClose={() => {}} />
    );

    expect(container.querySelector('.modal-backdrop')).toBeDefined();
    expect(screen.getByText('Amul Taaza Milk 1L')).toBeDefined();
    expect(screen.getAllByText('Sharma General Store').length).toBeGreaterThan(0);
  });
});
