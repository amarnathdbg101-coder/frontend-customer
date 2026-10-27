import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { ProductCard } from './ProductCard';

describe('Hyperlocal ProductCard Component Tests', () => {
  const mockProduct = {
    id: 'prod_101',
    name: 'Parachute Coconut Oil 500ml',
    price: 115,
    compare_price: 125,
    available_quantity: 12,
    images: ['https://images.unsplash.com/photo-coconut-oil.jpg'],
    shop_name: 'Gupta Store',
    is_verified: true,
    distance_text: '450m away',
  };

  it('renders all 6 layers of hyperlocal hierarchy correctly', () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>
    );

    // 1. Availability Row: Green Dot + "Available Now"
    expect(screen.getByText(/Available Now/i)).toBeInTheDocument();

    // 2. Product Name: Maximum 2 lines
    expect(screen.getByText('Parachute Coconut Oil 500ml')).toBeInTheDocument();

    // 3. Price Section: ₹115 bold, ₹125 struck-through, Save ₹10
    expect(screen.getByText('₹115')).toBeInTheDocument();
    expect(screen.getByText('₹125')).toBeInTheDocument();
    expect(screen.getByText(/Save ₹10/i)).toBeInTheDocument();

    // 4. Local Store Info: Gupta Store, verified checkmark, 450m away
    expect(screen.getByText('Gupta Store')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(screen.getByText('450m away')).toBeInTheDocument();

    // 5. Actions: Secondary [ Compare Prices ] & Primary [ Reserve ]
    expect(screen.getByRole('button', { name: /Compare prices/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reserve/i })).toBeInTheDocument();
  });

  it('handles Primary CTA [ Reserve ] click', () => {
    const handleReserve = vi.fn();
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} onReserve={handleReserve} />
      </MemoryRouter>
    );

    const reserveBtn = screen.getByRole('button', { name: /Reserve Parachute Coconut Oil 500ml/i });
    fireEvent.click(reserveBtn);

    expect(handleReserve).toHaveBeenCalledTimes(1);
    expect(handleReserve).toHaveBeenCalledWith(mockProduct);
  });

  it('handles Secondary CTA [ Compare Prices ] click', () => {
    const handleCompare = vi.fn();
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} onCompare={handleCompare} />
      </MemoryRouter>
    );

    const compareBtn = screen.getByRole('button', { name: /Compare prices for Parachute Coconut Oil 500ml/i });
    fireEvent.click(compareBtn);

    expect(handleCompare).toHaveBeenCalledTimes(1);
    expect(handleCompare).toHaveBeenCalledWith(mockProduct);
  });

  it('handles Wishlist heart toggle click', () => {
    const handleToggleSave = vi.fn();
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} isSaved={false} onToggleSave={handleToggleSave} />
      </MemoryRouter>
    );

    const wishlistBtn = screen.getByLabelText(/Save to wishlist/i);
    fireEvent.click(wishlistBtn);

    expect(handleToggleSave).toHaveBeenCalledTimes(1);
    expect(handleToggleSave).toHaveBeenCalledWith(mockProduct);
  });

  it('disables Reserve button and shows Out of Stock when quantity is 0', () => {
    const outOfStockProduct = {
      ...mockProduct,
      available_quantity: 0,
      stock: 0,
      is_available: false,
    };

    render(
      <MemoryRouter>
        <ProductCard product={outOfStockProduct} />
      </MemoryRouter>
    );

    expect(screen.getAllByText(/Out of Stock/i).length).toBeGreaterThanOrEqual(1);
    const reserveBtn = screen.getByRole('button', { name: /Reserve/i });
    expect(reserveBtn).toBeDisabled();
  });
});
