import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const SavedContext = createContext(null);

export const SavedProvider = ({ children }) => {
  const [savedProducts, setSavedProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsilo_saved_products');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [savedShops, setSavedShops] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsilo_saved_shops');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('shopsilo_saved_products', JSON.stringify(savedProducts));
    } catch (e) {}
  }, [savedProducts]);

  useEffect(() => {
    try {
      localStorage.setItem('shopsilo_saved_shops', JSON.stringify(savedShops));
    } catch (e) {}
  }, [savedShops]);

  const toggleSaveProduct = useCallback((product) => {
    if (!product || !product.id) return;
    setSavedProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  }, []);

  const isProductSaved = useCallback(
    (productId) => {
      return savedProducts.some((p) => p.id === productId);
    },
    [savedProducts]
  );

  const toggleSaveShop = useCallback((shop) => {
    if (!shop || !shop.id) return;
    setSavedShops((prev) => {
      const exists = prev.some((s) => s.id === shop.id);
      if (exists) {
        return prev.filter((s) => s.id !== shop.id);
      } else {
        return [...prev, shop];
      }
    });
  }, []);

  const isShopSaved = useCallback(
    (shopId) => {
      return savedShops.some((s) => s.id === shopId);
    },
    [savedShops]
  );

  const contextValue = useMemo(
    () => ({
      savedProducts,
      savedShops,
      toggleSaveProduct,
      isProductSaved,
      toggleSaveShop,
      isShopSaved,
    }),
    [savedProducts, savedShops, toggleSaveProduct, isProductSaved, toggleSaveShop, isShopSaved]
  );

  return (
    <SavedContext.Provider value={contextValue}>
      {children}
    </SavedContext.Provider>
  );
};

export const useSaved = () => {
  const context = useContext(SavedContext);
  if (!context) {
    throw new Error('useSaved must be used within a SavedProvider');
  }
  return context;
};

export default SavedContext;
