/**
 * SearchResultHeader Component
 *
 * Compact Search Results Experience:
 * 1. Compact Comparison Strip ("Found in X nearby shops • Save up to ₹XX")
 * 2. Ultra-Compact 1-Row Filter Pills Bar (No-wrap horizontal scroll: Distance, Price, Availability, Rating)
 * 3. Default Sorting: "Best Match"
 * 4. Space-optimized to eliminate excessive scrolling
 */

import React, { useMemo } from 'react';
import {
  Sparkles,
  MapPin,
  Coins,
  CheckCircle2,
  Star,
  ChevronRight,
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

  // HIDE FILTER PILLS BAR ON HOMEPAGE DEFAULT VIEW (Only show when searching)
  if (!isSearching) {
    return null;
  }

  return (
    <div style={{ marginBottom: '8px' }}>
      {/* ================= 1. COMPACT COMPARISON BANNER ================= */}
      {isSearching && uniqueShopCount >= 2 && (
        <div
          style={{
            margin: '6px 0 8px 0',
            padding: '6px 10px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '10px',
            boxShadow: '0 1px 4px rgba(16, 185, 129, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
            <Sparkles size={14} color="#10b981" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#064e3b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <span>{isHindi ? `पास की ${uniqueShopCount} दुकानों में उपलब्ध` : `Found in ${uniqueShopCount} nearby shops`}</span>
              {maxSavings > 0 && (
                <span style={{ fontWeight: 600, color: '#047857', marginLeft: '6px', fontSize: '0.74rem' }}>
                  ({isHindi ? `बचत ₹${maxSavings.toFixed(0)} तक` : `Save up to ₹${maxSavings.toFixed(0)}`})
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenCompare?.()}
            style={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '4px 9px',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 4px rgba(16, 185, 129, 0.2)',
            }}
          >
            <span>{isHindi ? 'तुलना करें' : 'Compare'}</span>
            <ChevronRight size={12} />
          </button>
        </div>
      )}

      {/* ================= 2. ULTRA-COMPACT 1-ROW FILTER PILLS (NO-WRAP HORIZONTAL SCROLL) ================= */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '2px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          flexWrap: 'nowrap',
          WebkitOverflowScrolling: 'touch',
        }}
        role="region"
        aria-label="Search Filter Controls"
      >
        {/* Sort: Default Best Match */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy?.(e.target.value)}
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '4px 8px',
              borderRadius: '16px',
              backgroundColor: sortBy === 'relevant' ? 'var(--color-primary-light, #eff6ff)' : 'var(--bg-surface, #ffffff)',
              border: sortBy === 'relevant' ? '1.5px solid var(--color-primary, #2563eb)' : '1px solid var(--border-subtle, #e2e8f0)',
              color: sortBy === 'relevant' ? 'var(--color-primary, #2563eb)' : 'var(--text-primary, #0f172a)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="relevant">🎯 {isHindi ? 'सर्वश्रेष्ठ' : 'Best Match'}</option>
            <option value="nearest">📍 {isHindi ? 'सबसे पास' : 'Nearest'}</option>
            <option value="price_low">💰 {isHindi ? 'कम दाम' : 'Price: Low'}</option>
            <option value="price_high">💎 {isHindi ? 'ज्यादा दाम' : 'Price: High'}</option>
            <option value="discount">🔥 {isHindi ? 'बड़ी छूट' : 'Discount'}</option>
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
            gap: '4px',
            padding: '4px 9px',
            borderRadius: '16px',
            fontSize: '0.72rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            backgroundColor: radiusKm <= 5 ? 'var(--color-primary-light, #eff6ff)' : 'var(--bg-surface, #ffffff)',
            border: radiusKm <= 5 ? '1.5px solid var(--color-primary, #2563eb)' : '1px solid var(--border-subtle, #e2e8f0)',
            color: radiusKm <= 5 ? 'var(--color-primary, #2563eb)' : 'var(--text-primary, #0f172a)',
            cursor: 'pointer',
          }}
        >
          <MapPin size={11} />
          <span>{isHindi ? `${radiusKm}km` : `${radiusKm} km`}</span>
        </button>

        {/* Price Under ₹99 Filter Pill */}
        <button
          type="button"
          onClick={() => setQuickFilter?.(quickFilter === 'UNDER_99' ? 'ALL' : 'UNDER_99')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 9px',
            borderRadius: '16px',
            fontSize: '0.72rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            backgroundColor: quickFilter === 'UNDER_99' ? '#dcfce7' : 'var(--bg-surface, #ffffff)',
            border: quickFilter === 'UNDER_99' ? '1.5px solid #10b981' : '1px solid var(--border-subtle, #e2e8f0)',
            color: quickFilter === 'UNDER_99' ? '#15803d' : 'var(--text-primary, #0f172a)',
            cursor: 'pointer',
          }}
        >
          <Coins size={11} />
          <span>&lt; ₹99</span>
        </button>

        {/* Price ₹100 - ₹499 Filter Pill */}
        <button
          type="button"
          onClick={() => setQuickFilter?.(quickFilter === 'UNDER_499' ? 'ALL' : 'UNDER_499')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 9px',
            borderRadius: '16px',
            fontSize: '0.72rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            backgroundColor: quickFilter === 'UNDER_499' ? '#dcfce7' : 'var(--bg-surface, #ffffff)',
            border: quickFilter === 'UNDER_499' ? '1.5px solid #10b981' : '1px solid var(--border-subtle, #e2e8f0)',
            color: quickFilter === 'UNDER_499' ? '#15803d' : 'var(--text-primary, #0f172a)',
            cursor: 'pointer',
          }}
        >
          <Coins size={11} />
          <span>₹100 - ₹499</span>
        </button>

        {/* Price ₹500+ Filter Pill */}
        <button
          type="button"
          onClick={() => setQuickFilter?.(quickFilter === 'OVER_500' ? 'ALL' : 'OVER_500')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 9px',
            borderRadius: '16px',
            fontSize: '0.72rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            backgroundColor: quickFilter === 'OVER_500' ? '#dcfce7' : 'var(--bg-surface, #ffffff)',
            border: quickFilter === 'OVER_500' ? '1.5px solid #10b981' : '1px solid var(--border-subtle, #e2e8f0)',
            color: quickFilter === 'OVER_500' ? '#15803d' : 'var(--text-primary, #0f172a)',
            cursor: 'pointer',
          }}
        >
          <Coins size={11} />
          <span>₹500+</span>
        </button>

        {/* Availability Filter Pill */}
        <button
          type="button"
          onClick={() => setShowOpenOnly?.(!showOpenOnly)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 9px',
            borderRadius: '16px',
            fontSize: '0.72rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            backgroundColor: showOpenOnly ? '#dcfce7' : 'var(--bg-surface, #ffffff)',
            border: showOpenOnly ? '1.5px solid #10b981' : '1px solid var(--border-subtle, #e2e8f0)',
            color: showOpenOnly ? '#15803d' : 'var(--text-primary, #0f172a)',
            cursor: 'pointer',
          }}
        >
          <CheckCircle2 size={11} color={showOpenOnly ? '#10b981' : '#64748b'} />
          <span>{isHindi ? 'खुली दुकानें' : 'In Stock & Open'}</span>
        </button>

        {/* Shop Rating Filter Pill */}
        <button
          type="button"
          onClick={() => setMinRating?.(minRating >= 4 ? 0 : 4)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 9px',
            borderRadius: '16px',
            fontSize: '0.72rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            backgroundColor: minRating >= 4 ? '#fefce8' : 'var(--bg-surface, #ffffff)',
            border: minRating >= 4 ? '1.5px solid #eab308' : '1px solid var(--border-subtle, #e2e8f0)',
            color: minRating >= 4 ? '#854d0e' : 'var(--text-primary, #0f172a)',
            cursor: 'pointer',
          }}
        >
          <Star size={11} fill={minRating >= 4 ? '#eab308' : 'none'} color="#eab308" />
          <span>4.0+★</span>
        </button>
      </div>
    </div>
  );
};

export default SearchResultHeader;
