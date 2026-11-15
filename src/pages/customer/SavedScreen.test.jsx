import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '../../context/ThemeContext';
import { CartProvider } from '../../context/CartContext';
import { SavedProvider } from '../../context/SavedContext';
import { LanguageProvider } from '../../context/LanguageContext';
import { AuthProvider } from '../../context/AuthContext';
import { LocationProvider } from '../../context/LocationContext';
import { SavedScreen } from './SavedScreen';

const renderSavedScreen = () => {
  return render(
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <LocationProvider>
            <SavedProvider>
              <CartProvider>
                <MemoryRouter initialEntries={['/saved']}>
                  <Routes>
                    <Route path="/saved" element={<SavedScreen />} />
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

describe('SavedScreen Unit Tests', () => {
  it('renders tab switcher and empty state for products by default', () => {
    renderSavedScreen();

    // Check tab headings
    expect(screen.getByRole('tab', { name: /Saved Products|सहेजे गए सामान/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Favorite Shops|पसंदीदा दुकानें/i })).toBeInTheDocument();

    // Check empty state action button
    expect(screen.getByRole('button', { name: /Explore Products|सामान खोजें/i })).toBeInTheDocument();
  });

  it('switches to shops tab and shows empty state for shops', () => {
    renderSavedScreen();

    const shopsTab = screen.getByRole('tab', { name: /Favorite Shops|पसंदीदा दुकानें/i });
    fireEvent.click(shopsTab);

    expect(screen.getByRole('button', { name: /Explore Stores|दुकानें देखें/i })).toBeInTheDocument();
  });
});
