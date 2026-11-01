import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ShopCard } from './ShopCard';

describe('ShopCard Component Tests', () => {
  const baseShop = {
    id: 'shop_001',
    name: 'Sharma Kirana Store',
    slug: 'sharma-kirana',
    category: 'Grocery & Spices',
    latitude: 28.6139,
    longitude: 77.2090,
    distance_km: 1.2,
    phone: '9876543210',
    trust_score: 4.8,
    is_open: true,
    opening_time: '08:00',
    closing_time: '22:00',
  };

  it('renders store details, trust score, and PostGIS distance correctly', () => {
    render(<ShopCard shop={baseShop} coords={{ lat: 28.61, lng: 77.20 }} />);

    expect(screen.getByText('Sharma Kirana Store')).toBeInTheDocument();
    expect(screen.getByText('Grocery & Spices')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText(/1.2 km/i)).toBeInTheDocument();
    expect(screen.getByText('Storefront')).toBeInTheDocument();
  });

  it('renders correct badges for different timing state machine statuses', () => {
    // 1. OPEN status
    const { rerender } = render(
      <ShopCard shop={{ ...baseShop, live_status: 'OPEN' }} />
    );
    expect(screen.getByText('OPEN NOW')).toBeInTheDocument();

    // 2. CLOSING_SOON status
    rerender(
      <ShopCard shop={{ ...baseShop, live_status: 'CLOSING_SOON', status_message: 'Closes in 25m' }} />
    );
    expect(screen.getByText('CLOSING SOON')).toBeInTheDocument();
    expect(screen.getByText('Closes in 25m')).toBeInTheDocument();

    // 3. WEEKLY_OFF status
    rerender(
      <ShopCard shop={{ ...baseShop, live_status: 'WEEKLY_OFF', status_message: 'Weekly off today' }} />
    );
    expect(screen.getByText('WEEKLY OFF')).toBeInTheDocument();
    expect(screen.getByText('Weekly off today')).toBeInTheDocument();

    // 4. CLOSED status
    rerender(
      <ShopCard shop={{ ...baseShop, live_status: 'CLOSED' }} />
    );
    expect(screen.getByText('CLOSED')).toBeInTheDocument();
  });

  it('renders WhatsApp direct chat and Google Maps navigation links', () => {
    render(<ShopCard shop={baseShop} />);

    const chatLink = screen.getByTitle('WhatsApp');
    expect(chatLink).toBeInTheDocument();
    expect(chatLink.getAttribute('href')).toContain('https://wa.me/919876543210');

    const mapsLink = screen.getByTitle('Directions');
    expect(mapsLink).toBeInTheDocument();
    expect(mapsLink.getAttribute('href')).toContain('google.com/maps');
  });

  it('triggers onNavigate when storefront button is clicked', () => {
    const onNavigate = vi.fn();
    render(<ShopCard shop={baseShop} onNavigate={onNavigate} />);

    const button = screen.getByRole('button', { name: /storefront/i });
    fireEvent.click(button);
    expect(onNavigate).toHaveBeenCalledWith('/shop/sharma-kirana');
  });
});

