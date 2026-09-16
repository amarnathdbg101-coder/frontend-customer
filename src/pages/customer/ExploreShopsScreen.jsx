import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Search,
  MapPin,
  Crosshair,
  Bot,
  Package,
  Sparkles,
  Camera,
} from 'lucide-react';
import { shopApi } from '../../api/shop.api';
import { productApi } from '../../api/product.api';
import { reservationApi } from '../../api/reservation.api';
import { AppLayout } from '../../components/layout/AppLayout';
import { useLocation } from '../../context/LocationContext';
import { useSaved } from '../../context/SavedContext';
import { useLanguage } from '../../context/LanguageContext';
import { useDebounce } from '../../hooks/useDebounce';
import { ShopCard } from '../../components/cards/ShopCard';
import { ProductCard } from '../../components/cards/ProductCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonProductGrid, SkeletonShopGrid } from '../../components/ui/Skeleton';
import { CustomerCopilotModal } from '../../components/common/CustomerCopilotModal';
import { ProductDetailModal } from '../../components/common/ProductDetailModal';
import { ShopDetailModal } from '../../components/common/ShopDetailModal';
import { SmartSearchModal } from '../../components/customer/SmartSearchModal';
import { ProductScannerModal } from '../../components/customer/ProductScannerModal';
import { CategoryBar } from '../../components/customer/CategoryBar';

const RADIUS_OPTIONS = [
  { label: '1 km', value: 1 },
  { label: '3 km', value: 3 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: 'All', value: 999 },
];

