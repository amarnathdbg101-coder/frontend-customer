/**
 * NearbyShopsComparison Component
 *
 * Dedicated Winner Card Showcase for Best Value Local Store (#1 Lowest Price & Shortest Distance).
 * Displays "🏆 Best Value", "Lowest Price", "Shortest Distance", "You Save ₹XX",
 * 210px Store Cover Photo, and 1-tap Reserve CTA.
 * Other stores appear below in lower visual priority.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  ShieldCheck,
  CheckCircle,
  MapPin,
  Clock,
  Store,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { productApi } from '../../api/product.api';
import { useLanguage } from '../../context/LanguageContext';
import { calculateDistanceKm, formatTravelTime } from '../../utils/distance';
import { getImageUrl } from '../../utils/imageUrl';

// Helper to extract product array safely from API responses
const extractArray = (res, key) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res[key])) return res[key];
  if (res.data && Array.isArray(res.data[key])) return res.data[key];
  if (res.data && Array.isArray(res.data)) return res.data;
  if (res.data && res.data.data && Array.isArray(res.data.data[key])) return res.data.data[key];
  return [];
};

export const NearbyShopsComparison = ({
  product,
  currentShop = null,
  onReserve = null,
  coords = null,
}) => {
  const navigate = useNavigate();
  const { isHindi } = useLanguage();

  const [nearbyListings, setNearbyListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadNearbyShopPrices() {
      if (!product) return;
      try {
        setLoading(true);
        const barcode = product.barcode ? product.barcode.trim() : '';
        const name = product.name ? product.name.trim() : '';

        // Query nearby products by barcode first, fallback to name
        let raw = [];
        if (barcode && barcode.length >= 6) {
          const res = await productApi.listProducts({ barcode, limit: 10 });
          raw = extractArray(res, 'products');
        }
        if (raw.length <= 1 && name) {
          const res2 = await productApi.listProducts({ q: name, limit: 10 });
          const raw2 = extractArray(res2, 'products');
          const existingShopIds = new Set(raw.map((p) => p.shop_id || p.shopId || p.shop?.id));
          for (const item of raw2) {
            const sId = item.shop_id || item.shopId || item.shop?.id;
            if (sId && !existingShopIds.has(sId)) {
              raw.push(item);
              existingShopIds.add(sId);
            }
          }
        }

        if (!isMounted) return;

        // Process listings and compute distance & price
        const processed = raw.map((item) => {
          const itemPrice = Number(item.price || item.selling_price || 0);
          const itemMrp = Number(item.compare_price || item.mrp || 0);
          const shopName = item.shop_name || item.shop?.name || (isHindi ? 'स्थानीय दुकान' : 'Local Shop');
          const shopSlug = item.shop_slug || item.shop?.slug || '';
          const sLat = item.shop_latitude || item.shop?.latitude;
          const sLng = item.shop_longitude || item.shop?.longitude;

          const distKm = (sLat && sLng && coords?.lat && coords?.lng)
            ? calculateDistanceKm(coords.lat, coords.lng, sLat, sLng)
            : null;
          const travel = distKm !== null ? formatTravelTime(distKm, isHindi) : null;

          return {
            ...item,
            id: item.id || item.product_id,
            price: itemPrice,
            comparePrice: itemMrp,
            shopName,
            shopSlug,
            distKm,
            travel,
            isCurrent: currentShop && (currentShop.slug === shopSlug || currentShop.name === shopName),
          };
        });

        // Filter valid price items & sort by price ascending
        const validListings = processed.filter((item) => item.price > 0);
        validListings.sort((a, b) => a.price - b.price);

        setNearbyListings(validListings);
      } catch (err) {
        console.warn('Nearby shop price comparison load error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadNearbyShopPrices();

    return () => {
      isMounted = false;
    };
  }, [product?.id, product?.barcode, product?.name, coords?.lat, coords?.lng, currentShop?.slug, isHindi]);

  if (loading || nearbyListings.length <= 1) {
    return null; // Only render when 2 or more shops offer this product
  }

  // Rank #1: Winner Store (Best Value)
  const bestShop = nearbyListings[0];
  const otherShops = nearbyListings.slice(1);

  // Highest price among all shops or MRP
  const highestPrice = Math.max(
    ...nearbyListings.map((item) => item.price),
    bestShop.comparePrice || bestShop.price
  );
  const savingsAmount = Math.max(0, highestPrice - bestShop.price);

  const storeLogo = bestShop.photo || bestShop.banner || (Array.isArray(bestShop.banners) && bestShop.banners[0]) || bestShop.logo_url || '';
  const storePhoto = bestShop.photo || bestShop.banner || (Array.isArray(bestShop.banners) && bestShop.banners[0]) || bestShop.logo_url || '';
  const storeIsOpen = bestShop.is_open !== false && bestShop.isCurrentlyOpen !== false;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface, #ffffff)',
        border: '1.5px solid var(--border-subtle, #e2e8f0)',
        borderRadius: '18px',
        padding: '16px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
        marginTop: '16px',
      }}
    >
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              padding: '6px',
              backgroundColor: '#f0fdf4',
              borderRadius: '8px',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
              {isHindi ? 'आस-पास की दुकानों में दामों की तुलना' : 'Compare Nearby Shop Prices'}
            </h3>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)', marginTop: '2px' }}>
              {isHindi ? 'सबसे कम दाम और सबसे नजदीकी दुकान से रिज़र्व करें' : 'Instantly find the best deal near you'}
            </div>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#047857',
            backgroundColor: '#dcfce7',
            padding: '3px 9px',
            borderRadius: '12px',
          }}
        >
          {nearbyListings.length} {isHindi ? 'दुकानें' : 'Stores'}
        </span>
      </div>

      {/* ================= 🏆 DEDICATED WINNER CARD (BEST VALUE STORE) ================= */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#f0fdf4',
          border: '2px solid #10b981',
          borderRadius: '18px',
          padding: '16px',
          marginBottom: otherShops.length > 0 ? '16px' : '0',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.18)',
          overflow: 'hidden',
        }}
      >
        {/* Floating Winner Badges Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontSize: '0.76rem',
                fontWeight: 900,
                padding: '4px 11px',
                borderRadius: '20px',
                letterSpacing: '0.3px',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
              }}
            >
              🏆 {isHindi ? 'सर्वोत्तम विकल्प (Best Value)' : 'Best Value'}
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                backgroundColor: '#bbf7d0',
                color: '#065f46',
                fontSize: '0.70rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '12px',
              }}
            >
              <Zap size={11} fill="#059669" color="#059669" />
              <span>{isHindi ? 'सबसे कम दाम' : 'Lowest Price'}</span>
            </span>
          </div>

          {/* You Save ₹XX Highlight Badge */}
          {savingsAmount > 0 && (
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 900,
                color: '#15803d',
                backgroundColor: '#dcfce7',
                border: '1.5px solid #86efac',
                padding: '4px 10px',
                borderRadius: '10px',
                boxShadow: '0 1px 4px rgba(21, 128, 61, 0.12)',
              }}
            >
              {isHindi ? `आप बचाते हैं ₹${savingsAmount.toFixed(0)}` : `You Save ₹${savingsAmount.toFixed(0)}`}
            </span>
          )}
        </div>

        {/* Store Header Row: Logo + Store Name + Verified Badge + Open/Closed Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          {/* Store Logo Avatar */}
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #a7f3d0',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {storeLogo ? (
              <img src={getImageUrl(storeLogo)} alt={bestShop.shopName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Store size={22} color="#10b981" />
            )}
          </div>

          {/* Store Name & Verification & Distance */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h4 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0, color: '#064e3b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {bestShop.shopName}
              </h4>
              <ShieldCheck size={18} color="#10b981" style={{ flexShrink: 0 }} />
              {bestShop.isCurrent && (
                <span style={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: '#bbf7d0', color: '#166534', padding: '2px 6px', borderRadius: '4px' }}>
                  {isHindi ? 'यह दुकान' : 'Current'}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', marginTop: '3px' }}>
              <span style={{ fontWeight: 700, color: storeIsOpen ? '#15803d' : '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: storeIsOpen ? '#10b981' : '#dc2626' }} />
                {storeIsOpen ? (isHindi ? 'खुली है (Open Now)' : 'Open Now') : (isHindi ? 'बंद है' : 'Closed')}
              </span>
              <span style={{ color: '#047857' }}>•</span>
              <span style={{ color: '#047857', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <MapPin size={12} color="#10b981" />
                {bestShop.distKm !== null
                  ? `${bestShop.distKm < 1 ? `${Math.round(bestShop.distKm * 1000)}m` : `${bestShop.distKm.toFixed(1)} km`} away (${isHindi ? 'सबसे नजदीक' : 'Shortest Distance'})`
                  : (isHindi ? 'आस-पास' : 'Nearby')}
              </span>
            </div>
          </div>
        </div>

        {/* Store Cover Photo (Strongest Proof of Real Business - 210px Height) */}
        {storePhoto && (
          <div
            style={{
              width: '100%',
              height: '210px',
              borderRadius: '16px',
              overflow: 'hidden',
              marginTop: '12px',
              marginBottom: '12px',
              border: '1.5px solid #a7f3d0',
              position: 'relative',
              boxShadow: '0 4px 14px rgba(6, 78, 59, 0.12)',
            }}
          >
            <img
              src={getImageUrl(storePhoto)}
              alt={bestShop.shopName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(6, 78, 59, 0.75) 0%, rgba(6, 78, 59, 0.2) 50%, transparent 80%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '14px',
                right: '14px',
                color: '#ffffff',
                textShadow: '0 1px 4px rgba(0,0,0,0.7)',
              }}
            >
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  letterSpacing: '0.2px',
                }}
              >
                <Store size={16} color="#34d399" />
                <span>📍 Verified Counter Inventory • 100% Real Local Store</span>
              </div>
              <div style={{ fontSize: '0.72rem', opacity: 0.9, marginTop: '2px', fontWeight: 600 }}>
                {isHindi ? '🏬 शॉपसिलो फील्ड टीम द्वारा भौतिक रूप से सत्यापित काउंटर' : '🏬 Physical storefront verified with real counter presence'}
              </div>
            </div>
          </div>
        )}

        {/* Price & View Profile Link Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {isHindi ? 'बेस्ट काउंटर प्राइस' : 'BEST COUNTER PRICE'}
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#047857', lineHeight: 1 }}>
              ₹{bestShop.price.toFixed(0)}
            </div>
          </div>

          {bestShop.shopSlug && (
            <button
              type="button"
              onClick={() => navigate(`/shop/${bestShop.shopSlug}`)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#047857',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 0',
                textDecoration: 'underline',
              }}
            >
              <span>{isHindi ? 'दुकान प्रोफाइल देखें' : 'View Store Profile'}</span>
              <span>→</span>
            </button>
          )}
        </div>

        {/* Action Button & Risk-Free Reassurance */}
        <div style={{ paddingTop: '12px', borderTop: '1px dashed #a7f3d0' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                if (onReserve) {
                  onReserve({
                    product: bestShop,
                    quantity: 1,
                    hold_hours: 4,
                    notes: '',
                  });
                } else if (bestShop.shopSlug) {
                  navigate(`/shop/${bestShop.shopSlug}`);
                }
              }}
              style={{
                flex: 1,
                minWidth: '160px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '0.90rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 3px 10px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>⚡ {isHindi ? 'अभी मुफ़्त रिज़र्व करें' : 'Reserve Now'}</span>
            </button>

            {bestShop.shopSlug && (
              <button
                type="button"
                onClick={() => navigate(`/shop/${bestShop.shopSlug}`)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid #a7f3d0',
                  backgroundColor: '#ffffff',
                  color: '#047857',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{isHindi ? 'दुकान देखें' : 'View Store'}</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          <div style={{ fontSize: '0.72rem', color: '#065f46', marginTop: '8px', textAlign: 'center', fontWeight: 600 }}>
            🛡️ No advance payment required. Pickup directly from store.
          </div>
        </div>
      </div>

      {/* ================= 🏪 OTHER NEARBY SHOPS (LOWER VISUAL PRIORITY) ================= */}
      {otherShops.length > 0 && (
        <div>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: 'var(--text-muted, #94a3b8)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px',
            }}
          >
            {isHindi ? 'अन्य आस-पास की दुकानें (Other Stores)' : 'Other Nearby Stores'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {otherShops.map((other) => {
              const diffPrice = other.price - bestShop.price;

              return (
                <div
                  key={other.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                    border: '1px solid var(--border-subtle, #e2e8f0)',
                    borderRadius: '12px',
                    gap: '10px',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                        {other.shopName}
                      </span>
                      {other.isCurrent && (
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, backgroundColor: '#e2e8f0', color: '#475569', padding: '1px 5px', borderRadius: '4px' }}>
                          Current
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #64748b)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <MapPin size={11} color="var(--text-muted)" />
                      <span>
                        {other.distKm !== null
                          ? `${other.distKm < 1 ? `${Math.round(other.distKm * 1000)}m` : `${other.distKm.toFixed(1)} km`} away`
                          : (isHindi ? 'आस-पास' : 'Nearby')}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
                        ₹{other.price.toFixed(0)}
                      </div>
                      {diffPrice > 0 && (
                        <div style={{ fontSize: '0.65rem', color: '#dc2626', fontWeight: 700 }}>
                          +₹{diffPrice.toFixed(0)} more
                        </div>
                      )}
                    </div>

                    {other.shopSlug && (
                      <button
                        type="button"
                        onClick={() => navigate(`/shop/${other.shopSlug}`)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle, #cbd5e1)',
                          backgroundColor: 'var(--bg-surface, #ffffff)',
                          color: 'var(--text-primary, #0f172a)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {isHindi ? 'देखें' : 'View'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NearbyShopsComparison;
