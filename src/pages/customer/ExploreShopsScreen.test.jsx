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
import { ExploreShopsScreen } from './ExploreShopsScreen';

vi.mock('../../api/product.api', () => ({
  productApi: {
    getById: vi.fn(),
    listProducts: vi.fn().mockResolvedValue({ products: [], total_count: 0 }),
    findNearbyProducts: vi.fn().mockResolvedValue({ products: [], total_count: 0 }),
    getSearchSuggestions: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../api/shop.api', () => ({
  shopApi: {
    listPublicShops: vi.fn().mockResolvedValue({ shops: [] }),
  },
}));

const renderExploreScreen = (initialEntries = ['/explore']) => {
  return render(
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <LocationProvider>
            <SavedProvider>
              <CartProvider>
                <MemoryRouter initialEntries={initialEntries}>
                  <Routes>
                    <Route path="/explore" element={<ExploreShopsScreen />} />
                  </Routes>
                </MemoryRouter>
              </CartProvider>
            </SavedProvider>
          </LocationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

describe('ExploreShopsScreen Unit & Mounting Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mounts cleanly without throwing TDZ or initialization errors', async () => {
    const { container } = renderExploreScreen(['/explore']);
    await waitFor(() => {
      expect(container).toBeTruthy();
    });
  });

  it('mounts with URL search query parameter ?q=biscuits without crashing', async () => {
    const { container } = renderExploreScreen(['/explore?q=biscuits']);
    await waitFor(() => {
      expect(container).toBeTruthy();
    });
  });
});