export const ExploreShopsScreen = () => {
  const navigate = useNavigate();
  const { coords, locationName, radiusKm, setRadiusKm, detectLocation, isDetecting } = useLocation();
  const { isProductSaved, toggleSaveProduct, isShopSaved, toggleSaveShop } = useSaved();
  const { t, isHindi } = useLanguage();

  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Tabs: 'shops' | 'products'
  const [activeTab, setActiveTab] = useState('shops');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openOnly, setOpenOnly] = useState(false);

  // Modals
  const [showCopilot, setShowCopilot] = useState(false);
  const [showSmartSearch, setShowSmartSearch] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedShop, setSelectedShop] = useState(null);

  const fetchExploreData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (coords?.lat && coords?.lng) {
        params.lat = coords.lat;
        params.lng = coords.lng;
        if (radiusKm && radiusKm < 999) {
          params.radius = radiusKm;
        }
      }
      if (debouncedSearch) {
        params.q = debouncedSearch;
      }
      if (selectedCategory) {
        params.category = selectedCategory;
      }

      const [shopsRes, productsRes] = await Promise.allSettled([
        shopApi.getNearbyShops(params),
        productApi.getNearbyProducts(params),
      ]);

      if (shopsRes.status === 'fulfilled') {
        const data = shopsRes.value?.data || shopsRes.value?.shops || shopsRes.value || [];
        setShops(Array.isArray(data) ? data : []);
      } else {
        setShops([]);
      }

      if (productsRes.status === 'fulfilled') {
        const pData = productsRes.value?.data || productsRes.value?.products || productsRes.value || [];
        setProducts(Array.isArray(pData) ? pData : []);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [coords, radiusKm, debouncedSearch, selectedCategory, t]);

  useEffect(() => {
    fetchExploreData();
  }, [fetchExploreData]);

  // Filtered lists
  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      if (openOnly && !shop.is_active) return false;
      return true;
    });
  }, [shops, openOnly]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (openOnly && p.shop && !p.shop.is_active) return false;
      return true;
    });
  }, [products, openOnly]);

  const handleReserve = async (reservationData) => {
    try {
      await reservationApi.createReservation(reservationData);
      alert(t('checkout.reservation_success_title'));
      navigate('/reservations');
    } catch (err) {
      alert(err.response?.data?.message || (isHindi ? 'आरक्षण विफल हुआ' : 'Reservation failed'));
    }
  };

  return (
    <AppLayout title="ShopMe" subtitle={locationName || (isHindi ? 'नजदीकी बाजार' : 'Hyperlocal Retail')}>
      {/* Top Search & Assistant Bar */}
      <div className="explore-search-section">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            className="search-input"
            placeholder={t('nav.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t('nav.search_placeholder')}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="search-clear-btn"
              aria-label={t('common.clear_all')}
            >
              &times;
            </button>
          )}
        </div>

        {/* AI Smart Search & Scanner Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button
            onClick={() => setShowSmartSearch(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'center' }}
          >
            <Sparkles size={15} color="var(--color-primary)" />
            <span>{isHindi ? 'एआई स्मार्ट खोज' : 'AI Smart Search'}</span>
          </button>

          <button
            onClick={() => setShowScanner(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'center' }}
          >
            <Camera size={15} color="var(--color-primary)" />
            <span>{isHindi ? 'कैमरा स्कैनर' : 'Scan Barcode / Item'}</span>
          </button>

          <button
            onClick={() => setShowCopilot(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title={isHindi ? 'एआई सहायक' : 'AI Copilot'}
          >
            <Bot size={16} />
            <span>{isHindi ? 'एआई सहायक' : 'AI Copilot'}</span>
          </button>
        </div>
      </div>

      {/* Category Horizontal Filter Bar */}
      <div style={{ margin: '14px 0' }}>
        <CategoryBar
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(selectedCategory === cat ? null : cat)}
        />
      </div>

      {/* Filter Controls: Tabs & Radius */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
        {/* Switch View Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-full)', padding: '3px' }} role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'shops'}
            onClick={() => setActiveTab('shops')}
            style={{
              border: 'none',
              background: activeTab === 'shops' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'shops' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.82rem',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Store size={15} />
            <span>{t('nav.explore')} ({filteredShops.length})</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'products'}
            onClick={() => setActiveTab('products')}
            style={{
              border: 'none',
              background: activeTab === 'products' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'products' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.82rem',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Package size={15} />
            <span>{t('products.all_products')} ({filteredProducts.length})</span>
          </button>
        </div>

        {/* Radius Selector & Open Only toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setOpenOnly(!openOnly)}
            style={{
              border: openOnly ? '1.5px solid var(--color-success)' : '1px solid var(--border-subtle)',
              background: openOnly ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface-subtle)',
              color: openOnly ? 'var(--color-success)' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
            }}
          >
            {openOnly ? (isHindi ? '✓ खुली दुकानें' : '✓ Open Only') : t('common.open_now')}
          </button>

          <select
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            style={{
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '6px 10px',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
            }}
            aria-label="Filter by distance radius"
          >
            {RADIUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Grid */}
      {loading ? (
        activeTab === 'shops' ? <SkeletonShopGrid count={4} /> : <SkeletonProductGrid count={6} />
      ) : error ? (
        <EmptyState
          title={t('common.error')}
          message={error}
          actionLabel={t('common.retry')}
          onAction={fetchExploreData}
        />
      ) : activeTab === 'shops' ? (
        filteredShops.length === 0 ? (
          <EmptyState
            icon={<Store size={48} color="var(--text-muted)" />}
            title={t('common.no_results')}
            message={t('common.try_adjusting_search')}
            actionLabel={t('common.clear_all')}
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory(null);
              setOpenOnly(false);
              setRadiusKm(999);
            }}
          />
        ) : (
          <div className="shops-grid">
            {filteredShops.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                coords={coords}
                isSaved={isShopSaved(shop.id)}
                onToggleSave={() => toggleSaveShop(shop)}
                onClick={() => setSelectedShop(shop)}
                onNavigate={(path) => navigate(path)}
              />
            ))}
          </div>
        )
      ) : (
        filteredProducts.length === 0 ? (
          <EmptyState
            icon={<Package size={48} color="var(--text-muted)" />}
            title={t('common.no_results')}
            message={t('common.try_adjusting_search')}
            actionLabel={t('common.clear_all')}
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory(null);
              setOpenOnly(false);
              setRadiusKm(999);
            }}
          />
        ) : (
          <div className="products-grid">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                isSaved={isProductSaved(prod.id)}
                onToggleSave={() => toggleSaveProduct(prod)}
                onClick={() => setSelectedProduct(prod)}
              />
            ))}
          </div>
        )
      )}

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onReserve={handleReserve}
        />
      )}

      {selectedShop && (
        <ShopDetailModal
          shop={selectedShop}
          coords={coords}
          onClose={() => setSelectedShop(null)}
          onNavigate={(path) => {
            setSelectedShop(null);
            navigate(path);
          }}
        />
      )}

      {showCopilot && (
        <CustomerCopilotModal
          isOpen={showCopilot}
          onClose={() => setShowCopilot(false)}
          onSelectProduct={(p) => {
            setShowCopilot(false);
            setSelectedProduct(p);
          }}
        />
      )}

      {showSmartSearch && (
        <SmartSearchModal
          isOpen={showSmartSearch}
          onClose={() => setShowSmartSearch(false)}
          onSelectProduct={(p) => {
            setShowSmartSearch(false);
            setSelectedProduct(p);
          }}
        />
      )}

      {showScanner && (
        <ProductScannerModal
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onSelectProduct={(p) => {
            setShowScanner(false);
            setSelectedProduct(p);
          }}
        />
      )}
    </AppLayout>
  );
};
export default ExploreShopsScreen;
