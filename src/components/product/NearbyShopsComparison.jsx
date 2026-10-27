/**
 * NearbyShopsComparison Component
 *
 * High-converting, instant decision-making Price Comparison Showcase.
 * Highlights the Best Value Local Store (#1 Lowest Price) with a Hero Card,
 * "🏆 Best Price" badge, "You Save ₹XX" calculations, distance, and 1-tap Reserve.
 * Renders other nearby stores below in lower visual priority.
 */

import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowRight,
} from 'lucide-react';
import { productApi } from '../../api/product.api';
import { useLanguage } from '../../context/LanguageContext';
import { calculateDistanceKm, formatTravelTime } from '../../utils/distance';
import { formatCurrency } from '../../utils/format';

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
          // Deduplicate by shop ID
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

        // Filter valid price items & sort by price ascending (Lowest price first)
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

  // Rank #1: Best Price Shop
  const bestShop = nearbyListings[0];
  const otherShops = nearbyListings.slice(1);

  // Highest price among all shops or MRP
  const highestPrice = Math.max(
    ...nearbyListings.map((item) => item.price),
    bestShop.comparePrice || bestShop.price
  );
  const savingsAmount = Math.max(0, highestPrice - bestShop.price);

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
      {/* Header */}
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

      {/* ================= 🏆 RANK #1 BEST PRICE HERO CARD ================= */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#f0fdf4',
          border: '2px solid #10b981',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: otherShops.length > 0 ? '14px' : '0',
          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)',
          overflow: 'hidden',
        }}
      >
        {/* Top Floating Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: '#10b981',
            color: '#ffffff',
            fontSize: '0.72rem',
            fontWeight: 900,
            padding: '4px 10px',
            borderRadius: '20px',
            letterSpacing: '0.3px',
            marginBottom: '10px',
            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
          }}
        >
          <span>🏆 {isHindi ? 'सबसे कम दाम (Best Price)' : 'Best Price'}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            {/* Store Name & Verification */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h4 style={{ fontSize: '1.08rem', fontWeight: 800, margin: 0, color: '#064e3b' }}>
                {bestShop.shopName}
              </h4>
              <ShieldCheck size={17} color="#10b981" />
              {bestShop.isCurrent && (
                <span style={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: '#bbf7d0', color: '#166534', padding: '2px 6px', borderRadius: '4px' }}>
                  {isHindi ? 'यह दुकान' : 'Current'}
                </span>
              )}
            </div>

            {/* Distance & Travel Time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#047857', marginTop: '4px', fontWeight: 600 }}>
              <MapPin size={12} color="#10b981" />
              <span>
                {bestShop.distKm !== null
                  ? `${bestShop.distKm < 1 ? `${Math.round(bestShop.distKm * 1000)}m` : `${bestShop.distKm.toFixed(1)} km`} away`
                  : (isHindi ? 'आस-पास' : 'Nearby')}
                {bestShop.travel?.timeStr ? ` (${bestShop.travel.timeStr})` : ''}
              </span>
            </div>
          </div>

          {/* Big Bold Best Price & Savings Pill */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#047857', lineHeight: 1 }}>
              ₹{bestShop.price.toFixed(0)}
            </div>

            {savingsAmount > 0 && (
              <div
                style={{
                  display: 'inline-block',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#15803d',
                  backgroundColor: '#dcfce7',
                  border: '1px solid #86efac',
                  padding: '2px 7px',
                  borderRadius: '6px',
                  marginTop: '4px',
                }}
              >
                {isHindi ? `आप बचाते हैं ₹${savingsAmount.toFixed(0)}` : `You Save ₹${savingsAmount.toFixed(0)}`}
              </div>
            )}
          </div>
        </div>

        {/* Action Button & Risk-Free Reassurance */}
        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #a7f3d0' }}>
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
                padding: '11px 16px',
                fontSize: '0.88rem',
                fontWeight: 800,
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
                  padding: '11px 14px',
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

          <div style={{ fontSize: '0.72rem', color: '#065f46', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <ShieldCheck size={13} color="#10b981" />
            <span>{isHindi ? 'कोई अग्रिम भुगतान नहीं • दुकान काउंटर पर सामान देखकर सीधा भुगतान करें' : 'No advance payment • Pay directly at store counter'}</span>
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
            {isHindi ? 'अन्य आस-पास की दुकानें' : 'Other Nearby Stores'}
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
