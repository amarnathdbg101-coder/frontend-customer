import { localCache, CACHE_KEYS, DEFAULT_TTL } from '../../utils/localCache.js';
/**
 * Customer Explore & Marketplace Screen
 * Clean, modern, responsive layout with location discovery, search, promo carousel, 
 * 44-category system, and responsive shop & product feeds.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Zap,
  Store,
  BookOpen,
  Tag,
  Folder,
  ChevronDown,
  MapPin,
  X,
  Package,
  Navigation,
} from 'lucide-react';
import { shopApi } from '../../api/shop.api';
import { productApi } from '../../api/product.api';
import { reservationApi } from '../../api/reservation.api';
import { AppLayout } from '../../components/layout/AppLayout';
import { useLocation } from '../../context/LocationContext';
import { useSaved } from '../../context/SavedContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useDebounce } from '../../hooks/useDebounce';
import { ProductCard } from '../../components/cards/ProductCard';
import { ShopCard } from '../../components/cards/ShopCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonProductGrid, SkeletonShopGrid } from '../../components/ui/Skeleton';
import { ProductDetailModal } from '../../components/common/ProductDetailModal';
import { ShopDetailModal } from '../../components/common/ShopDetailModal';
import { CategoryExplorerModal } from '../../components/customer/CategoryExplorerModal';
import { SmartSearchModal } from '../../components/customer/SmartSearchModal';

const RADIUS_OPTIONS = [
  { label: '1 km', value: 1 },
  { label: '3 km', value: 3 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: 'All', value: 999 },
];

function extractArray(response, fieldName) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response[fieldName])) return response[fieldName];
  if (Array.isArray(response.data)) return response.data;
  if (response.data && Array.isArray(response.data[fieldName])) return response.data[fieldName];
  if (Array.isArray(response.results)) return response.results;
  if (Array.isArray(response.items)) return response.items;
  return [];
}

export const ExploreShopsScreen = () => {
  const navigate = useNavigate();
  const { coords, locationName, radiusKm, setRadiusKm, detectLocation, setManualLocation, isDetecting } = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const { isProductSaved, toggleSaveProduct, isShopSaved, toggleSaveShop } = useSaved();
  const { isHindi, t } = useLanguage();
  const { openCart, cartCount } = useCart();

  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'shops'

  // Modals state
  const [inspectedProduct, setInspectedProduct] = useState(null);
  const [inspectedShop, setInspectedShop] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSmartSearchOpen, setIsSmartSearchOpen] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 250);

  // 1. Fetch Shops & Products (SWR 0ms Cache First)
  const loadMarketplaceData = useCallback(async () => {
    // 1. Check Local Cache First for 0ms Instant Display (keyed by area)
    const cacheCoordKey = coords?.lat ? `${CACHE_KEYS.SHOPS}_${coords.lat.toFixed(2)}_${coords.lng.toFixed(2)}` : CACHE_KEYS.SHOPS;
    const cachedShops = localCache.get(cacheCoordKey);
    const cachedProds = localCache.get(CACHE_KEYS.PRODUCTS);

    let hasLocal = false;
    if (cachedShops && Array.isArray(cachedShops) && cachedShops.length > 0) {
      setShops(cachedShops);
      hasLocal = true;
    }
    if (cachedProds && Array.isArray(cachedProds) && cachedProds.length > 0) {
      setProducts(cachedProds);
      hasLocal = true;
    }

    if (hasLocal) {
      setLoading(false); // 0ms Instant Render!
    } else {
      setLoading(true);
    }

    try {
      const params = {
        lat: coords?.lat,
        lng: coords?.lng,
        radius_km: radiusKm === 999 ? undefined : radiusKm,
      };

      const [shopsRes, prodsRes] = await Promise.allSettled([
        shopApi.listPublicShops(params).catch(() => shopApi.listPublicShops({})),
        (coords?.lat && coords?.lng)
          ? productApi.findNearbyProducts({
              lat: coords.lat,
              lng: coords.lng,
              radius_km: radiusKm === 999 ? 20 : radiusKm,
              limit: 100,
            }).catch(() => productApi.listProducts({ limit: 100 }))
          : productApi.listProducts({ limit: 100 }),
      ]);

      let shopList = shopsRes.status === 'fulfilled' ? extractArray(shopsRes.value, 'shops') : [];
      if (shopList.length === 0 && params.radius_km) {
        try {
          const fallbackShops = await shopApi.listPublicShops({});
          shopList = extractArray(fallbackShops, 'shops');
        } catch (e) {
          console.warn('Fallback shops fetch error:', e);
        }
      }

      let rawProdList = prodsRes.status === 'fulfilled' ? extractArray(prodsRes.value, 'products') : [];
      if (rawProdList.length === 0) {
        try {
          const fallbackProds = await productApi.listProducts({ limit: 100 });
          rawProdList = extractArray(fallbackProds, 'products');
        } catch (e) {
          console.warn('Fallback products fetch error:', e);
        }
      }

      const normalizedProds = rawProdList.map((p) => {
        const qty = Number(
          p.available_quantity ??
          p.stock_quantity ??
          p.inventory?.available_quantity ??
          p.inventory?.quantity ??
          p.stock ??
          0
        );
        return {
          ...p,
          id: p.id || p.product_id,
          stock_quantity: qty,
          available_quantity: qty,
        };
      });

      if (shopList.length > 0) {
        setShops(shopList);
        localCache.set(cacheCoordKey, shopList, DEFAULT_TTL.SHOPS);
      }
      if (normalizedProds.length > 0) {
        setProducts(normalizedProds);
        localCache.set(CACHE_KEYS.PRODUCTS, normalizedProds, DEFAULT_TTL.PRODUCTS);
      }
    } catch (err) {
      console.error('Failed to load marketplace data:', err);
    } finally {
      setLoading(false);
    }
  }, [coords?.lat, coords?.lng, radiusKm]);

  useEffect(() => {
    loadMarketplaceData();
  }, [loadMarketplaceData]);

  // 2. Filter Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase();
        const matchesName = (p.name || '').toLowerCase().includes(query);
        const matchesBrand = (p.attributes?.brand || p.brand || '').toLowerCase().includes(query);
        const matchesShop = (p.shop_name || '').toLowerCase().includes(query);
        const matchesDesc = (p.description || '').toLowerCase().includes(query);
        if (!matchesName && !matchesBrand && !matchesShop && !matchesDesc) return false;
      }

      if (selectedCategory && selectedCategory !== 'All') {
        const catLower = selectedCategory.toLowerCase();
        const pCat = (p.category_name || p.category_id || p.category_slug || p.category?.name || p.category?.slug || '').toLowerCase();
        const matchesCat = pCat.includes(catLower) || catLower.includes(pCat) || (p.name || '').toLowerCase().includes(catLower);
        if (!matchesCat) return false;
      }

      return true;
    });
  }, [products, debouncedSearch, selectedCategory]);

  // 3. Filter Shops
  const filteredShops = useMemo(() => {
    return shops.filter((s) => {
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase();
        const matchesName = (s.name || '').toLowerCase().includes(query);
        const matchesAddr = (s.address || '').toLowerCase().includes(query);
        const matchesCity = (s.city || '').toLowerCase().includes(query);
        const matchesCat = (s.category || '').toLowerCase().includes(query);
        if (!matchesName && !matchesAddr && !matchesCity && !matchesCat) return false;
      }

      if (selectedCategory && selectedCategory !== 'All') {
        const catLower = selectedCategory.toLowerCase();
        const sCat = (s.category || '').toLowerCase();
        const matchesCat = sCat.includes(catLower) || catLower.includes(sCat) || (s.name || '').toLowerCase().includes(catLower);
        if (!matchesCat) return false;
      }

      return true;
    });
  }, [shops, debouncedSearch, selectedCategory]);

  const handleReserveFromModal = useCallback(async ({ product, quantity, hold_hours, notes }) => {
    try {
      const res = await reservationApi.createReservation({
        product_id: product.id,
        quantity,
        hold_hours,
        notes,
      });
      alert(`${isHindi ? 'सामान रिज़र्व हो गया!' : 'Item Reserved!'} ${isHindi ? 'पिकअप OTP' : 'Pickup OTP'}: ${res.pickup_code || res.reservation_number || 'OK'}`);
      setInspectedProduct(null);
    } catch (err) {
      alert(err.message || (isHindi ? 'रिज़र्वेशन में त्रुटि' : 'Reservation Error'));
    }
  }, [isHindi]);

  const handleSelectShopTab = () => {
    setActiveTab('shops');
    const el = document.getElementById('marketplace-feed-header');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectProductsTab = () => {
    setActiveTab('products');
    const el = document.getElementById('marketplace-feed-header');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <AppLayout>
      {/* 1. COMPACT 1-LINE GPS LOCATION & RADIUS CONTROL BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 0',
          gap: '8px',
        }}
      >
        <button
          type="button"
          onClick={() => setShowLocationModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
            fontWeight: 800,
            maxWidth: '220px',
            textAlign: 'left',
          }}
          title={isHindi ? 'GPS लोकेशन अपडेट करें' : 'Update GPS Location'}
        >
          <MapPin size={15} color="var(--color-primary, #4f46e5)" style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {isDetecting ? (isHindi ? 'लोकेशन...' : 'Detecting...') : (locationName || 'Local Area')}
          </span>
          <ChevronDown size={13} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
        </button>

        {/* Compact Radius Dropdown Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            {isHindi ? 'दूरी:' : 'Radius:'}
          </span>
          <select
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            style={{
              padding: '2px 6px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface-subtle)',
              color: 'var(--color-primary, #4f46e5)',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {RADIUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. SLEEK SEARCH INPUT BAR */}
      <div style={{ margin: '6px 0 12px 0' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-surface, #ffffff)',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle, #cbd5e1)',
            padding: '8px 12px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
            gap: '8px',
          }}
        >
          <Search size={16} color="var(--color-primary, #4f46e5)" style={{ flexShrink: 0 }} />
          <input
            type="search"
            placeholder={isHindi ? 'दुकानें, सामान या ब्रांड खोजें...' : 'Search local shops, products, brands...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.84rem',
              color: 'var(--text-primary, #0f172a)',
              width: '100%',
              fontWeight: 500,
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)' }}
            >
              <X size={15} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsSmartSearchOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '5px 10px',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.2)',
              whiteSpace: 'nowrap',
            }}
            title={isHindi ? 'सामान कहाँ मिलेगा? मल्टी-शॉप तुलना' : 'Where is it available? Multi-Shop Search'}
          >
            <span>✨</span>
            <span>{isHindi ? 'सामान कहाँ मिलेगा?' : 'Compare Shops'}</span>
          </button>
        </div>
      </div>

      {/* 3. SLEEK PROMO CAROUSEL */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          paddingBottom: '4px',
          marginBottom: '12px',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
      >
        {/* Card 1: Smart Bargain */}
        <div
          style={{
            minWidth: '75%',
            maxWidth: '280px',
            scrollSnapAlign: 'start',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            color: '#ffffff',
            padding: '12px 14px',
            boxShadow: '0 6px 16px -4px rgba(15, 23, 42, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
              {isHindi ? 'स्मार्ट बार्गेन' : 'Direct Negotiation'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
              {isHindi ? 'दुकानदार को सीधे ऑफर भेजें' : 'Send bulk pricing offers directly'}
            </div>
          </div>
          <span
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#f59e0b',
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '3px 6px',
              borderRadius: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            ✨ BARGAIN
          </span>
        </div>

        {/* Card 2: Instant Pickup */}
        <div
          style={{
            minWidth: '75%',
            maxWidth: '280px',
            scrollSnapAlign: 'start',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
            color: '#ffffff',
            padding: '12px 14px',
            boxShadow: '0 6px 16px -4px rgba(6, 78, 59, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
              {isHindi ? '15-मिनट पिकअप' : '15-Min Pickup'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#a7f3d0', marginTop: '2px' }}>
              {isHindi ? 'सामान रिज़र्व करें व OTP से लें' : 'Reserve & collect with OTP'}
            </div>
          </div>
          <span
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '3px 6px',
              borderRadius: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            ⚡ OTP PASS
          </span>
        </div>
      </div>

      {/* 4. COMPACT CATEGORY EXPLORER BAR */}
      <div style={{ marginBottom: '14px' }}>
        <div
          onClick={() => setIsCategoryModalOpen(true)}
          style={{
            backgroundColor: 'var(--bg-surface, #ffffff)',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <Folder size={16} color="#d97706" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedCategory === 'All'
                ? (isHindi ? 'सभी कैटेगरीज (44+ Choose Category)' : 'All Categories (44+ Choose Category)')
                : selectedCategory}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--color-primary, #4f46e5)',
              padding: '2px 8px',
              borderRadius: '8px',
              fontSize: '0.72rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              flexShrink: 0,
            }}
          >
            <span>44+</span>
            <ChevronDown size={13} />
          </div>
        </div>
      </div>

      {/* 5. TAB SELECTOR: PRODUCTS vs LOCAL SHOPS */}
      <div
        id="marketplace-feed-header"
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          backgroundColor: 'var(--bg-surface-subtle, #f1f5f9)',
          padding: '4px',
          borderRadius: '16px',
        }}
      >
        <button
          type="button"
          onClick={handleSelectProductsTab}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: activeTab === 'products' ? 'var(--bg-surface, #ffffff)' : 'transparent',
            color: activeTab === 'products' ? 'var(--color-primary, #4f46e5)' : 'var(--text-secondary, #64748b)',
            fontWeight: 800,
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: activeTab === 'products' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Package size={16} />
          <span>{isHindi ? 'ट्रेंडिंग सामान' : 'Products'}</span>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              backgroundColor: activeTab === 'products' ? 'rgba(79, 70, 229, 0.1)' : 'rgba(0,0,0,0.05)',
              padding: '1px 6px',
              borderRadius: '8px',
            }}
          >
            {filteredProducts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={handleSelectShopTab}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: activeTab === 'shops' ? 'var(--bg-surface, #ffffff)' : 'transparent',
            color: activeTab === 'shops' ? 'var(--color-primary, #4f46e5)' : 'var(--text-secondary, #64748b)',
            fontWeight: 800,
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: activeTab === 'shops' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Store size={16} />
          <span>{isHindi ? 'लोकल दुकानें' : 'Local Shops'}</span>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              backgroundColor: activeTab === 'shops' ? 'rgba(79, 70, 229, 0.1)' : 'rgba(0,0,0,0.05)',
              padding: '1px 6px',
              borderRadius: '8px',
            }}
          >
            {filteredShops.length}
          </span>
        </button>
      </div>

      {/* 7. RESPONSIVE FEED CONTENT */}
      <div style={{ marginBottom: '40px' }}>
        {loading ? (
          activeTab === 'shops' ? <SkeletonShopGrid count={4} /> : <SkeletonProductGrid count={6} />
        ) : activeTab === 'shops' ? (
          filteredShops.length === 0 ? (
            <EmptyState
              icon={Store}
              title={isHindi ? 'कोई दुकान नहीं मिली' : 'No Shops Found'}
              description={isHindi ? 'कृपया सर्च या रेडियस फ़िल्टर बदलें' : 'Try adjusting your search or radius'}
            />
          ) : (
            <div className="customer-shop-grid">
              {filteredShops.map((s) => (
                <ShopCard
                  key={s.id}
                  shop={s}
                  coords={coords}
                  isSaved={isShopSaved(s.id)}
                  onToggleSave={toggleSaveShop}
                  onClick={() => setInspectedShop(s)}
                  onNavigate={navigate}
                />
              ))}
            </div>
          )
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title={isHindi ? 'कोई सामान नहीं मिला' : 'No Products Found'}
            description={isHindi ? 'कृपया दूसरा नाम या कैटेगोरी चुनें' : 'Try picking another category or search'}
          />
        ) : (
          <div className="customer-product-grid">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isSaved={isProductSaved(p.id)}
                onToggleSave={toggleSaveProduct}
                onClick={() => setInspectedProduct(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* PRODUCT DETAIL MODAL */}
      {inspectedProduct && (
        <ProductDetailModal
          product={inspectedProduct}
          onClose={() => setInspectedProduct(null)}
          onReserve={handleReserveFromModal}
        />
      )}

      {/* SHOP DETAIL MODAL */}
      {inspectedShop && (
        <ShopDetailModal
          shop={inspectedShop}
          coords={coords}
          onClose={() => setInspectedShop(null)}
        />
      )}

      {/* CATEGORY EXPLORER MODAL */}
      <CategoryExplorerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        selectedCategoryId={selectedCategory}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId || 'All');
          setIsCategoryModalOpen(false);
        }}
      />

      {/* HYPERLOCAL MULTI-SHOP SEARCH MODAL ("सामान कहाँ मिलेगा?") */}
      <SmartSearchModal
        isOpen={isSmartSearchOpen}
        onClose={() => setIsSmartSearchOpen(false)}
        initialQuery={searchTerm}
      />
      {/* LOCATION PICKER MODAL */}
      {showLocationModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowLocationModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface, #ffffff)',
              color: 'var(--text-primary)',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-subtle, #e5e7eb)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  {isHindi ? '📍 अपनी लोकेशन चुनें' : '📍 Select Your Location'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {isHindi ? 'सटीक दुकान दूरी और डिलीवरी समय देखने के लिए' : 'To see exact store distance and travel times'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: 'var(--text-muted)',
                  padding: '4px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Live GPS Button */}
            <button
              type="button"
              onClick={() => {
                detectLocation();
                setShowLocationModal(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                border: '1px solid rgba(79, 70, 229, 0.3)',
                borderRadius: '12px',
                color: 'var(--color-primary, #4f46e5)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                marginBottom: '18px',
                transition: 'all 0.15s ease',
              }}
            >
              <Navigation size={16} />
              <span>{isHindi ? '🎯 लाइव GPS लोकेशन इस्तेमाल करें' : '🎯 Use Live GPS Location'}</span>
            </button>

            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isHindi ? 'प्रमुख शहर / बाज़ार' : 'Popular Shopping Hubs'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {[
                { name: 'Noida (Sector 15)', lat: 28.5828, lng: 77.3110, icon: '🏢' },
                { name: 'Darbhanga', lat: 26.1542, lng: 85.8918, icon: '🏪' },
                { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090, icon: '🏙️' },
                { name: 'Patna', lat: 25.6126, lng: 85.1444, icon: '🏛️' },
                { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, icon: '🌴' },
                { name: 'Mumbai', lat: 19.0760, lng: 72.8777, icon: '🌊' },
              ].map((hub) => (
                <button
                  key={hub.name}
                  type="button"
                  onClick={() => {
                    setManualLocation(hub.name, hub.lat, hub.lng);
                    setShowLocationModal(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 12px',
                    backgroundColor: locationName === hub.name ? 'rgba(79, 70, 229, 0.12)' : 'var(--bg-surface-subtle, #f9fafb)',
                    border: locationName === hub.name ? '1.5px solid var(--color-primary, #4f46e5)' : '1px solid var(--border-subtle, #e5e7eb)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: locationName === hub.name ? 'var(--color-primary, #4f46e5)' : 'var(--text-primary)',
                    fontWeight: locationName === hub.name ? 800 : 600,
                    fontSize: '0.82rem',
                  }}
                >
                  <span>{hub.icon}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hub.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default ExploreShopsScreen;
