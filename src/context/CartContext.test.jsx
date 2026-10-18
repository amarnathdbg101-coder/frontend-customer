import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CartProvider, useCart } from './CartContext';

const mockProductA = {
  id: 'prod-1',
  name: 'Amul Butter 500g',
  price: 275,
  compare_price: 300,
  stock_quantity: 5,
  shop_id: 'shop-101',
  shop_name: 'Gupta Kirana Store',
};

const mockProductB = {
  id: 'prod-2',
  name: 'Fortune Rice Bran Oil 1L',
  price: 160,
  compare_price: 180,
  stock_quantity: 10,
  shop_id: 'shop-101',
  shop_name: 'Gupta Kirana Store',
};

describe('CartContext Unit & Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

  it('should initialize with an empty cart and zero totals', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toEqual([]);
    expect(result.current.cartCount).toBe(0);
    expect(result.current.subtotal).toBe(0);
    expect(result.current.totalSavings).toBe(0);
    expect(result.current.finalTotal).toBe(0);
  });

  it('should add an item to the cart and calculate subtotal and savings correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(mockProductA, 2);
    });

    expect(result.current.items.length).toBe(1);
    expect(result.current.cartCount).toBe(2);
    expect(result.current.subtotal).toBe(550); // 275 * 2
    expect(result.current.mrpTotal).toBe(600); // 300 * 2
    expect(result.current.totalSavings).toBe(50); // 600 - 550
    expect(result.current.finalTotal).toBe(550);
  });

  it('should enforce stock limit boundaries when adding items', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(mockProductA, 10); // Available stock is 5
    });

    expect(result.current.items[0].quantity).toBe(5); // Capped at stock_quantity = 5
    expect(result.current.cartCount).toBe(5);
  });

  it('should update item quantity and remove item when quantity is 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(mockProductA, 2);
      result.current.addItem(mockProductB, 1);
    });

    expect(result.current.items.length).toBe(2);

    act(() => {
      result.current.updateQuantity('prod-1', 4);
    });
    expect(result.current.getItemQuantity('prod-1')).toBe(4);

    act(() => {
      result.current.updateQuantity('prod-1', 0); // Should remove prod-1
    });
    expect(result.current.items.length).toBe(1);
    expect(result.current.isInCart('prod-1')).toBe(false);
  });

  it('should calculate percentage coupon discount correctly (e.g. 20% OFF)', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(mockProductA, 2); // Subtotal = 550
      result.current.applyCoupon({
        code: 'FESTIVAL20',
        title: '20% OFF',
        discount_text: '20% OFF',
      });
    });

    expect(result.current.appliedCoupon.code).toBe('FESTIVAL20');
    expect(result.current.couponDiscount).toBe(110); // 20% of 550
    expect(result.current.finalTotal).toBe(440); // 550 - 110
  });

  it('should calculate flat rupee coupon discount correctly (e.g. Flat ₹100 OFF)', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(mockProductA, 2); // Subtotal = 550
      result.current.applyCoupon({
        code: 'FLAT100',
        title: 'Flat ₹100',
        discount_text: 'Flat ₹100 OFF',
      });
    });

    expect(result.current.couponDiscount).toBe(100);
    expect(result.current.finalTotal).toBe(450); // 550 - 100
  });

  it('should calculate Buy 1 Get 1 (BOGO) coupon discount correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(mockProductA, 2); // Subtotal = 550
      result.current.applyCoupon({
        code: 'BOGO50',
        title: 'Buy 1 Get 1 Free',
        discount_text: 'Buy 1 Get 1 Free',
      });
    });

    expect(result.current.couponDiscount).toBe(138); // 25% of 550 rounded
    expect(result.current.finalTotal).toBe(412);
  });

  it('should persist cart to localStorage and clear cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(mockProductA, 1);
    });

    const savedCart = JSON.parse(localStorage.getItem('shopsilo_customer_cart') || '[]');
    expect(savedCart.length).toBe(1);
    expect(savedCart[0].id).toBe('prod-1');

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.cartCount).toBe(0);
  });
});
