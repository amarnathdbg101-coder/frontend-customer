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

    // 3. Best Nearby Offer
    expect(screen.getAllByText(/(Best Price Nearby|पास में सर्वोत्तम मूल्य)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Gupta General Store/i).length).toBeGreaterThan(0);

    // 4. Compare Nearby Shops
    expect(screen.getByText(/(Compare Nearby Shops|पास की दुकानों की तुलना करें)/i)).toBeDefined();
    expect(screen.getByText(/Raj Store & Provisions/i)).toBeDefined();

    // 5. Why Trust This Listing
    expect(screen.getByText(/(Why Trust This Listing|इस लिस्टिंग पर भरोसा क्यों करें)/i)).toBeDefined();
    expect(screen.getByText(/(Verified Local Shop|वेरीफाइड लोकल दुकान)/i)).toBeDefined();
    expect(screen.getByText(/(Inventory Recently Updated|हाल ही में अपडेटेड इन्वेंटरी)/i)).toBeDefined();
    expect(screen.getByText(/(Pickup Available|पिकअप तुरंत उपलब्ध)/i)).toBeDefined();
    expect(screen.getByText(/(No Online Payment Required|कोई ऑनलाइन भुगतान ज़रूरी नहीं)/i)).toBeDefined();

    // 6. Sticky Bottom CTA
    expect(screen.getByRole('button', { name: /(Compare Prices|कीमत तुलना करें)/i })).toBeDefined();
    expect(screen.getAllByRole('button', { name: /(Reserve Now|अभी रिज़र्व करें)/i }).length).toBeGreaterThan(0);
  });

  it('opens reservation modal on clicking Reserve Now', () => {
    renderWithProviders(
      <ProductTrustDetailView
        product={mockProduct}
        shop={mockShop}
        onReserve={vi.fn()}
      />
    );

    const reserveButtons = screen.getAllByRole('button', { name: /(Reserve Now|अभी रिज़र्व करें)/i });
    fireEvent.click(reserveButtons[0]);

    // Reservation modal should be visible
    expect(screen.getByText(/(Reserve for Store Pickup|काउंटर पिकअप रिज़र्व करें)/i)).toBeDefined();
    expect(screen.getByText(/(Pay only at pickup|भुगतान दुकान पर करें)/i)).toBeDefined();
  });
});
