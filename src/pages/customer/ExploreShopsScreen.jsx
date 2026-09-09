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
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Search,
  MapPin,
  Navigation,
  Phone,
  Crosshair,
  Clock,
  Sparkles,
  Bot,
  Package,
  Heart,
  Filter,
  CheckCircle,
  Eye,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { shopApi } from '../../api/shop.api';
import { productApi } from '../../api/product.api';
import { reservationApi } from '../../api/reservation.api';
import { AppLayout } from '../../components/layout/AppLayout';
import { useLocation } from '../../context/LocationContext';
import { useSaved } from '../../context/SavedContext';
import { calculateDistanceKm, formatDistance } from '../../utils/distance';
import { getImageUrl } from '../../utils/imageUrl';
import { CustomerCopilotModal } from '../../components/common/CustomerCopilotModal';
import { ProductDetailModal } from '../../components/common/ProductDetailModal';
import { ShopDetailModal } from '../../components/common/ShopDetailModal';

const CATEGORIES = ['All', 'Electronics', 'Kirana & Grocery', 'Pharmacy', 'Fashion', 'Home & Kitchen'];
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
  const [searchMode, setSearchMode] = useState('shops'); // 'shops' | 'products'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [inspectedProduct, setInspectedProduct] = useState(null);
  const [inspectedShop, setInspectedShop] = useState(null);

  const handleReserveFromModal = async ({ product, quantity, hold_hours, notes }) => {
    try {
      const res = await reservationApi.createReservation({
        product_id: product.id,
        quantity,
        hold_hours,
        notes,
      });
      alert(`Item safaltapoorvak reserve ho gaya! Pickup Code: ${res.pickup_code || res.reservation_number}`);
      setInspectedProduct(null);
    } catch (err) {
      alert(err.message || 'Reservation fail ho gaya');
    }
  };

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
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }

      // If user wants nearby products specifically and GPS is available, use /products/nearby
      const prodPromise = (coords?.lat && coords?.lng)
        ? productApi.findNearbyProducts({
            lat: coords.lat,
            lng: coords.lng,
            radius_km: radiusKm < 999 ? radiusKm : 15,
            category: selectedCategory !== 'All' ? selectedCategory : undefined,
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

      // Fallback if strict radius returned 0 shops
      if (shopList.length === 0 && params.radius_km) {
        try {
          const fallbackShops = await shopApi.listPublicShops({
            lat: coords?.lat,
            lng: coords?.lng,
            category: selectedCategory !== 'All' ? selectedCategory : undefined,
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
      setProducts(prodList);
    } catch (err) {
      console.error('Failed to load marketplace data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter shops
  const filteredShops = shops.filter((s) => {
    const matchesSearch =
      (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.address || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesOpen = openNowOnly ? Boolean(s.is_active) : true;
    return matchesSearch && matchesOpen;
  });

  // Filter products for product-search mode
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const prodStock = Number(p.stock_quantity ?? p.inventory?.available_quantity ?? p.inventory?.quantity ?? 0);
    const matchesStock = inStockOnly ? prodStock > 0 : true;
    return matchesSearch && matchesStock;
  });

  return (
    <AppLayout title="QuickPick Local" subtitle="Find In-Stock Products Around You">
      {/* Top GPS Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '14px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MapPin size={18} color="var(--color-primary)" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Aapki Current Location</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>
              {locationName}
            </div>
          </div>
        </div>

        <button
          onClick={detectLocation}
          disabled={isDetecting}
          className="btn btn-secondary btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 700,
            fontSize: '0.78rem',
            padding: '6px 12px',
          }}
        >
          <Crosshair size={14} className={isDetecting ? 'spin' : ''} />
          {isDetecting ? 'Detecting...' : 'Live GPS'}
        </button>
      </div>

      {/* Radius Filter & Live Open Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '14px',
          overflowX: 'auto',
          paddingBottom: '2px',
          scrollbarWidth: 'none',
        }}
      >
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, whiteSpace: 'nowrap' }}>
          Radius:
        </span>
        {RADIUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setRadiusKm(opt.value)}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: radiusKm === opt.value ? 'var(--color-primary)' : 'var(--bg-surface)',
              color: radiusKm === opt.value ? '#ffffff' : 'var(--text-secondary)',
              border: radiusKm === opt.value ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
              transition: 'all 0.15s ease',
            }}
          >
            {opt.label}
          </button>
        ))}

        {/* Open Now Toggle Pill */}
        <button
          type="button"
          onClick={() => setOpenNowOnly(!openNowOnly)}
          style={{
            marginLeft: 'auto',
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            border: openNowOnly ? '1.5px solid #10b981' : '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: openNowOnly ? '#ecfdf5' : 'var(--bg-surface)',
            color: openNowOnly ? '#065f46' : 'var(--text-secondary)',
          }}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: openNowOnly ? '#10b981' : '#94a3b8' }} />
          Abhi Khuli Dukanien (Open)
        </button>
      </div>

      {/* Search Bar & Switcher */}
      <div style={{ marginBottom: '14px' }}>
        <div className="search-box" style={{ marginBottom: '10px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder={searchMode === 'shops' ? "Search dukan name, category, ya locality..." : "Search product name, brand, in-stock items..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* View Mode Switcher (Shops vs Products) */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setSearchMode('shops')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: searchMode === 'shops' ? '1.5px solid var(--color-primary)' : '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: searchMode === 'shops' ? 'var(--color-primary-light)' : 'var(--bg-surface)',
              color: searchMode === 'shops' ? 'var(--color-primary)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Store size={16} />
            <span>Nazdeeki Dukaanein ({filteredShops.length})</span>
          </button>
          <button
            onClick={() => setSearchMode('products')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: searchMode === 'products' ? '1.5px solid var(--color-primary)' : '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: searchMode === 'products' ? 'var(--color-primary-light)' : 'var(--bg-surface)',
              color: searchMode === 'products' ? 'var(--color-primary)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Package size={16} />
            <span>Products In-Stock ({filteredProducts.length})</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '6px',
          marginBottom: '16px',
          scrollbarWidth: 'none',
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: selectedCategory === cat ? 'var(--color-primary)' : 'var(--bg-surface)',
              color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary)',
              border: selectedCategory === cat ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
              boxShadow: selectedCategory === cat ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {cat}
          </button>
        ))}

        {searchMode === 'products' && (
          <button
            type="button"
            onClick={() => setInStockOnly(!inStockOnly)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: inStockOnly ? 'var(--color-primary-light)' : 'var(--bg-surface)',
              color: inStockOnly ? 'var(--color-primary)' : 'var(--text-secondary)',
              border: inStockOnly ? '1.5px solid var(--color-primary)' : '1px solid var(--border-subtle)',
            }}
          >
            ⚡ Sirf In-Stock
          </button>
        )}
      </div>

      {/* Content Feed */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '10px' }}>🧭</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Aas-paas ki live dukaanein aur maal khoja jaa raha hai...</div>
        </div>
      ) : searchMode === 'shops' ? (
        /* SHOPS RESPONSIVE GRID */
        filteredShops.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', borderRadius: 'var(--radius-lg)' }}>
            <Store size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px auto', opacity: 0.6 }} />
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Koi Nazdeeki Dukan Nahi Mili</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Upar diye gaye Radius ko badhayein (e.g. 5km ya 10km) ya category filter hata kar dekhein.
            </p>
          </div>
        ) : (
          <div className="customer-shop-grid">
            {filteredShops.map((s) => {
              const distKm = calculateDistanceKm(coords?.lat, coords?.lng, s.latitude, s.longitude);
              const saved = isShopSaved(s.id);
              const hasBanner = Array.isArray(s.banners) && s.banners.length > 0 && s.banners[0];

              return (
                <div
                  key={s.id}
                  className="card card-clickable"
                  onClick={() => setInspectedShop(s)}
                  style={{
                    margin: 0,
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Shop Banner Preview */}
                  {hasBanner && (
                    <div
                      style={{
                        margin: '-16px -16px 0 -16px',
                        height: '110px',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={getImageUrl(s.banners[0])}
                        alt={s.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                      />
                    </div>
                  )}

                  {/* Shop Identity Row */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {s.logo_url ? (
                        <img
                          src={getImageUrl(s.logo_url)}
                          alt={s.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <Store size={32} />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <h3 style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                            {s.name}
                          </h3>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', background: 'var(--bg-surface-subtle)', padding: '2px 8px', borderRadius: '6px' }}>
                              🏪 {s.category || 'General Store'}
                            </span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '2px 7px', borderRadius: '6px' }}>
                              ✓ Verified
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveShop(s);
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
                          title="Bookmark shop"
                        >
                          <Heart size={20} color={saved ? '#ef4444' : 'var(--text-muted)'} fill={saved ? '#ef4444' : 'none'} />
                        </button>
                      </div>

                      {/* Status & Timing */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: s.is_active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: s.is_active ? '#065f46' : '#991b1b',
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.is_active ? '#10b981' : '#ef4444' }} />
                          {s.is_active ? 'OPEN NOW' : 'CLOSED'}
                        </span>

                        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} color="var(--text-muted)" />
                          {s.opening_time || '09:00'} - {s.closing_time || '21:00'}
                        </span>
                      </div>

                      {/* Location & GPS distance */}
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                        <MapPin size={13} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {[s.address, s.city].filter(Boolean).join(', ') || 'Local Store'}
                        </span>
                        {distKm != null && (
                          <span style={{ fontWeight: 800, color: 'var(--color-primary)', flexShrink: 0 }}>
                            • {formatDistance(distKm)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      padding: '6px 10px',
                      background: 'var(--bg-surface-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      alignItems: 'center',
                    }}
                  >
                    <span>⚡ 30-Min Counter Pickup</span>
                    <span>•</span>
                    <span>✓ Live Stock</span>
                    {s.phone && (
                      <>
                        <span>•</span>
                        <span>💬 WhatsApp</span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {s.phone && (
                      <a
                        href={`tel:${s.phone}`}
                        className="btn btn-secondary btn-sm"
                        style={{
                          flex: 0.8,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          textDecoration: 'none',
                        }}
                      >
                        <Phone size={13} /> Call
                      </a>
                    )}

                    <button
                      onClick={() => navigate(`/shop/${s.slug}`)}
                      className="btn btn-primary btn-sm"
                      style={{
                        flex: 1.2,
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Storefront</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* PRODUCTS RESPONSIVE GRID (MULTICOLUMN CARDS) */
        filteredProducts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', borderRadius: 'var(--radius-lg)' }}>
            <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px auto', opacity: 0.6 }} />
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Koi Product Nahi Mila</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Dusre product name ya category filter se search karein.
            </p>
          </div>
        ) : (
          <div className="customer-product-grid">
            {filteredProducts.map((p) => {
              const saved = isProductSaved(p.id);
              const stock = Number(p.stock_quantity ?? p.inventory?.available_quantity ?? p.inventory?.quantity ?? 0);
              const inStock = stock > 0;
              const hasDiscount = p.compare_price && p.compare_price > p.price;
              const discountPct = hasDiscount ? Math.round(((p.compare_price - p.price) / p.compare_price) * 100) : 0;
              const brand = p.attributes?.brand || p.attributes?.company;
              const allowBargain = p.allow_bargain !== false;

              return (
                <div
                  key={p.id}
                  className="card card-clickable"
                  onClick={() => setInspectedProduct(p)}
                  style={{
                    margin: 0,
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                >
                  {/* Top Image Box */}
                  <div
                    style={{
                      width: '100%',
                      height: '160px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      overflow: 'hidden',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '10px',
                    }}
                  >
                    {p.images && p.images[0] ? (
                      <img
                        src={getImageUrl(p.images[0])}
                        alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <Package size={44} color="var(--text-muted)" style={{ opacity: 0.35 }} />
                    )}

                    {/* Stock Status Badge */}
                    <span
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: inStock ? 'rgba(16, 185, 129, 0.92)' : 'rgba(239, 68, 68, 0.92)',
                        color: '#ffffff',
                      }}
                    >
                      {inStock ? `${stock} in stock` : 'Out of stock'}
                    </span>

                    {/* Bookmark heart */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveProduct(p);
                      }}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        background: 'rgba(255,255,255,0.85)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      title="Save product"
                    >
                      <Heart size={16} color={saved ? '#ef4444' : '#64748b'} fill={saved ? '#ef4444' : 'none'} />
                    </button>
                  </div>

                  {/* Product Metadata */}
                  <div>
                    {brand && (
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
                        {brand}
                      </div>
                    )}
                    <h4
                      style={{
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        margin: 0,
                        color: 'var(--text-primary)',
                        lineHeight: 1.25,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '2.4em',
                      }}
                    >
                      {p.name}
                    </h4>

                    {/* Shop Name */}
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                      <Store size={12} color="var(--text-muted)" />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.shop_name || 'Verified Store'}
                      </span>
                    </div>

                    {/* Price & Savings */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 900, color: 'var(--color-primary)', fontSize: '1.15rem' }}>
                        ₹{p.price}
                      </span>
                      {hasDiscount && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          ₹{p.compare_price}
                        </span>
                      )}
                      {hasDiscount && (
                        <span style={{ fontSize: '0.68rem', color: '#15803d', fontWeight: 800, background: '#dcfce7', padding: '1px 5px', borderRadius: '4px' }}>
                          {discountPct}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Bhav-Taav indicator */}
                  <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setInspectedProduct(p)}
                      className="btn btn-primary btn-sm"
                      style={{
                        flex: 1,
                        fontSize: '0.76rem',
                        padding: '6px 10px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      {allowBargain && inStock ? (
                        <>
                          <Sparkles size={13} />
                          <span>Bhav-Taav</span>
                        </>
                      ) : (
                        <>
                          <Eye size={13} />
                          <span>Hold / View</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Product Detail Modal (With Bhav-Taav Negotiation & Notify Me) */}
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

      {/* Floating "Ask Pick (AI Shopping Co-Pilot)" Button */}
      <button
        onClick={() => setIsCopilotOpen(true)}
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
        <Bot size={18} />
        <span>Ask Pick (AI)</span>
      </button>

      {/* Co-Pilot Modal */}
      <CustomerCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </AppLayout>
  );
};
