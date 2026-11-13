import React, { memo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Package, Store } from 'lucide-react';
import { getImageUrl, extractFirstImage } from '../../utils/imageUrl';
import { formatCurrency } from '../../utils/format';
import LanguageContext from '../../context/LanguageContext';
import { LocationContext } from '../../context/LocationContext';
import { calculateDistanceKm, formatDistance } from '../../utils/distance';
import { highlightMatch } from '../../utils/searchHelpers';

/**
 * ProductCard Component for Hyperlocal Commerce Platform
 * 
 * Layout Hierarchy:
 * 1. Product Image: Fixed 1:1 aspect ratio, rounded corners, top-left discount badge, top-right wishlist button
 * 2. Availability Row: Green pulse dot + "Available Now" (small, lightweight)
 * 3. Product Name: Max 2 lines with strong readability
 * 4. Price Section: Bold current price, strikethrough original price, green savings amount
 * 5. Local Store Information: Store name + verified checkmark + distance from user
 * 6. Action Section: Primary [ Reserve ] CTA & Secondary [ Compare Prices ] CTA
 */
const ProductCardInner = ({
  product,
  isSaved = false,
  onToggleSave,
  onClick,
  highlightQuery = '',
  shopName,
  shopSlug,
  onReserve,
  onCompare,
}) => {
  const navigate = useNavigate();
  const langContext = useContext(LanguageContext);
  const isHindi = langContext?.isHindi ?? false;
  const locationContext = useContext(LocationContext);
  const coords = locationContext?.coords ?? null;

  const p = product || {};

  // Stock & Availability calculation
  const rawStock =
    p.available_quantity ??
    p.stock_quantity ??
    p.inventory?.available_quantity ??
    p.inventory?.quantity ??
    p.stock ??
    (p.is_available === false ? 0 : null);
  const stock = rawStock == null ? null : Number(rawStock);
  const hasStockData = stock !== null && Number.isFinite(stock);
  const isAvailabilityKnown = hasStockData || typeof p.is_available === 'boolean';
  const inStock = hasStockData
    ? stock > 0 && p.is_available !== false
    : p.is_available === true;
  const availabilityClass = !isAvailabilityKnown
    ? 'unknown-stock'
    : inStock
    ? ''
    : 'out-of-stock';

  // Price & Savings calculation
  const mrp = Number(p.compare_price || p.mrp || 0);
  const price = Number(p.price || 0);
  const isPricePublic =
    p.is_price_public !== false &&
    p.isPricePublic !== false &&
    p.attributes?.is_price_public !== false &&
    p.attributes?.is_price_public !== 'false' &&
    price > 0 &&
    !p.hide_price;

  const hasDiscount = isPricePublic && mrp > price;
  const savings = hasDiscount ? mrp - price : 0;
  const discountPct = hasDiscount ? Math.round((savings / mrp) * 100) : 0;

  // Product Image extraction
  const firstImage = extractFirstImage(p.images || p.image || p.image_url);

  // Store Name & Verified Badge
  const storeName =
    shopName ||
    p.shop_name ||
    p.shop?.name ||
    p.store_name ||
    '';

  const isVerified =
    p.is_verified ??
    p.shop?.is_verified ??
    p.shop_verified ??
    p.is_shop_verified;

  // Hyperlocal Distance Calculation
  let displayDistance = p.distance_text;
  if (!displayDistance) {
    if (p.distance_meters != null && !isNaN(p.distance_meters)) {
      displayDistance = `${Math.round(p.distance_meters)}m away`;
    } else if (p.distance_km != null && !isNaN(p.distance_km)) {
      displayDistance = formatDistance(Number(p.distance_km));
    } else if (typeof p.distance === 'number') {
      displayDistance = formatDistance(p.distance);
    } else if (typeof p.distance === 'string' && p.distance.trim()) {
      displayDistance = p.distance;
    } else if (
      coords?.lat != null &&
      coords?.lng != null &&
      (p.shop_latitude ?? p.shop?.latitude) != null &&
      (p.shop_longitude ?? p.shop?.longitude) != null
    ) {
      const d = calculateDistanceKm(
        coords.lat,
        coords.lng,
        p.shop_latitude ?? p.shop?.latitude,
        p.shop_longitude ?? p.shop?.longitude
      );
      if (d != null) {
        displayDistance = formatDistance(d);
      }
    }
  }

  if (isHindi && displayDistance?.includes('away')) {
    displayDistance = displayDistance.replace('away', 'दूर');
  }

  // Navigation & Action Handlers
  const targetSlug = shopSlug || p.shop_slug || p.shop?.slug;

  const handleCardClick = () => {
    if (onClick) {
      onClick(p);
      return;
    }
    if (p.id) {
      const path = targetSlug
        ? `/shop/${targetSlug}/product/${p.id}`
        : `/product/${p.id}`;
      navigate(path, { state: { product: p } });
    }
  };

  const handleCompare = (e) => {
    e.stopPropagation();
    if (onCompare) {
      onCompare(p);
      return;
    }
    // Dispatch global smart search event for live price comparison
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('shopsilo:open-smart-search', {
          detail: { query: p.name, product: p },
        })
      );
    }
    navigate(`/explore?search=${encodeURIComponent(p.name || '')}&compare=true`, {
      state: { compareProduct: p, searchTerm: p.name },
    });
  };

  const handleReserve = (e) => {
    e.stopPropagation();
    if (!inStock) return;
    if (onReserve) {
      onReserve(p);
      return;
    }
    if (p.id) {
      const path = targetSlug
        ? `/shop/${targetSlug}/product/${p.id}`
        : `/product/${p.id}`;
      navigate(path, {
        state: { product: p, autoReserve: true },
      });
      return;
    }
    if (onClick) {
      onClick(p);
      return;
    }
  };

  return (
    <div
      className="product-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={[p.name || (isHindi ? 'उत्पाद' : 'Product'), storeName].filter(Boolean).join(' - ')}
    >
      <div>
        {/* 1. Product Image */}
        <div className="product-card-image-box">
          {firstImage ? (
            <img
              src={getImageUrl(firstImage)}
              alt={p.name || 'Product'}
              loading="lazy"
              decoding="async"
              className="product-card-image"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                const fallback = parent?.querySelector('.product-card-fallback-pkg');
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="product-card-fallback-pkg"
            style={{
              display: firstImage ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <Package size={34} color="#94a3b8" style={{ opacity: 0.35 }} />
          </div>

          {/* Small discount badge on top-left */}
          {hasDiscount && discountPct > 0 && (
            <span className="product-card-discount-badge">
              {discountPct}% OFF
            </span>
          )}

          {/* Wishlist button on top-right */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave?.(p);
            }}
            className="product-card-wishlist-btn"
            aria-label={
              isSaved
                ? (isHindi ? 'पसंदीदा से हटाएं' : 'Remove from wishlist')
                : (isHindi ? 'पसंदीदा में जोड़ें' : 'Save to wishlist')
            }
            title={isSaved ? (isHindi ? 'पसंदीदा में सहेजा गया' : 'Saved') : (isHindi ? 'पसंदीदा में जोड़ें' : 'Save')}
          >
            <Heart
              size={14}
              color={isSaved ? '#ef4444' : '#64748b'}
              fill={isSaved ? '#ef4444' : 'none'}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* 2. Availability Row */}
        <div className="product-card-availability">
          <span className={`product-card-avail-dot ${availabilityClass}`} />
          <span className={`product-card-avail-text ${availabilityClass}`}>
            {inStock
              ? (isHindi ? 'अभी उपलब्ध' : 'In stock')
              : isAvailabilityKnown
              ? (isHindi ? 'स्टॉक खत्म' : 'Out of stock')
              : (isHindi ? 'स्टॉक की पुष्टि करें' : 'Check availability')}
          </span>
        </div>

        {/* 3. Product Name (Max 2 lines, high readability) */}
        <h3 className="product-card-name" title={p.name}>
          {highlightQuery ? highlightMatch(p.name, highlightQuery) : p.name}
        </h3>

        {/* 4. Price Section */}
        <div className="product-card-price-section">
          {isPricePublic ? (
            <>
              <div className="product-card-price-row">
                <span className="product-card-price">
                  {formatCurrency(price)}
                </span>
                {hasDiscount && (
                  <span className="product-card-mrp">
                    {formatCurrency(mrp)}
                  </span>
                )}
              </div>
              {hasDiscount && savings > 0 && (
                <span className="product-card-savings">
                  {isHindi ? `₹${Math.round(savings)} बचत` : `Save ₹${Math.round(savings)}`}
                </span>
              )}
            </>
          ) : (
            <div className="product-card-price-row">
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#d97706' }}>
                {isHindi ? 'रेट पूछें' : 'Ask Price'}
              </span>
            </div>
          )}
        </div>

        {/* 5. Local Store Information */}
        {(storeName || isVerified === true || displayDistance) && (
          <div className="product-card-store-box">
            {storeName && (
              <div className="product-card-store-name-row">
                <span className="product-card-store-icon" aria-hidden="true"><Store size={13} /></span>
                <span className="product-card-store-name" title={storeName}>
                  {storeName}
                </span>
                {isVerified === true && (
                  <span
                    className="product-card-verified-badge"
                    title={isHindi ? 'सत्यापित दुकान' : 'Verified store'}
                    aria-label={isHindi ? 'सत्यापित दुकान' : 'Verified store'}
                  >
                    ✓
                  </span>
                )}
              </div>
            )}
            {displayDistance && (
              <div className="product-card-distance-row">
                <span className="product-card-distance-icon" aria-hidden="true"><MapPin size={12} /></span>
                <span className="product-card-distance-text">{displayDistance}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. Action Section */}
      <div className="product-card-actions">
        {/* Secondary CTA: Compare Prices */}
        <button
          type="button"
          className="product-card-btn-compare"
          onClick={handleCompare}
          aria-label={isHindi ? `${p.name} की कीमतें तुलना करें` : `Compare prices for ${p.name}`}
          title={isHindi ? 'आस-पास की दुकानों में कीमतें तुलना करें' : 'Compare prices across nearby shops'}
        >
          <span className="product-card-btn-compare-label-desktop">
            {isHindi ? 'कीमत तुलना' : 'Compare Prices'}
          </span>
          <span className="product-card-btn-compare-label-mobile">
            {isHindi ? 'तुलना' : 'Compare'}
          </span>
        </button>

        {/* Primary CTA: Reserve */}
        <button
          type="button"
          className="product-card-btn-reserve"
          onClick={inStock ? handleReserve : isAvailabilityKnown ? handleReserve : handleCardClick}
          disabled={isAvailabilityKnown && !inStock}
          aria-label={
            inStock
              ? (isHindi ? `${p.name} को रिज़र्व करें` : `Reserve ${p.name}`)
              : isAvailabilityKnown
              ? (isHindi ? `${p.name} का स्टॉक खत्म है` : `${p.name} is out of stock`)
              : (isHindi ? `${p.name} का विवरण देखें` : `View details for ${p.name}`)
          }
          title={isHindi ? 'दुकान से पिकअप रिज़र्व करें' : 'Reserve for in-store pickup'}
        >
          {inStock
            ? (isHindi ? 'रिज़र्व करें' : 'Reserve')
            : isAvailabilityKnown
            ? (isHindi ? 'स्टॉक नहीं' : 'Out of stock')
            : (isHindi ? 'विवरण देखें' : 'View details')}
        </button>
      </div>
    </div>
  );
};

export const ProductCard = memo(ProductCardInner);
export default ProductCard;
