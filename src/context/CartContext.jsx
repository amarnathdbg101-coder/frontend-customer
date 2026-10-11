/**
 * CartContext for ShopSilo Customer Web Application
 * 
 * Features:
 * - Persistent cart across page reloads via localStorage
 * - Multi-item and quantity management with stock boundary guards
 * - Subtotal, savings, and total payable calculation
 * - Applied coupons & festival deals engine with auto-deduction
 * - Open/Close state controls for CartDrawer and CheckoutModal
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'shopsilo_customer_cart';
const COUPON_STORAGE_KEY = 'shopsilo_applied_coupon';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Unable to persist cart to localStorage', e);
    }
  }, [items]);

  // Sync coupon to localStorage
  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Unable to persist coupon to localStorage', e);
    }
  }, [appliedCoupon]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const openCheckout = useCallback(() => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, []);
  const closeCheckout = useCallback(() => setIsCheckoutOpen(false), []);

  const addItem = useCallback((product, qty = 1) => {
    if (!product || !product.id) return;
    const addQuantity = Math.max(1, Number(qty) || 1);

    const stock = Number(
      product.available_quantity ??
      product.stock_quantity ??
      product.inventory?.available_quantity ??
      product.inventory?.quantity ??
      product.stock ??
      99
    );

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => String(item.id) === String(product.id));

      if (existingIndex > -1) {
        const currentQty = prevItems[existingIndex].quantity;
        const newQty = Math.min(stock, currentQty + addQuantity);

        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      } else {
        const newItem = {
          id: product.id,
          name: product.name || 'Product',
          price: Number(product.price) || 0,
          compare_price: Number(product.compare_price) || 0,
          images: product.images || [],
          image: (product.images && product.images[0]) || product.image || null,
          quantity: Math.min(stock, addQuantity),
          stock_quantity: stock,
          shop_id: product.shop_id || product.shop?.id || null,
          shop_name: product.shop_name || product.shop?.name || 'Local Store',
          shop_slug: product.shop_slug || product.shop?.slug || '',
          shop_address: product.shop_address || product.shop?.address || '',
          shop_phone: product.shop_phone || product.shop?.phone || '',
        };
        return [...prevItems, newItem];
      }
    });
  }, []);

  const updateQuantity = useCallback((productId, newQty) => {
    const qty = Number(newQty);
    if (qty <= 0) {
      setItems((prev) => prev.filter((item) => String(item.id) !== String(productId)));
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (String(item.id) === String(productId)) {
          const maxStock = item.stock_quantity > 0 ? item.stock_quantity : 999;
          return {
            ...item,
            quantity: Math.min(maxStock, qty),
          };
        }
        return item;
      })
    );
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => String(item.id) !== String(productId)));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (productId) => {
      return items.some((item) => String(item.id) === String(productId));
    },
    [items]
  );

  const getItemQuantity = useCallback(
    (productId) => {
      const item = items.find((item) => String(item.id) === String(productId));
      return item ? item.quantity : 0;
    },
    [items]
  );

  // Apply or remove promotional coupon
  const applyCoupon = useCallback((coupon) => {
    if (!coupon) return;
    const couponObj = typeof coupon === 'string'
      ? { code: coupon.toUpperCase(), title: coupon, discount_text: coupon }
      : {
          code: coupon.code || coupon.discount_text || coupon.title,
          title: coupon.title || coupon.code,
          discount_text: coupon.discount_text || coupon.title,
          shop_id: coupon.shop_id,
          shop_name: coupon.shop_name,
        };
    setAppliedCoupon(couponObj);
  }, []);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  // Base Calculations
  const cartCount = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 0), 0);
  }, [items]);

  const mrpTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const regularPrice = item.compare_price && item.compare_price > item.price ? item.compare_price : item.price;
      return sum + regularPrice * (item.quantity || 0);
    }, 0);
  }, [items]);

  const totalSavings = useMemo(() => {
    return Math.max(0, mrpTotal - subtotal);
  }, [mrpTotal, subtotal]);

  // Coupon discount calculation
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || subtotal <= 0) return 0;
    const text = String(appliedCoupon.discount_text || appliedCoupon.title || appliedCoupon.code || '').toLowerCase();

    // Check percentage discount e.g. "20% OFF", "15% off", "Flat 25%"
    const pctMatch = text.match(/(\d+)%/);
    if (pctMatch) {
      const pct = Number(pctMatch[1]);
      return Math.round((subtotal * pct) / 100);
    }

    // Check flat rupee amount e.g. "₹50", "Flat ₹100", "Rs 50"
    const flatMatch = text.match(/(?:₹|rs\.?|flat\s*)(\d+)/i);
    if (flatMatch) {
      const flatAmt = Number(flatMatch[1]);
      return Math.min(subtotal, flatAmt);
    }

    // Buy 1 Get 1 or BOGO offers: give 25% order value equivalent
    if (text.includes('bogo') || text.includes('buy 1 get 1') || text.includes('buy x')) {
      return Math.round(subtotal * 0.25);
    }

    // Standard festival default: 15% discount
    return Math.min(subtotal, Math.round(subtotal * 0.15));
  }, [appliedCoupon, subtotal]);

  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - couponDiscount);
  }, [subtotal, couponDiscount]);

  const contextValue = useMemo(
    () => ({
      items,
      cartCount,
      subtotal,
      mrpTotal,
      totalSavings,
      appliedCoupon,
      couponDiscount,
      finalTotal,
      applyCoupon,
      removeCoupon,
      isCartOpen,
      isCheckoutOpen,
      openCart,
      closeCart,
      toggleCart,
      openCheckout,
      closeCheckout,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isInCart,
      getItemQuantity,
    }),
    [
      items,
      cartCount,
      subtotal,
      mrpTotal,
      totalSavings,
      appliedCoupon,
      couponDiscount,
      finalTotal,
      applyCoupon,
      removeCoupon,
      isCartOpen,
      isCheckoutOpen,
      openCart,
      closeCart,
      toggleCart,
      openCheckout,
      closeCheckout,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isInCart,
      getItemQuantity,
    ]
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
