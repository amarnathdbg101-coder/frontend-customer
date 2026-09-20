/**
 * Customer Explore & Marketplace Screen
 * 
 * Features:
 * - GPS Auto-detect & Radius Selector (1km, 3km, 5km, 10km, All)
 * - Open Now filter & Live OPEN/CLOSED shop badges
 * - Multi-criteria sorting (Featured, Price Low-to-High, Price High-to-Low, Discount, Rating)
 * - Price range filter presets
 * - Pagination / Load More products
 * - Distance calculation in km based on device GPS
 * - In-stock discovery & Instant Pickup Reservation
 * - Full i18n support (English & Formal Hindi)
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Search,
  MapPin,
  Crosshair,
  Package,
  ArrowUpDown,
  Filter,
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
import { ShopCard } from '../../components/cards/ShopCard';
import { ProductCard } from '../../components/cards/ProductCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonProductGrid, SkeletonShopGrid } from '../../components/ui/Skeleton';
import { ProductDetailModal } from '../../components/common/ProductDetailModal';
import { ShopDetailModal } from '../../components/common/ShopDetailModal';
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
  const { isHindi, t } = useLanguage();
  const { openCart, cartCount } = useCart();

  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState('shops');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price_asc', 'price_desc', 'discount', 'rating'
  const [priceFilter, setPriceFilter] = useState('all'); // 'all', 'under_100', '100_500', '500_2000', 'above_2000'
  const [displayLimit, setDisplayLimit] = useState(12);

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
      alert(`${t('checkout.reservation_success_title')} ${t('checkout.pickup_otp')}: ${res.pickup_code || res.reservation_number || 'OK'}`);
      setInspectedProduct(null);
    } catch (err) {
      alert(err.message || t('common.error'));
    }
  }, [t]);

  const loadData = useCallback(async () => {
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
            q: debouncedSearch || undefined,
            limit: 60,
          }).catch(() => productApi.listProducts({ limit: 60 }))
        : productApi.listProducts({ limit: 60 });

      const [shopData, prodData] = await Promise.allSettled([
        shopApi.listPublicShops(params),
        prodPromise,
      ]);

      let shopList = shopData.status === 'fulfilled'
        ? Array.isArray(shopData.value?.shops)
          ? shopData.value.shops
          : Array.isArray(shopData.value?.data?.shops)
          ? shopData.value.data.shops
          : Array.isArray(shopData.value?.data)
          ? shopData.value.data
          : Array.isArray(shopData.value)
          ? shopData.value
          : []
        : [];

      if (shopList.length === 0 && params.radius_km) {
        try {
          const fallbackShops = await shopApi.listPublicShops({
            lat: coords?.lat,
            lng: coords?.lng,
            category_id: selectedCategory && selectedCategory !== 'All' ? selectedCategory : undefined,
          });
          shopList = Array.isArray(fallbackShops?.shops)
            ? fallbackShops.shops
            : Array.isArray(fallbackShops?.data?.shops)
            ? fallbackShops.data.shops
            : Array.isArray(fallbackShops?.data)
            ? fallbackShops.data
            : Array.isArray(fallbackShops)
            ? fallbackShops
            : [];
        } catch (e) {
          console.warn('Fallback shops fetch error:', e);
        }
      }
      setShops(shopList);

      const prodRaw = prodData.status === 'fulfilled' ? prodData.value : null;
      const prodList = Array.isArray(prodRaw?.products)
        ? prodRaw.products
        : Array.isArray(prodRaw?.data?.products)
        ? prodRaw.data.products
        : Array.isArray(prodRaw?.data)
        ? prodRaw.data
        : Array.isArray(prodRaw)
        ? prodRaw
        : [];
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
  }, [coords?.lat, coords?.lng, radiusKm, selectedCategory, openNowOnly, debouncedSearch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredShops = useMemo(() => {
    return shops.filter((s) => {
      const term = debouncedSearch.toLowerCase();
      const matchesSearch =
        (s.name || '').toLowerCase().includes(term) ||
        (s.category || '').toLowerCase().includes(term) ||
        (s.city || '').toLowerCase().includes(term) ||
        (s.address || '').toLowerCase().includes(term);
      const matchesOpen = openNowOnly ? Boolean(s.is_active) : true;

      let matchesCat = true;
      if (selectedCategory && selectedCategory !== 'All') {
        const catKey = selectedCategory.toLowerCase();
        const sCat = (s.category || '').toLowerCase();
        matchesCat = sCat.includes(catKey) || catKey.includes(sCat);
      }

      return matchesSearch && matchesOpen && matchesCat;
    });
  }, [shops, debouncedSearch, openNowOnly, selectedCategory]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
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

      let matchesCat = true;
      if (selectedCategory && selectedCategory !== 'All') {
        const catKey = selectedCategory.toLowerCase();
        const pCat = (p.category_id || p.category_slug || p.category_name || p.category?.name || p.category?.slug || '').toLowerCase();
        matchesCat = pCat.includes(catKey) || catKey.includes(pCat);
      }

      // Price filter
      let matchesPrice = true;
      const price = Number(p.price || 0);
      if (priceFilter === 'under_100') matchesPrice = price < 100;
      else if (priceFilter === '100_500') matchesPrice = price >= 100 && price <= 500;
      else if (priceFilter === '500_2000') matchesPrice = price > 500 && price <= 2000;
      else if (priceFilter === 'above_2000') matchesPrice = price > 2000;

      return matchesSearch && matchesStock && matchesCat && matchesPrice;
    });

    // Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === 'discount') {
      result.sort((a, b) => {
        const discA = a.compare_price && a.compare_price > a.price ? a.compare_price - a.price : 0;
        const discB = b.compare_price && b.compare_price > b.price ? b.compare_price - b.price : 0;
        return discB - discA;
      });
    } else if (sortBy === 'rating') {
      result.sort((a, b) => Number(b.rating || 4.8) - Number(a.rating || 4.8));
    }

    return result;
  }, [products, debouncedSearch, inStockOnly, selectedCategory, priceFilter, sortBy]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, displayLimit);
  }, [filteredProducts, displayLimit]);

  return (
    <AppLayout
      title={isHindi ? 'शॉपसिलो हाइपरलोकल बाज़ार' : 'ShopSilo Local Market'}
      subtitle={isHindi ? 'अपने आस-पास उपलब्ध सामान व दुकानें खोजें' : 'Find In-Stock Products Around You'}
    >
      <title>ShopSilo — Explore Nearby Shops &amp; Products</title>

      {/* GPS Header Bar */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MapPin size={18} color="var(--color-primary)" aria-hidden="true" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{isHindi ? 'वर्तमान स्थान (GPS)' : 'Current Location'}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>
              {locationName}
            </div>
          </div>
        </div>
        <button onClick={detectLocation} disabled={isDetecting} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.78rem' }} aria-label="Detect GPS location">
          <Crosshair size={14} className={isDetecting ? 'spin' : ''} aria-hidden="true" />
          {isDetecting ? t('common.loading') : (isHindi ? 'लाइव जीपीएस' : 'Live GPS')}
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
          {t('common.open_now')}
        </button>
      </div>

      {/* Search Bar & Mode Switcher */}
      <div style={{ marginBottom: '14px' }}>
        <div className="search-box" style={{ width: '100%', marginBottom: '10px' }}>
          <Search size={18} color="var(--text-muted)" aria-hidden="true" />
          <input
            type="search"
            placeholder={searchMode === 'shops' ? t('nav.search_placeholder') : (isHindi ? "सामान, ब्रांड या उपलब्ध उत्पाद खोजें..." : "Search product name, brand, or in-stock items...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label={t('common.search')}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }} role="tablist" aria-label="View mode">
          <button onClick={() => setSearchMode('shops')} className={`btn btn-sm ${searchMode === 'shops' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} role="tab" aria-selected={searchMode === 'shops'}>
            <Store size={16} aria-hidden="true" />
            <span>{t('nav.explore')} ({filteredShops.length})</span>
          </button>
          <button onClick={() => setSearchMode('products')} className={`btn btn-sm ${searchMode === 'products' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} role="tab" aria-selected={searchMode === 'products'}>
            <Package size={16} aria-hidden="true" />
            <span>{t('products.all_products')} ({filteredProducts.length})</span>
          </button>
        </div>
      </div>

      {/* Category Bar */}
      <CategoryBar
        selectedCategoryId={selectedCategory === 'All' ? undefined : selectedCategory}
        onSelectCategory={(catId) => setSelectedCategory(catId || 'All')}
      />

      {/* Product Sort & Filter Controls */}
      {searchMode === 'products' && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '14px',
            backgroundColor: 'var(--bg-surface)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* Sorting Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
              {t('products.sort_by')}:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input"
              style={{
                fontSize: '0.76rem',
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: '6px',
                width: 'auto',
                marginBottom: 0,
              }}
            >
              <option value="featured">{t('products.sort_featured')}</option>
              <option value="price_asc">{t('products.sort_price_low_high')}</option>
              <option value="price_desc">{t('products.sort_price_high_low')}</option>
              <option value="discount">{t('products.sort_discount')}</option>
              <option value="rating">{t('products.sort_rating')}</option>
            </select>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', maxWidth: '100%' }}>
            <button
              type="button"
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`btn btn-sm ${inStockOnly ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap', padding: '3px 8px' }}
              aria-pressed={inStockOnly}
            >
              ⚡ {t('products.filter_in_stock_only')}
            </button>

            {[
              { id: 'all', label: t('products.price_all') },
              { id: 'under_100', label: t('products.price_under_100') },
              { id: '100_500', label: t('products.price_100_500') },
              { id: '500_2000', label: t('products.price_500_2000') },
              { id: 'above_2000', label: t('products.price_above_2000') },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriceFilter(p.id)}
                className={`btn btn-sm ${priceFilter === p.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap', padding: '3px 8px' }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Feed */}
      {loading ? (
        searchMode === 'shops' ? <SkeletonShopGrid count={4} /> : <SkeletonProductGrid count={6} />
      ) : searchMode === 'shops' ? (
        filteredShops.length === 0 ? (
          <EmptyState
            icon={Store}
            title={t('common.no_results')}
            description={t('common.try_adjusting_search')}
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
            title={t('common.no_results')}
            description={t('common.try_adjusting_search')}
          />
        ) : (
          <>
            <div className="customer-product-grid">
              {visibleProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isSaved={isProductSaved(p.id)}
                  onToggleSave={toggleSaveProduct}
                  onClick={() => setInspectedProduct(p)}
                />
              ))}
            </div>

            {/* Pagination / Load More */}
            <div style={{ textAlign: 'center', marginTop: '24px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {t('common.showing_count', { current: visibleProducts.length, total: filteredProducts.length })}
              </div>

              {visibleProducts.length < filteredProducts.length ? (
                <button
                  type="button"
                  onClick={() => setDisplayLimit((prev) => prev + 12)}
                  className="btn btn-secondary"
                  style={{
                    padding: '8px 24px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  {t('common.load_more')}
                </button>
              ) : (
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  ✓ {t('common.all_loaded')}
                </span>
              )}
            </div>
          </>
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
    </AppLayout>
  );
};

export default ExploreShopsScreen;
