import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ShopProfileHeader } from './ShopProfileHeader';

describe('ShopProfileHeader Component Tests', () => {
  const mockShop = {
    id: 'shop_1',
    name: 'Gupta General Store',
    category: 'Groceries & Daily Essentials',
    is_verified: true,
    is_currently_open: true,
    closing_time: '10:00 PM',
    distance_text: '450m Away',
    rating: 4.8,
    reviews_count: 142,
    products_count: 128,
    inventory_updated_text: 'Inventory Updated 15 mins ago',
    phone: '+919876543210',
    address: 'Civil Lines Road, Near Subhash Chowk',
    city: 'Prayagraj',
    latitude: 26.1542,
    longitude: 85.8918,
    description: 'Trusted neighborhood grocery store serving authentic staples and daily essentials for over 15 years.',
  };

  it('renders all 6 layers of shop profile and trust hierarchy correctly', () => {
    const handleBrowse = vi.fn();
    render(
      <ShopProfileHeader
        shop={mockShop}
        productsCount={128}
        onBrowseProducts={handleBrowse}
      />
    );

    // 1. Shop Header (Name, Store Type, Verified Badge)
    expect(screen.getByText('Gupta General Store')).toBeInTheDocument();
    expect(screen.getByText('Groceries & Daily Essentials')).toBeInTheDocument();
    expect(screen.getAllByText(/(Verified|सत्यापित)/i).length).toBeGreaterThan(0);

    // 2. Trust Information (Distance, Open, Rating, Products, Inventory Freshness)
    expect(screen.getByText('450m Away')).toBeInTheDocument();
    expect(screen.getByText(/Open Now/i)).toBeInTheDocument();
    expect(screen.getAllByText(/4.8/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/128 Products/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Deals/i)).toBeInTheDocument();

    // 3. Quick Actions
    const browseBtn = screen.getByRole('button', { name: /Browse Products/i });
    expect(browseBtn).toBeInTheDocument();
    fireEvent.click(browseBtn);
    expect(handleBrowse).toHaveBeenCalledTimes(1);

    const callLink = screen.getByRole('link', { name: /Call Shop/i });
    expect(callLink).toHaveAttribute('href', 'tel:+919876543210');

    const directionsLink = screen.getByRole('link', { name: /Get Directions/i });
    expect(directionsLink).toHaveAttribute('href', expect.stringContaining('google.com/maps'));

    // 4. About Shop
    expect(screen.getByText(/About Shop/i)).toBeInTheDocument();
    expect(screen.getByText(/Trusted neighborhood grocery store/i)).toBeInTheDocument();
    expect(screen.getByText(/Civil Lines Road/i)).toBeInTheDocument();

    // 5. Why Trust This Shop
    expect(screen.getByText(/Why Trust This Shop/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified Local Business/i)).toBeInTheDocument();
    expect(screen.getByText(/Inventory Regularly Updated/i)).toBeInTheDocument();
    expect(screen.getByText(/Pickup Available/i)).toBeInTheDocument();
    expect(screen.getByText(/Active On ShopSilo/i)).toBeInTheDocument();
  });
});
