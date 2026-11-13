import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '../../context/CartContext';
import { LanguageProvider } from '../../context/LanguageContext';
import { AuthProvider } from '../../context/AuthContext';
import { LocationProvider } from '../../context/LocationContext';
import { ProductTrustDetailView } from './ProductTrustDetailView';

const mockProduct = {
  id: 'prod-trust-1',
  name: 'Tata Salt Vacuum Evaporated 1kg',
  price: 28,
  compare_price: 32,
  stock_quantity: 25,
  brand: 'Tata',
  category: 'Groceries',
  images: [
    'https://example.com/tata-salt-1.jpg',
    'https://example.com/tata-salt-2.jpg',
  ],
  description: 'Pure vacuum evaporated iodized salt for everyday kitchen seasoning.',
  shop_name: 'Gupta General Store',
  is_shop_verified: true,
  inventory_updated_text: 'Updated today',
  shop_slug: 'gupta-general-store',
  shop_phone: '9876543210',
};

const mockShop = {
  id: 'shop-1',
  name: 'Gupta General Store',
  slug: 'gupta-general-store',
  phone: '9876543210',
  latitude: 28.6139,
  longitude: 77.209,
  is_verified: true,
  accepts_reservations: true,
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

describe('ProductTrustDetailView Component Tests', () => {
  it('renders all 6 core trust, comparison and reservation sections', () => {
    renderWithProviders(
      <ProductTrustDetailView
        product={mockProduct}
        shop={mockShop}
        onReserve={vi.fn()}
      />
    );

    // 1. Product Gallery & Availability badge
    expect(screen.getAllByText(/(Available Now|उपलब्ध है)/i).length).toBeGreaterThan(0);

    // 2. Product Information
    expect(screen.getByText('Tata Salt Vacuum Evaporated 1kg')).toBeDefined();
    expect(screen.getAllByText('₹28').length).toBeGreaterThan(0);
    expect(screen.getAllByText('₹32').length).toBeGreaterThan(0);
    expect(screen.getByText(/(Save ₹4|बचत ₹4)/i)).toBeDefined();

    // 3. Shop Profile Link & Reserve Action
    expect(screen.getAllByText(/Gupta General Store/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/(View Store|दुकान देखें)/i).length).toBeGreaterThan(0);

    // 5. Why Trust This Listing
    expect(screen.getByText(/(Why Trust This Listing|इस लिस्टिंग पर भरोसा क्यों करें)/i)).toBeDefined();
    expect(screen.getByText(/Verified shop|सत्यापित दुकान/i)).toBeDefined();
    expect(screen.getByText(/Stock update time|स्टॉक अपडेट का समय/i)).toBeDefined();
    expect(screen.getByText(/Stock quantity provided|स्टॉक की मात्रा दी गई है/i)).toBeDefined();
    expect(screen.getByText(/Pay at pickup|पिकअप पर भुगतान/i)).toBeDefined();

    // 6. Primary Reserve CTA
    expect(screen.getAllByRole('button', { name: /Reserve for pickup|दुकान से पिकअप रिज़र्व करें/i }).length).toBeGreaterThan(0);
  });

  it('opens reservation modal on clicking Reserve Now', () => {
    renderWithProviders(
      <ProductTrustDetailView
        product={mockProduct}
        shop={mockShop}
        onReserve={vi.fn()}
      />
    );

    const reserveButtons = screen.getAllByRole('button', { name: /Reserve for pickup|दुकान से पिकअप रिज़र्व करें/i });
    fireEvent.click(reserveButtons[0]);

    // Reservation modal should be visible
    expect(screen.getByText(/(Reserve for Store Pickup|काउंटर पिकअप रिज़र्व करें)/i)).toBeDefined();
    expect(screen.getByText(/(Pay only at pickup|भुगतान दुकान पर करें)/i)).toBeDefined();
  });

  it('does not show a zero price or unsupported trust claims when product data is missing', () => {
    renderWithProviders(
      <ProductTrustDetailView
        product={{
          ...mockProduct,
          price: 0,
          stock_quantity: undefined,
          is_available: undefined,
          is_price_public: false,
          is_shop_verified: false,
          inventory_updated_text: '',
        }}
        shop={{ ...mockShop, is_verified: false }}
      />
    );

    expect(screen.getByText(/Ask the shop for price|दुकान से दाम पूछें/i)).toBeDefined();
    expect(screen.queryByText('₹0')).toBeNull();
    expect(screen.queryByText(/Verified shop|सत्यापित दुकान/i)).toBeNull();
    expect(screen.queryByText(/Stock quantity provided|स्टॉक की मात्रा दी गई है/i)).toBeNull();
  });
});
