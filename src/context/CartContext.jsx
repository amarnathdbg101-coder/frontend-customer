/**
 * CartContext for ShopSilo Customer Web Application
 * 
 * Features:
 * - Persistent cart across page reloads via localStorage
 * - Multi-item and quantity management with stock boundary guards
 * - Subtotal, savings, and total payable calculation
 * - Open/Close state controls for CartDrawer and CheckoutModal
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'shopsilo_customer_cart';

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

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Unable to persist cart to localStorage', e);
    }
  }, [items]);

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

  // Calculations
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

  const contextValue = useMemo(
    () => ({
      items,
      cartCount,
      subtotal,
      mrpTotal,
      totalSavings,
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
