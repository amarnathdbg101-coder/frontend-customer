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
  const { coords, locationName, radiusKm, setRadiusKm, detectLocation, isDetecting } = useLocation();
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

  const debouncedSearch = useDebounce(searchTerm, 250);

  // 1. Fetch Shops & Products
  const loadMarketplaceData = useCallback(async () => {
    try {
      setLoading(true);
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

      setShops(shopList);
      setProducts(normalizedProds);
    } catch (err) {
      console.error('Failed to load marketplace data:', err);
    } finally {
      setLoading(false);
    }
  }, [coords, radiusKm]);

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
      {/* 1. LOCATION & GPS BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 0 6px 0',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={detectLocation}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            border: 'none',
            padding: '2px 0',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            fontSize: '0.82rem',
            fontWeight: 700,
            maxWidth: '220px',
            textAlign: 'left',
          }}
          title={isHindi ? 'GPS लोकेशन अपडेट करें' : 'Update GPS Location'}
        >
          <MapPin size={16} color="var(--color-primary, #4f46e5)" style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {isDetecting ? (isHindi ? 'लोकेशन खोज रहे हैं...' : 'Detecting...') : (locationName || 'Local Area')}
          </span>
          <ChevronDown size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
        </button>

        {/* Radius Selector Pills */}
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRadiusKm(opt.value)}
              style={{
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                border: radiusKm === opt.value ? 'none' : '1px solid var(--border-subtle)',
                backgroundColor: radiusKm === opt.value ? 'var(--color-primary, #4f46e5)' : 'var(--bg-surface)',
                color: radiusKm === opt.value ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. SIMPLE, CLEAN SEARCH INPUT BAR */}
      <div style={{ margin: '8px 0 16px 0' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-surface, #ffffff)',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle, #cbd5e1)',
            padding: '10px 14px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            gap: '10px',
          }}
        >
          <Search size={18} color="var(--color-primary, #4f46e5)" style={{ flexShrink: 0 }} />
          <input
            type="search"
            placeholder={isHindi ? 'दुकानें, सामान या ब्रांड खोजें...' : 'Search local shops, products, brands...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.86rem',
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
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 3. PROMO CAROUSEL */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          paddingBottom: '8px',
          marginBottom: '16px',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
      >
        {/* Card 1: Smart Bargain */}
        <div
          style={{
            minWidth: '82%',
            maxWidth: '320px',
            scrollSnapAlign: 'start',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            color: '#ffffff',
            padding: '18px 20px',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: '#f59e0b',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '8px',
              }}
            >
              ✨ {isHindi ? 'स्मार्ट बार्गेन' : 'SMART BARGAIN'}
            </span>
            <Tag size={16} color="#f59e0b" />
          </div>

          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px', lineHeight: 1.2 }}>
              {isHindi ? 'डायरेक्ट काउंटर नेगोशिएशन' : 'Direct Counter Negotiation'}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.35 }}>
              {isHindi ? 'दुकानदार को सीधे डिस्काउंट व बल्क प्राइस ऑफर भेजें' : 'Send bulk pricing offers directly to shopkeepers'}
            </div>
          </div>
        </div>

        {/* Card 2: Instant Pickup */}
        <div
          style={{
            minWidth: '82%',
            maxWidth: '320px',
            scrollSnapAlign: 'start',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
            color: '#ffffff',
            padding: '18px 20px',
            boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '8px',
              }}
            >
              ⚡ 15-MIN OTP
            </span>
            <Zap size={16} color="#34d399" />
          </div>

          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px', lineHeight: 1.2 }}>
              {isHindi ? '15-मिनट लोकल काउंटर पिकअप' : '15-Min Local Counter Pickup'}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#a7f3d0', lineHeight: 1.35 }}>
              {isHindi ? 'बिना डिलीवरी चार्ज, सामान रिज़र्व करें और OTP से लें' : 'Zero delivery fee. Reserve & collect with OTP'}
            </div>
          </div>
        </div>
      </div>

      {/* 4. QUICK 2x2 FEATURE GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          marginBottom: '20px',
        }}
      >
        {/* Box 1: Instant Pickup */}
        <div
          onClick={() => navigate('/saved')}
          style={{
            backgroundColor: 'var(--bg-surface, #ffffff)',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'transform 0.15s ease',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Zap size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {isHindi ? 'इंस्टेंट पिकअप' : 'Instant Pickup'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
              {isHindi ? 'ऑर्डर व कोड' : 'Orders & OTP'}
            </div>
          </div>
        </div>

        {/* Box 2: Local Shops */}
        <div
          onClick={handleSelectShopTab}
          style={{
            backgroundColor: activeTab === 'shops' ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-surface, #ffffff)',
            borderRadius: '16px',
            border: activeTab === 'shops' ? '1.5px solid #3b82f6' : '1px solid var(--border-subtle, #e2e8f0)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'transform 0.15s ease',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Store size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {isHindi ? 'आस-पास दुकानें' : 'Local Shops'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
              {filteredShops.length} {isHindi ? 'स्टोर्स' : 'Stores'}
            </div>
          </div>
        </div>

        {/* Box 3: Mera Khata */}
        <div
          onClick={() => navigate('/khata')}
          style={{
            backgroundColor: 'var(--bg-surface, #ffffff)',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'transform 0.15s ease',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#fef2f2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BookOpen size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {isHindi ? 'मेरा खाता' : 'Mera Khata'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
              {isHindi ? 'उधार पासबुक' : 'Udhar Passbook'}
            </div>
          </div>
        </div>

        {/* Box 4: Live Deals */}
        <div
          onClick={() => navigate('/deals')}
          style={{
            backgroundColor: 'var(--bg-surface, #ffffff)',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'transform 0.15s ease',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#fffbeb',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Tag size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {isHindi ? 'लाइव ऑफर्स' : 'Live Deals'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
              {isHindi ? 'दुकान डिस्काउंट' : 'Store Offers'}
            </div>
          </div>
        </div>
      </div>

      {/* 5. CATEGORY FILTER SECTION */}
      <div style={{ marginBottom: '20px' }}>
        {/* Category Header Card */}
        <div
          onClick={() => setIsCategoryModalOpen(true)}
          style={{
            backgroundColor: 'var(--bg-surface, #ffffff)',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Folder size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                CATEGORY FILTER
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedCategory === 'All'
                  ? (isHindi ? 'सभी कैटेगरीज (चुनने के लिए टैप करें)' : 'All Categories (Tap to choose/search)')
                  : selectedCategory}
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--color-primary, #4f46e5)',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.74rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0,
            }}
          >
            <span>44+</span>
            <ChevronDown size={14} />
          </div>
        </div>

        {/* Horizontal Category Pills */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'none',
          }}
        >
          {/* "All" Pill */}
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            style={{
              padding: '7px 16px',
              borderRadius: '20px',
              border: selectedCategory === 'All' ? 'none' : '1px solid var(--border-subtle, #cbd5e1)',
              backgroundColor: selectedCategory === 'All' ? 'var(--color-primary, #4f46e5)' : 'var(--bg-surface, #ffffff)',
              color: selectedCategory === 'All' ? '#ffffff' : 'var(--text-primary, #0f172a)',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: selectedCategory === 'All' ? '0 4px 10px rgba(79, 70, 229, 0.3)' : 'none',
            }}
          >
            <span>☰</span>
            <span>{isHindi ? 'सभी' : 'All'}</span>
          </button>

          {/* Quick Popular Category Pills */}
          {[
            { id: 'Edible Oils', nameHi: 'खाद्य तेल', nameEn: 'Edible Oils', icon: '🍾' },
            { id: 'Atta & Flour', nameHi: 'आटा व दालें', nameEn: 'Flour & Atta', icon: '🌾' },
            { id: 'Dairy & Eggs', nameHi: 'दूध व डेयरी', nameEn: 'Milk & Dairy', icon: '🥛' },
            { id: 'Personal Care', nameHi: 'साबुन व शैम्पू', nameEn: 'Soap & Care', icon: '🧼' },
            { id: 'Snacks & Instant Food', nameHi: 'नमकीन व बिस्कुट', nameEn: 'Snacks & Food', icon: '🍪' },
            { id: 'Spices & Salt', nameHi: 'मसाले व नमक', nameEn: 'Spices & Salt', icon: '🧂' },
            { id: 'Beverages', nameHi: 'चाय व कॉफ़ी', nameEn: 'Tea & Coffee', icon: '☕' },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id || selectedCategory === cat.nameEn;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? 'All' : cat.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '20px',
                  border: isSelected ? 'none' : '1px solid var(--border-subtle, #cbd5e1)',
                  backgroundColor: isSelected ? 'var(--color-primary, #4f46e5)' : 'var(--bg-surface, #ffffff)',
                  color: isSelected ? '#ffffff' : 'var(--text-primary, #0f172a)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isSelected ? '0 4px 10px rgba(79, 70, 229, 0.3)' : 'none',
                }}
              >
                <span>{cat.icon}</span>
                <span>{isHindi ? cat.nameHi : cat.nameEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. TAB SELECTOR: PRODUCTS vs LOCAL SHOPS */}
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
    </AppLayout>
  );
};

export default ExploreShopsScreen;
