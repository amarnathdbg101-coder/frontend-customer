/**
 * Customer Explore & Marketplace Screen
 * 
 * Features:
 * - GPS Auto-detect & Radius Selector (1km, 3km, 5km, 10km, All)
 * - Open Now filter & Live OPEN/CLOSED shop badges
 * - Distance calculation in km/m based on device GPS
 * - Nearby In-stock product discovery via /products/nearby
 * - "Bhav-Taav" Deal exploration & 1-Click Pickup Reservation
 * - Responsive Multi-Column Grid (Mobile 1-2 cols, Tablet 2-3 cols, Desktop 3-5 cols)
 * - 1-Click Call Shop & GPS Directions
 * - "Pick" AI Shopping Co-Pilot widget
 * - AI Smart Natural Language Search Modal
 * - Visual Camera & Barcode/SKU Scanner Modal
 */

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

  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState('shops');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isSmartSearchOpen, setIsSmartSearchOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [inspectedProduct, setInspectedProduct] = useState(null);
  const [inspectedShop, setInspectedShop] = useState(null);

  const debouncedSearch = useDebounce(searchTerm, 400);

  const handleReserveFromModal = useCallback(async ({ product, quantity, hold_hours, notes }) => {
    try {
      const res = await reservationApi.createReservation({
        product_id: product.id,
        quantity,
        hold_hours,
        notes,
      });
      alert(`Item reserved successfully! Pickup Code: ${res.pickup_code || res.reservation_number}`);
      setInspectedProduct(null);
    } catch (err) {
      alert(err.message || 'Reservation failed');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedCategory, radiusKm, openNowOnly, searchMode]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {
        lat: coords?.lat,
        lng: coords?.lng,
        radius_km: radiusKm < 999 ? radiusKm : undefined,
      };
      if (selectedCategory && selectedCategory !== 'All') {
        params.category_id = selectedCategory;
      }

      const prodPromise = (coords?.lat && coords?.lng)
        ? productApi.findNearbyProducts({
            lat: coords.lat,
            lng: coords.lng,
            radius_km: radiusKm < 999 ? radiusKm : 15,
            category_id: selectedCategory && selectedCategory !== 'All' ? selectedCategory : undefined,
            open_now: openNowOnly,
            q: searchTerm || undefined,
            limit: 40,
          }).catch(() => productApi.listProducts({ limit: 40 }))
        : productApi.listProducts({ limit: 40 });

      const [shopData, prodData] = await Promise.allSettled([
        shopApi.listPublicShops(params),
        prodPromise,
      ]);

      let shopList = shopData.status === 'fulfilled'
        ? Array.isArray(shopData.value?.shops) ? shopData.value.shops : (Array.isArray(shopData.value) ? shopData.value : [])
        : [];

      if (shopList.length === 0 && params.radius_km) {
        try {
          const fallbackShops = await shopApi.listPublicShops({
            lat: coords?.lat,
            lng: coords?.lng,
            category_id: selectedCategory && selectedCategory !== 'All' ? selectedCategory : undefined,
          });
          shopList = Array.isArray(fallbackShops?.shops) ? fallbackShops.shops : (Array.isArray(fallbackShops) ? fallbackShops : []);
        } catch (e) {
          console.warn('Fallback shops fetch error:', e);
        }
      }
      setShops(shopList);

      const prodRaw = prodData.status === 'fulfilled' ? prodData.value : null;
      const prodList = Array.isArray(prodRaw?.products)
        ? prodRaw.products
        : (Array.isArray(prodRaw?.data) ? prodRaw.data : (Array.isArray(prodRaw) ? prodRaw : []));
      const normalizedProds = prodList.map((p) => {
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
      setProducts(normalizedProds);
    } catch (err) {
      console.error('Failed to load marketplace data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = useMemo(() => {
    return shops.filter((s) => {
      const term = debouncedSearch.toLowerCase();
      const matchesSearch =
        (s.name || '').toLowerCase().includes(term) ||
        (s.category || '').toLowerCase().includes(term) ||
        (s.city || '').toLowerCase().includes(term) ||
        (s.address || '').toLowerCase().includes(term);
      const matchesOpen = openNowOnly ? Boolean(s.is_active) : true;
      return matchesSearch && matchesOpen;
    });
  }, [shops, debouncedSearch, openNowOnly]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const term = debouncedSearch.toLowerCase();
      const matchesSearch =
        (p.name || '').toLowerCase().includes(term) ||
        (p.description || '').toLowerCase().includes(term) ||
        (p.category_name || '').toLowerCase().includes(term) ||
        (p.category?.name || '').toLowerCase().includes(term);
      const prodStock = Number(
        p.available_quantity ??
        p.stock_quantity ??
        p.inventory?.available_quantity ??
        p.inventory?.quantity ??
        p.stock ??
        0
      );
      const matchesStock = inStockOnly ? prodStock > 0 : true;
      return matchesSearch && matchesStock;
    });
  }, [products, debouncedSearch, inStockOnly]);

  return (
    <AppLayout title="QuickPick Local" subtitle="Find In-Stock Products Around You">
      <title>ShopMe — Explore Nearby Shops &amp; Products</title>

      {/* GPS Header Bar */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MapPin size={18} color="var(--color-primary)" aria-hidden="true" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Current Location</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>
              {locationName}
            </div>
          </div>
        </div>
        <button onClick={detectLocation} disabled={isDetecting} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.78rem' }} aria-label="Detect GPS location">
          <Crosshair size={14} className={isDetecting ? 'spin' : ''} aria-hidden="true" />
          {isDetecting ? 'Detecting...' : 'Live GPS'}
        </button>
      </div>

      {/* Radius Filter & Open Now */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }} role="toolbar" aria-label="Radius filter">
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, whiteSpace: 'nowrap' }}>Radius:</span>
        {RADIUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setRadiusKm(opt.value)}
            className={`btn btn-sm ${radiusKm === opt.value ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '5px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}
            aria-pressed={radiusKm === opt.value}
          >
            {opt.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOpenNowOnly(!openNowOnly)}
          className={`btn btn-sm ${openNowOnly ? 'btn-success' : 'btn-secondary'}`}
          style={{ marginLeft: 'auto', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
          aria-pressed={openNowOnly}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: openNowOnly ? '#10b981' : '#94a3b8' }} aria-hidden="true" />
          Open Stores Only
        </button>
      </div>

      {/* Search Bar & Mode Switcher */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <div className="search-box" style={{ flex: 1, marginBottom: 0 }}>
            <Search size={18} color="var(--text-muted)" aria-hidden="true" />
            <input
              type="search"
              placeholder={searchMode === 'shops' ? "Search store name, category, or locality..." : "Search product name, brand, or in-stock items..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsSmartSearchOpen(true)}
            className="btn btn-secondary"
            title="AI Smart Natural Language Search"
            style={{
              padding: '0 12px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
              borderColor: 'rgba(99, 102, 241, 0.25)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={16} />
            <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>AI Search</span>
          </button>
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="btn btn-secondary"
            title="Scan Barcode / Photo"
            style={{ padding: '0 12px', color: 'var(--text-primary)' }}
          >
            <Camera size={17} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }} role="tablist" aria-label="View mode">
          <button onClick={() => setSearchMode('shops')} className={`btn btn-sm ${searchMode === 'shops' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} role="tab" aria-selected={searchMode === 'shops'}>
            <Store size={16} aria-hidden="true" />
            <span>Nearby Stores ({filteredShops.length})</span>
          </button>
          <button onClick={() => setSearchMode('products')} className={`btn btn-sm ${searchMode === 'products' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} role="tab" aria-selected={searchMode === 'products'}>
            <Package size={16} aria-hidden="true" />
            <span>In-Stock Products ({filteredProducts.length})</span>
          </button>
        </div>
      </div>

      {/* 🚀 Powerful Category Bar (Exact mobile app category feature ported to web app) */}
      <CategoryBar
        selectedCategoryId={selectedCategory === 'All' ? undefined : selectedCategory}
        onSelectCategory={(catId) => setSelectedCategory(catId || 'All')}
      />

      {searchMode === 'products' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <button
            type="button"
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`btn btn-sm ${inStockOnly ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}
            aria-pressed={inStockOnly}
          >
            ⚡ In-Stock Only
          </button>
        </div>
      )}

      {/* Content Feed */}
      {loading ? (
        searchMode === 'shops' ? <SkeletonShopGrid count={4} /> : <SkeletonProductGrid count={6} />
      ) : searchMode === 'shops' ? (
        filteredShops.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No Nearby Stores Found"
            description="Try increasing your search radius (e.g. 5km or 10km) or clearing category filters."
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
      ) : (
        filteredProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No Products Found"
            description="Try searching with another product name or category filter."
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
        )
      )}

      {/* Product Detail Modal */}
      {inspectedProduct && (
        <ProductDetailModal
          product={inspectedProduct}
          onClose={() => setInspectedProduct(null)}
          onReserve={handleReserveFromModal}
        />
      )}

      {/* Shop Detail Modal */}
      {inspectedShop && (
        <ShopDetailModal
          shop={inspectedShop}
          onClose={() => setInspectedShop(null)}
        />
      )}

      {/* Floating AI Co-Pilot Button */}
      <button
        onClick={() => setIsCopilotOpen(true)}
        className="btn"
        aria-label="Open AI Shopping Assistant"
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '30px',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.88rem',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(79, 70, 229, 0.45)',
          zIndex: 90,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <Bot size={18} aria-hidden="true" />
        <span>Ask Pick (AI)</span>
      </button>

      {/* Co-Pilot Modal */}
      <CustomerCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />

      {/* AI Smart Search Modal */}
      <SmartSearchModal
        isOpen={isSmartSearchOpen}
        onClose={() => setIsSmartSearchOpen(false)}
        onSelectProduct={(p) => setInspectedProduct(p)}
      />

      {/* Camera / Barcode Scanner Modal */}
      <ProductScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectProduct={(p) => setInspectedProduct(p)}
      />
    </AppLayout>
  );
};
