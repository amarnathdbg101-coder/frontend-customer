/**
 * SearchResultHeader Component
 *
 * Google Shopping + Google Maps Hybrid Search Results Experience:
 * 1. High-Impact Comparison Banner ("Found in X nearby shops - Compare prices and save up to ₹XX")
 * 2. Filter Pills Bar (Distance, Price, Availability, Shop Rating)
 * 3. Default Sorting: "Best Match"
 * 4. Fast reactivity (< 10 seconds decision flow)
 */

import React, { useMemo } from 'react';
import {
  Sparkles,
  MapPin,
  Coins,
  CheckCircle2,
  Star,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const SearchResultHeader = ({
  searchTerm = '',
  filteredProducts = [],
  filteredShops = [],
  radiusKm = 5,
  setRadiusKm,
  quickFilter = 'ALL',
  setQuickFilter,
  sortBy = 'relevant',
  setSortBy,
  showOpenOnly = false,
  setShowOpenOnly,
  minRating = 0,
  setMinRating,
  onOpenCompare,
  isHindi = false,
}) => {
  // Compute unique nearby shop count & max savings for comparison banner
  const { uniqueShopCount, maxSavings } = useMemo(() => {
    if (!filteredProducts || filteredProducts.length === 0) {
      return { uniqueShopCount: 0, maxSavings: 0 };
    }

    const shopIds = new Set();
    let minP = Infinity;
    let maxP = -Infinity;

    filteredProducts.forEach((p) => {
      const sId = p.shop_id || p.shopId || p.shop?.id || p.shop_name;
      if (sId) shopIds.add(sId);

      const price = Number(p.price || 0);
      const mrp = Number(p.compare_price || p.mrp || 0);
      if (price > 0) {
        if (price < minP) minP = price;
        if (price > maxP) maxP = price;
      }
      if (mrp > maxP) maxP = mrp;
    });

    const shopCount = Math.max(shopIds.size, filteredShops.length);
    const savings = (maxP > minP && isFinite(maxP) && isFinite(minP)) ? (maxP - minP) : 0;

    return { uniqueShopCount: shopCount, maxSavings: savings };
  }, [filteredProducts, filteredShops]);

  const isSearching = Boolean(searchTerm?.trim());

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* ================= 1. HIGH-IMPACT COMPARISON BANNER ================= */}
      {isSearching && uniqueShopCount >= 2 && (
        <div
          style={{
            margin: '12px 0 18px 0',
            padding: '14px 16px',
            backgroundColor: '#f0fdf4',
            border: '2px solid #10b981',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={20} />
            </div>

            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#064e3b' }}>
                {isHindi ? `पास की ${uniqueShopCount} दुकानों में उपलब्ध` : `Found in ${uniqueShopCount} nearby shops`}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 700, marginTop: '2px' }}>
                {maxSavings > 0
                  ? (isHindi ? `दामों की तुलना करें और ₹${maxSavings.toFixed(0)} तक बचाएं` : `Compare prices and save up to ₹${maxSavings.toFixed(0)}`)
                  : (isHindi ? 'पास की दुकानों के लाइव दाम तुलना करें' : 'Compare live prices across nearby stores')}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenCompare?.()}
            style={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 16px',
              fontSize: '0.82rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(16, 185, 129, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>{isHindi ? 'दाम तुलना करें' : 'Compare Prices'}</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* ================= 2. FILTER PILLS BAR (DISTANCE, PRICE, AVAILABILITY, RATING) ================= */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          flexWrap: 'wrap',
        }}
        role="region"
        aria-label="Search Filter Controls"
      >
        {/* Sort: Default Best Match */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase' }}>
            {isHindi ? 'क्रम:' : 'Sort:'}
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy?.(e.target.value)}
            style={{
              fontSize: '0.76rem',
              fontWeight: 800,
              padding: '5px 10px',
              borderRadius: '20px',
              backgroundColor: sortBy === 'relevant' ? 'var(--color-primary-light, #eff6ff)' : 'var(--bg-surface, #ffffff)',
              border: sortBy === 'relevant' ? '1.5px solid var(--color-primary, #2563eb)' : '1px solid var(--border-subtle, #e2e8f0)',
              color: sortBy === 'relevant' ? 'var(--color-primary, #2563eb)' : 'var(--text-primary, #0f172a)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="relevant">🎯 {isHindi ? 'सर्वश्रेष्ठ मिलान (Best Match)' : 'Best Match'}</option>
            <option value="nearest">📍 {isHindi ? 'सबसे नजदीक (Nearest)' : 'Nearest First'}</option>
            <option value="price_low">💰 {isHindi ? 'कम से ज्यादा दाम (Price Low)' : 'Price: Low to High'}</option>
            <option value="price_high">💎 {isHindi ? 'ज्यादा से कम दाम (Price High)' : 'Price: High to Low'}</option>
            <option value="discount">🔥 {isHindi ? 'सबसे बड़ी छूट (Discount)' : 'Highest Discount'}</option>
          </select>
        </div>

        {/* Distance Pill */}
        <button
          type="button"
          onClick={() => {
            const nextRad = radiusKm === 3 ? 5 : radiusKm === 5 ? 10 : 3;
            setRadiusKm?.(nextRad);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '0.76rem',
            fontWeight: 700,
            backgroundColor: radiusKm <= 5 ? 'var(--color-primary-light, #eff6ff)' : 'var(--bg-surface, #ffffff)',
            border: radiusKm <= 5 ? '1.5px solid var(--color-primary, #2563eb)' : '1px solid var(--border-subtle, #e2e8f0)',
            color: radiusKm <= 5 ? 'var(--color-primary, #2563eb)' : 'var(--text-primary, #0f172a)',
            cursor: 'pointer',
          }}
        >
          <MapPin size={12} />
          <span>{isHindi ? `दूरी: ${radiusKm}km` : `Distance: ${radiusKm} km`}</span>
        </button>

        {/* Price Under ₹99 Filter Pill */}
        <button
          type="button"
          onClick={() => setQuickFilter?.(quickFilter === 'UNDER_99' ? 'ALL' : 'UNDER_99')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '0.76rem',
            fontWeight: 700,
            backgroundColor: quickFilter === 'UNDER_99' ? '#dcfce7' : 'var(--bg-surface, #ffffff)',
            border: quickFilter === 'UNDER_99' ? '1.5px solid #10b981' : '1px solid var(--border-subtle, #e2e8f0)',
            color: quickFilter === 'UNDER_99' ? '#15803d' : 'var(--text-primary, #0f172a)',
            cursor: 'pointer',
          }}
        >
          <Coins size={12} />
          <span>{isHindi ? 'बजट < ₹99' : 'Under ₹99'}</span>
        </button>

        {/* Availability Filter Pill */}
        <button
          type="button"
          onClick={() => setShowOpenOnly?.(!showOpenOnly)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '0.76rem',
            fontWeight: 700,
            backgroundColor: showOpenOnly ? '#dcfce7' : 'var(--bg-surface, #ffffff)',
            border: showOpenOnly ? '1.5px solid #10b981' : '1px solid var(--border-subtle, #e2e8f0)',
            color: showOpenOnly ? '#15803d' : 'var(--text-primary, #0f172a)',
            cursor: 'pointer',
          }}
        >
          <CheckCircle2 size={12} color={showOpenOnly ? '#10b981' : '#64748b'} />
          <span>{isHindi ? 'सिर्फ खुली दुकानें' : 'In Stock & Open'}</span>
        </button>

        {/* Shop Rating Filter Pill */}
        <button
          type="button"
          onClick={() => setMinRating?.(minRating >= 4 ? 0 : 4)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '0.76rem',
            fontWeight: 700,
            backgroundColor: minRating >= 4 ? '#fefce8' : 'var(--bg-surface, #ffffff)',
            border: minRating >= 4 ? '1.5px solid #eab308' : '1px solid var(--border-subtle, #e2e8f0)',
            color: minRating >= 4 ? '#854d0e' : 'var(--text-primary, #0f172a)',
            cursor: 'pointer',
          }}
        >
          <Star size={12} fill={minRating >= 4 ? '#eab308' : 'none'} color="#eab308" />
          <span>4.0+★ {isHindi ? 'रेटेड' : 'Rated'}</span>
        </button>
      </div>
    </div>
  );
};

export default SearchResultHeader;
