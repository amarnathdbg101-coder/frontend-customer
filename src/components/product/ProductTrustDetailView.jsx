/**
 * ProductTrustDetailView Component
 *
 * Presents product information, available shop details, and pickup reservation actions.
 */

import React, { useState, useRef, useMemo, useEffect, useContext } from 'react';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Store,
  Maximize2,
  X,
  Share2,
  Heart,
  Star,
} from 'lucide-react';
import { getImageUrl, extractAllImages } from '../../utils/imageUrl';
import { formatDistance, calculateDistanceKm } from '../../utils/distance';
import { useLocation as useGeoLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import SavedContext from '../../context/SavedContext';
import { shareProduct } from '../../utils/productShare';
import { productApi } from '../../api/product.api';
import { trackPersonaEngagement } from '../../utils/personaEngine';

export const ProductTrustDetailView = ({
  product,
  shop: initialShop = null,
  onReserve,
  initialReserveOpen = false,
}) => {
  const { coords } = useGeoLocation();
  const { isHindi } = useLanguage();
  const { user } = useAuth();
  const savedCtx = useContext(SavedContext);
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const isProductSaved = savedCtx?.isProductSaved || (() => false);
  const toggleSaveProduct = savedCtx?.toggleSaveProduct || (() => {});

  // 1. Gallery State & Swipe
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });

  // 2. Reservation Modal State
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(Boolean(initialReserveOpen));
  const [selectedShopForReserve, setSelectedShopForReserve] = useState(null);
  const [reserveQty, setReserveQty] = useState(1);
  const [holdHours, setHoldHours] = useState(4);
  const [reserveNotes, setReserveNotes] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [reserving, setReserving] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState(null);
  const [reserveError, setReserveError] = useState(null);

  // 3. Share Toast
  const [copiedLink, setCopiedLink] = useState(false);

  // 4. Apparel & Beauty Variants State (Size / Color / Shade Matrix)
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    if (!product?.id) return;
    try {
      trackPersonaEngagement(product.category || product.name, 3);
    } catch {
      // Safe fallback
    }

    let isMounted = true;
    if (typeof productApi?.getProductVariants === 'function') {
      productApi.getProductVariants(product.id)
        .then((vars) => {
          if (!isMounted || !Array.isArray(vars)) return;
          setVariants(vars);
          if (vars.length > 0) {
            const firstInStock = vars.find((v) => (v.available_qty || 0) > 0) || vars[0];
            setSelectedVariant(firstInStock);
            if (firstInStock.size) setSelectedSize(firstInStock.size);
            if (firstInStock.color) setSelectedColor(firstInStock.color);
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [product?.id, product?.category, product?.name]);

  // Pre-fetch gallery images for 0ms instant carousel swipes
  useEffect(() => {
    if (!product) return;
    const images = extractAllImages(product);
    if (images.length > 1) {
      images.slice(1, 4).forEach((imgSrc) => {
        const img = new Image();
        img.src = getImageUrl(imgSrc);
      });
    }
  }, [product]);

  const availableSizes = useMemo(() => {
    if (!variants.length) return [];
    return Array.from(new Set(variants.map((v) => v.size).filter(Boolean)));
  }, [variants]);

  const availableColors = useMemo(() => {
    if (!variants.length) return [];
    const colorMap = new Map();
    variants.forEach((v) => {
      if (v.color && !colorMap.has(v.color)) {
        colorMap.set(v.color, {
          color: v.color,
          hex: v.color_hex || '#4f46e5',
          shade: v.shade_code,
        });
      }
    });
    return Array.from(colorMap.values());
  }, [variants]);

  const handleSelectSize = (sz) => {
    setSelectedSize(sz);
    const match = variants.find((v) => v.size === sz && (!selectedColor || v.color === selectedColor))
      || variants.find((v) => v.size === sz);
    if (match) setSelectedVariant(match);
  };

  const handleSelectColor = (col) => {
    setSelectedColor(col);
    const match = variants.find((v) => v.color === col && (!selectedSize || v.size === selectedSize))
      || variants.find((v) => v.color === col);
    if (match) setSelectedVariant(match);
  };

  // Extract images safely
  const images = useMemo(() => {
    if (!product) return [];
    return extractAllImages(product.images || product.image || product.image_url);
  }, [product]);

  // Pricing & Savings computation (Variant Price Override Awareness)
  const currentPrice = Number(selectedVariant?.price && selectedVariant.price > 0 ? selectedVariant.price : (product?.price || product?.selling_price || 0));
  const originalPrice = Number(product?.compare_price || product?.mrp || 0);
  const isPricePublic =
    product?.is_price_public !== false &&
    product?.isPricePublic !== false &&
    product?.attributes?.is_price_public !== false &&
    product?.attributes?.is_price_public !== 'false' &&
    currentPrice > 0 &&
    !product?.hide_price;

  const hasDiscount = isPricePublic && originalPrice > currentPrice;
  const savingsAmount = hasDiscount ? originalPrice - currentPrice : 0;
  const discountPercent = hasDiscount ? Math.round((savingsAmount / originalPrice) * 100) : 0;

  // Product Specifications & Metadata Extraction
  const specItems = useMemo(() => {
    if (!product) return [];
    const items = [];
    if (product.brand) items.push({ label: 'Brand', value: product.brand });
    if (product.category) items.push({ label: 'Category', value: typeof product.category === 'object' ? (product.category?.name || '') : String(product.category) });
    if (product.unit) items.push({ label: 'Unit', value: product.unit });
    if (product.weight > 0) items.push({ label: 'Weight', value: `${product.weight} kg` });

    if (product.attributes && typeof product.attributes === 'object') {
      Object.entries(product.attributes).forEach(([k, v]) => {
        const kLow = k.toLowerCase().trim();
        if (kLow !== 'brand' && kLow !== 'category' && kLow !== 'category_name' && kLow !== 'unit' && kLow !== 'weight' && v && String(v).trim()) {
          const formattedKey = k.replaceAll('_', ' ').replaceAll('-', ' ');
          items.push({ label: formattedKey, value: String(v) });
        }
      });
    }
    return items;
  }, [product]);

  const rawStock =
    selectedVariant?.available_qty ??
    product?.available_quantity ??
    product?.stock_quantity ??
    product?.stock;
  const stock = rawStock == null ? null : Number(rawStock);
  const hasStockData = stock !== null && Number.isFinite(stock);
  const isAvailabilityKnown = hasStockData || typeof product?.is_available === 'boolean';
  const isInStock = hasStockData ? stock > 0 && product?.is_available !== false : product?.is_available === true;
  const shopName = initialShop?.name || product?.shop_name || product?.shop?.name || '';
  const shopId = initialShop?.id || product?.shop_id || product?.shopId || product?.shop?.id || '';
  const shopSlug = initialShop?.slug || product?.shop_slug || product?.shop?.slug || '';
  const ratingValue = Number(product?.rating);
  const reviewCount = Number(product?.reviews_count ?? product?.rating_count) || 0;
  const hasRating = Number.isFinite(ratingValue) && ratingValue > 0;
  const rawDistance =
    initialShop?.distance_text ||
    product?.distance_text ||
    (initialShop?.distance_km != null ? formatDistance(Number(initialShop.distance_km)) : '');
  const calculatedDistance = !rawDistance && coords?.lat != null && coords?.lng != null &&
    initialShop?.latitude != null && initialShop?.longitude != null
    ? formatDistance(calculateDistanceKm(coords.lat, coords.lng, initialShop.latitude, initialShop.longitude))
    : '';
  const shopDistance = rawDistance || calculatedDistance;
  const bestOffer = shopId || shopName
    ? {
        id: shopId,
        name: shopName || (isHindi ? 'दुकान का विवरण उपलब्ध नहीं' : 'Store details unavailable'),
        slug: shopSlug,
        phone: initialShop?.phone || product?.shop_phone || '',
        distanceStr: shopDistance,
        price: currentPrice,
        isOpen: initialShop?.is_currently_open ?? initialShop?.is_open,
      }
    : null;

  const activeReserveShop = selectedShopForReserve || bestOffer;
  const canReserve =
    Boolean(bestOffer) &&
    initialShop?.accepts_reservations !== false &&
    product?.accepts_reservations !== false &&
    product?.shop?.accepts_reservations !== false &&
    !(isAvailabilityKnown && !isInStock);
  const isShopVerified =
    initialShop?.is_verified === true ||
    product?.is_shop_verified === true ||
    product?.shop?.is_verified === true;
  const inventoryUpdatedText =
    initialShop?.inventory_updated_text ||
    product?.inventory_updated_text ||
    '';
  const trustSignals = [
    isShopVerified && {
      headline: isHindi ? 'सत्यापित दुकान' : 'Verified shop',
      description: isHindi ? 'इस दुकान की पुष्टि ShopSilo ने की है।' : 'This shop has been verified by ShopSilo.',
    },
    inventoryUpdatedText && {
      headline: isHindi ? 'स्टॉक अपडेट का समय' : 'Stock update time',
      description: inventoryUpdatedText,
    },
    isAvailabilityKnown && {
      headline: hasStockData
        ? (isHindi ? 'स्टॉक की मात्रा दी गई है' : 'Stock quantity provided')
        : (isHindi ? 'उपलब्धता की जानकारी दी गई है' : 'Availability reported'),
      description: hasStockData
        ? (isHindi ? 'रिज़र्व करने से पहले दी गई मात्रा देखें।' : 'Check the listed quantity before reserving.')
        : (isHindi ? 'पिकअप से पहले दुकान से पुष्टि करें।' : 'Confirm with the shop before pickup.'),
    },
    {
      headline: isHindi ? 'पिकअप पर भुगतान' : 'Pay at pickup',
      description: isHindi ? 'ऑनलाइन अग्रिम भुगतान की आवश्यकता नहीं।' : 'No advance online payment is required.',
    },
  ].filter(Boolean);

  // Gallery Swipe Handlers
  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e) => {
    const diffX = touchStartRef.current.x - e.changedTouches[0].clientX;
    const diffY = touchStartRef.current.y - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        // Next image
        setActiveImgIdx((prev) => (prev + 1) % (images.length || 1));
      } else {
        // Prev image
        setActiveImgIdx((prev) => (prev - 1 + (images.length || 1)) % (images.length || 1));
      }
    }
  };

  const handleShare = async () => {
    try {
      const res = await shareProduct({
        product,
        shopName: initialShop?.name || product?.shop_name || bestOffer?.name,
        shopSlug: initialShop?.slug || product?.shop_slug || bestOffer?.slug,
        isHindi,
      });

      if (res?.success) {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch (e) {
      console.warn('Share error fallback:', e);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const openReservationForShop = (targetShop) => {
    if (!canReserve) return;
    setSelectedShopForReserve(targetShop || bestOffer);
    setReserveQty(1);
    setReserveError(null);
    setReserveSuccess(null);
    setIsReserveModalOpen(true);
  };

  const handleConfirmReservation = async (e) => {
    e.preventDefault();
    if (!selectedShopForReserve) return;
    setReserving(true);
    setReserveError(null);

    try {
      const res = await onReserve?.({
        product: {
          ...product,
          price: currentPrice,
          variant: selectedVariant,
          selected_size: selectedSize || selectedVariant?.size,
          selected_color: selectedColor || selectedVariant?.color,
        },
        variant_id: selectedVariant?.id,
        size: selectedSize || selectedVariant?.size,
        color: selectedColor || selectedVariant?.color,
        shade: selectedVariant?.shade_code,
        shop: selectedShopForReserve,
        quantity: reserveQty,
        hold_hours: holdHours,
        notes: reserveNotes,
        customer_name: customerName,
        customer_phone: customerPhone,
      });

      if (!res || res.success === false) {
        setReserveError(
          res?.message ||
            (isHindi
              ? 'रिज़र्वेशन की पुष्टि नहीं मिली। दोबारा करने से पहले पिकअप में देखें।'
              : 'No reservation confirmation was returned. Check Pickups before trying again.')
        );
        return;
      }
      setReserveSuccess(res);
    } catch (err) {
      setReserveError(err.message || (isHindi ? 'रिज़र्व करने में त्रुटि' : 'Failed to create reservation'));
    } finally {
      setReserving(false);
    }
  };

  return (
    <div className="product-trust-detail-container">
      {/* 2-Column Responsive Layout: Left Gallery & Guarantees, Right Buy Box & Compare */}
      <div className="product-trust-grid">
        {/* ==================================================================
            LEFT COLUMN: PRODUCT GALLERY & TRUST SIGNALS
            ================================================================== */}
        <div className="product-trust-left-col">
          {/* 1. PRODUCT GALLERY (Flipkart Style: Clean White Showcase, Floating Heart & Share, Rating Pill, Centered Blue Dot Pagination) */}
          <div className="product-gallery-card flipkart-gallery-card">
            <div
              className="product-gallery-viewport flipkart-gallery-viewport"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Floating Availability Badge */}
              <div className="gallery-badge-top-left">
                {isAvailabilityKnown && (
                <div className={`available-now-pill ${isInStock ? '' : 'is-unavailable'}`}>
                  <span className="live-stock-pulse-dot" />
                  <span>
                    {isInStock
                      ? (isHindi ? 'अभी उपलब्ध' : 'In stock')
                      : (isHindi ? 'स्टॉक खत्म' : 'Out of stock')}
                  </span>
                </div>
                )}
              </div>

              {/* Floating Top-Right Circular Action Buttons: Wishlist (Heart), Share & Zoom */}
              <div className="flipkart-gallery-floating-actions">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSaveProduct(product);
                  }}
                  className={`flipkart-round-action-btn ${isProductSaved(product.id) ? 'is-favorited' : ''}`}
                  title={isProductSaved(product.id) ? (isHindi ? 'पसंदीदा से हटाएं' : 'Remove from Wishlist') : (isHindi ? 'पसंदीदा में जोड़ें' : 'Add to Wishlist')}
                  aria-label="Wishlist"
                >
                  <Heart
                    size={19}
                    fill={isProductSaved(product.id) ? '#ef4444' : 'none'}
                    color={isProductSaved(product.id) ? '#ef4444' : '#475569'}
                  />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="flipkart-round-action-btn"
                  title={isHindi ? 'शेयर करें' : 'Share Product'}
                  aria-label="Share"
                >
                  <Share2 size={18} color="#475569" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomOpen(true);
                  }}
                  className="flipkart-round-action-btn"
                  title={isHindi ? 'ज़ूम करें' : 'Zoom Image'}
                  aria-label="Zoom"
                >
                  <Maximize2 size={16} color="#475569" />
                </button>
              </div>

              {/* Main Image */}
              {images.length > 0 ? (
                <img
                  src={getImageUrl(images[activeImgIdx])}
                  alt={product.name}
                  className="product-gallery-main-img flipkart-main-img"
                  onClick={() => setIsZoomOpen(true)}
                />
              ) : (
                <div className="product-gallery-placeholder">
                  <span>{product.name}</span>
                </div>
              )}

              {/* Desktop Prev / Next Navigation Chevrons */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImgIdx((prev) => (prev - 1 + images.length) % images.length)
                    }
                    className="gallery-nav-chevron left"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImgIdx((prev) => (prev + 1) % images.length)}
                    className="gallery-nav-chevron right"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {hasRating && (
                <div className="flipkart-rating-pill">
                  <span className="rating-score">{ratingValue.toFixed(1)}</span>
                  <Star size={12} fill="#15803d" color="#15803d" />
                  {reviewCount > 0 && (
                    <>
                      <span className="rating-divider">|</span>
                      <span className="rating-count">{reviewCount}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Centered Blue Dot Pagination: ● ○ ○ ○ ○ */}
            {images.length > 1 && (
              <div className="flipkart-dot-pagination-row">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImgIdx(idx)}
                    className={`flipkart-dot ${activeImgIdx === idx ? 'is-active' : ''}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================
            RIGHT COLUMN: PRODUCT INFORMATION, BEST OFFER & SHOP COMPARISON
            ================================================================== */}
        <div className="product-trust-right-col">
          {/* 2. PRODUCT INFORMATION */}
          <div className="product-info-section flipkart-info-section">
            {/* Brand Title (Bold Header) */}
            {(product.brand || (typeof product.category === 'object' ? product.category?.name : product.category)) && (
              <div className="flipkart-brand-name">
                {product.brand || (typeof product.category === 'object' ? product.category?.name : product.category)}
              </div>
            )}

            {/* Product Name with ...more toggle */}
            <h1 className="flipkart-product-heading">
              {isTitleExpanded || product.name.length <= 70 ? (
                <>
                  {product.name}
                  {product.name.length > 70 && (
                    <button
                      type="button"
                      onClick={() => setIsTitleExpanded(false)}
                      className="flipkart-more-toggle"
                    >
                      {' '}{isHindi ? '...कम' : '...less'}
                    </button>
                  )}
                </>
              ) : (
                <>
                  {product.name.slice(0, 70)}
                  <button
                    type="button"
                    onClick={() => setIsTitleExpanded(true)}
                    className="flipkart-more-toggle"
                  >
                    {isHindi ? '...और' : '...more'}
                  </button>
                </>
              )}
            </h1>

            {/* Unified Flipkart Price Row: ↓70%  3,999  ₹1,199 */}
            <div className="flipkart-price-box">
              <div className="flipkart-main-price-row">
                {isPricePublic ? (
                  <>
                    {hasDiscount && (
                      <span className="flipkart-discount-pill">
                        <span className="discount-arrow">↓</span>{discountPercent}%
                      </span>
                    )}
                    {hasDiscount && (
                      <span className="flipkart-original-mrp">
                        ₹{originalPrice.toFixed(0)}
                      </span>
                    )}
                    <span className="flipkart-selling-price">
                      ₹{currentPrice.toFixed(0)}
                    </span>
                    {hasDiscount && (
                      <span className="product-savings-badge" style={{ marginLeft: '4px' }}>
                        {isHindi
                          ? `बचत ₹${savingsAmount.toFixed(0)} (${discountPercent}% छूट)`
                          : `Save ₹${savingsAmount.toFixed(0)} (${discountPercent}% OFF)`}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="flipkart-selling-price price-on-request">
                    {isHindi ? 'दुकान से दाम पूछें' : 'Ask the shop for price'}
                  </span>
                )}
              </div>

              {/* Fee / Guarantee Subline with Chevron */}
              <div className="flipkart-fee-subline">
                <span>{isHindi ? 'दुकान से पिकअप · भुगतान पिकअप पर' : 'Store pickup · pay at pickup'}</span>
                <ChevronRight size={14} className="subline-arrow" />
              </div>
            </div>

            {/* Availability Status Highlight */}
            <div className={`product-availability-banner ${isAvailabilityKnown && !isInStock ? 'is-unavailable' : ''}`} style={{ marginBottom: '12px' }}>
              <span className="available-dot-indicator" />
              <span className="available-text">
                {!isAvailabilityKnown
                  ? (isHindi ? 'पिकअप से पहले दुकान से स्टॉक की पुष्टि करें' : 'Check stock with the shop before pickup')
                  : isInStock
                  ? (isHindi ? 'स्टॉक उपलब्ध है · दुकान से पिकअप करें' : 'In stock · collect from the store')
                  : (isHindi ? 'यह उत्पाद अभी स्टॉक में नहीं है' : 'This item is currently out of stock')}
              </span>
            </div>

            {/* 👗 Apparel Size & Beauty Shade Variant Matrix */}
            {(availableSizes.length > 0 || availableColors.length > 0) && (
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-surface, #ffffff)',
                  border: '1.5px solid var(--border-subtle, #e2e8f0)',
                  borderRadius: '14px',
                  marginBottom: '10px',
                }}
              >
                {/* Available Sizes */}
                {availableSizes.length > 0 && (
                  <div style={{ marginBottom: availableColors.length > 0 ? '12px' : '0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {isHindi ? 'साइज़ चुनें (Select Size)' : 'Select Size'}
                      </span>
                      {selectedSize && (
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-primary, #4f46e5)' }}>
                          {isHindi ? `चुना गया: ${selectedSize}` : `Selected: ${selectedSize}`}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {availableSizes.map((sz) => {
                        const isSelected = selectedSize === sz;
                        const varItem = variants.find((v) => v.size === sz && (!selectedColor || v.color === selectedColor))
                          || variants.find((v) => v.size === sz);
                        const rawQty = varItem?.available_qty;
                        const qty = rawQty == null ? null : Number(rawQty);
                        const isOutOfStock = qty !== null && Number.isFinite(qty) && qty <= 0;

                        return (
                          <button
                            key={sz}
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => handleSelectSize(sz)}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '10px',
                              border: isSelected
                                ? '2px solid var(--color-primary, #4f46e5)'
                                : '1.5px solid var(--border-subtle, #e2e8f0)',
                              backgroundColor: isSelected
                                ? 'var(--color-primary-light, #f0f4ff)'
                                : isOutOfStock
                                ? 'var(--bg-surface-subtle, #f8fafc)'
                                : '#ffffff',
                              color: isSelected
                                ? 'var(--color-primary, #4f46e5)'
                                : isOutOfStock
                                ? 'var(--text-muted, #94a3b8)'
                                : 'var(--text-primary, #0f172a)',
                              fontWeight: 800,
                              fontSize: '0.82rem',
                              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                              opacity: isOutOfStock ? 0.45 : 1,
                              textDecoration: isOutOfStock ? 'line-through' : 'none',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '2px',
                              minWidth: '48px',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span>{sz}</span>
                            {qty > 0 && qty <= 3 && (
                              <span style={{ fontSize: '0.60rem', color: '#e11d48', fontWeight: 700 }}>
                                {qty} left
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Colors & Shades */}
                {availableColors.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {isHindi ? 'रंग / शेड चुनें' : 'Select Color / Shade'}
                      </span>
                      {selectedColor && (
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-primary, #4f46e5)' }}>
                          {selectedColor}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {availableColors.map((colObj) => {
                        const isSelected = selectedColor === colObj.color;
                        return (
                          <button
                            key={colObj.color}
                            type="button"
                            onClick={() => handleSelectColor(colObj.color)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 10px',
                              borderRadius: '20px',
                              border: isSelected
                                ? '2px solid var(--color-primary, #4f46e5)'
                                : '1.5px solid var(--border-subtle, #e2e8f0)',
                              backgroundColor: isSelected
                                ? 'var(--color-primary-light, #f0f4ff)'
                                : '#ffffff',
                              color: 'var(--text-primary, #0f172a)',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: colObj.hex,
                                border: '1px solid rgba(0,0,0,0.15)',
                                display: 'inline-block',
                              }}
                            />
                            <span>{colObj.color}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PRODUCT SPECIFICATIONS & ABOUT THIS ITEM (Customer Reads Product Details First) */}
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'var(--bg-surface, #ffffff)',
                border: '1.5px solid var(--border-subtle, #e2e8f0)',
                borderRadius: '14px',
                marginTop: '10px',
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                {isHindi ? 'उत्पाद विवरण एवं विशेषताएं' : 'Product Details & Specifications'}
              </div>

              {specItems.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '6px', marginBottom: product.description ? '10px' : '0' }}>
                  {specItems.map((spec) => (
                    <div key={spec.label} style={{ padding: '6px 10px', backgroundColor: 'var(--bg-surface-subtle, #f8fafc)', borderRadius: '8px', border: '1px solid var(--border-subtle, #f1f5f9)' }}>
                      <div style={{ fontSize: '0.64rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 700, textTransform: 'uppercase' }}>
                        {spec.label}
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)', marginTop: '1px' }}>
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {product.description && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-primary, #0f172a)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-line' }}>
                  {product.description}
                </p>
              )}
            </div>
          </div>

          {/* SLEEK & COMPACT SHOP LINK CARD (Clicking navigates to shop profile) */}
          {bestOffer && (() => {
            const targetShopSlug =
              product?.shop_slug ||
              product?.shop?.slug ||
              product?.shop_id ||
              product?.shopId ||
              initialShop?.slug ||
              initialShop?.id ||
              bestOffer.slug ||
              bestOffer.id ||
              '';

            const handleNavigateToShop = (e) => {
              if (e) {
                e.stopPropagation();
                e.preventDefault();
              }
              if (!targetShopSlug) return;
              const slugToUse = targetShopSlug;
              navigate(`/shop/${slugToUse}`, {
                state: { shop: initialShop || product?.shop || bestOffer },
              });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            };

            return (
              <div
                onClick={handleNavigateToShop}
                style={{
                  backgroundColor: 'var(--bg-surface, #ffffff)',
                  border: '1.5px solid var(--border-subtle, #e2e8f0)',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  marginBottom: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  transition: 'all 0.15s ease-in-out',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary-light, #f0f4ff)',
                      color: 'var(--color-primary, #4f46e5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Store size={18} />
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '0.90rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {bestOffer.name}
                      </span>
                      {isShopVerified && (
                        <ShieldCheck size={16} color="var(--color-success)" style={{ flexShrink: 0 }} aria-label={isHindi ? 'सत्यापित दुकान' : 'Verified shop'} />
                      )}
                    </div>

                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary, #64748b)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      {bestOffer.isOpen === true && (
                        <span style={{ color: 'var(--color-success-text)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
                          {isHindi ? 'खुली है' : 'Open now'}
                        </span>
                      )}
                      {bestOffer.isOpen === false && (
                        <span style={{ color: 'var(--color-danger)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          {isHindi ? 'बंद है' : 'Closed'}
                        </span>
                      )}
                      {bestOffer.distanceStr && (
                        <>
                          {bestOffer.isOpen !== undefined && <span>•</span>}
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            <MapPin size={11} color="var(--color-primary)" />
                            {bestOffer.distanceStr}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNavigateToShop}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-primary-light, #f0f4ff)',
                    color: 'var(--color-primary, #4f46e5)',
                    border: '1px solid var(--border-subtle, #e2e8f0)',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <span>{isHindi ? 'दुकान देखें' : 'View Store'}</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            );
          })()}

          {/* Primary Action Button: Reserve Now */}
          <div style={{ marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => openReservationForShop(bestOffer)}
              disabled={!canReserve}
              aria-disabled={!canReserve}
              style={{
                width: '100%',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 18px',
                fontSize: '0.92rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>
                {!bestOffer
                  ? (isHindi ? 'दुकान की जानकारी उपलब्ध नहीं' : 'Store details unavailable')
                  : !canReserve
                  ? (isHindi ? 'रिज़र्वेशन उपलब्ध नहीं' : 'Pickup reservation unavailable')
                  : (isHindi ? 'दुकान से पिकअप रिज़र्व करें' : 'Reserve for pickup')}
              </span>
            </button>

            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'center', fontWeight: 500 }}>
              {isHindi ? 'अग्रिम भुगतान नहीं · भुगतान पिकअप पर करें' : 'No advance payment · pay at pickup'}
            </div>
          </div>

          {/* WHY TRUST THIS LISTING (Positioned Below Reserve CTA to Support Decision) */}
          <div className="why-trust-listing-card" style={{ marginTop: '8px' }}>
            <div className="why-trust-header">
              <ShieldCheck size={20} className="trust-shield-icon" />
              <h3 className="why-trust-title">
                {isHindi ? 'इस लिस्टिंग पर भरोसा क्यों करें' : 'Why Trust This Listing'}
              </h3>
            </div>
            <div className="why-trust-list">
              {trustSignals.map((signal) => (
                <div className="trust-signal-item" key={signal.headline}>
                  <CheckCircle2 size={18} className="trust-green-check" />
                  <div className="trust-signal-text-group">
                    <span className="trust-signal-headline">{signal.headline}</span>
                    <span className="trust-signal-subtext">{signal.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          FULLSCREEN IMAGE ZOOM LIGHTBOX
          ==================================================================== */}
      {isZoomOpen && images.length > 0 && (
        <div className="product-zoom-lightbox" onClick={() => setIsZoomOpen(false)}>
          <button
            type="button"
            className="lightbox-close-btn"
            onClick={() => setIsZoomOpen(false)}
            aria-label="Close fullscreen view"
          >
            <X size={24} />
          </button>
          <img
            src={getImageUrl(images[activeImgIdx])}
            alt={product.name}
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ====================================================================
          RESERVATION POPUP MODAL (Zero-Payment OTP Pass)
          ==================================================================== */}
      {isReserveModalOpen && selectedShopForReserve && (
        <div
          className="reserve-modal-backdrop"
          onClick={() => !reserving && setIsReserveModalOpen(false)}
        >
          <div
            className="reserve-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="reserve-modal-header">
              <div>
                <h3 className="reserve-modal-title">
                  {isHindi ? 'काउंटर पिकअप रिज़र्व करें' : 'Reserve for Store Pickup'}
                </h3>
                <p className="reserve-modal-subtitle">
                  {isHindi
                    ? 'सामान आपके नाम पर काउंटर पर रखा जाएगा। भुगतान दुकान पर करें।'
                    : 'Held at the store under your name. Pay only at pickup.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReserveModalOpen(false)}
                className="reserve-modal-close-btn"
                disabled={reserving}
              >
                <X size={20} />
              </button>
            </div>

            {/* If reservation succeeded */}
            {reserveSuccess ? (
              <div className="reserve-success-state">
                <div className="reserve-success-badge">
                  <CheckCircle2 size={44} color="#16a34a" />
                </div>
                <h4 className="reserve-success-title">
                  {isHindi ? 'सामान सफलतापूर्वक रिज़र्व हो गया!' : 'Reservation Confirmed!'}
                </h4>
                <p className="reserve-success-info">
                  {isHindi
                    ? `${activeReserveShop.name} ने सामान आपके लिए ${holdHours} घंटे के लिए सुरक्षित रख दिया है।`
                    : `${activeReserveShop.name} has held this item for you for ${holdHours} hours.`}
                </p>
                <div className="reserve-otp-card">
                  <span className="otp-label">{isHindi ? 'पिकअप टोकन' : 'PICKUP PASS PIN'}</span>
                  {(reserveSuccess.token || reserveSuccess.pickup_token || reserveSuccess.pickup_code) && (
                    <span className="otp-code">
                      #{reserveSuccess.token || reserveSuccess.pickup_token || reserveSuccess.pickup_code}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsReserveModalOpen(false);
                    navigate('/reservations');
                  }}
                  className="reserve-view-pass-btn"
                >
                  {isHindi ? 'मेरी रिज़र्वेशन देखें' : 'View In My Pickups'}
                </button>
              </div>
            ) : (
              /* Modal Form */
              <form onSubmit={handleConfirmReservation} className="reserve-modal-form">
                {/* Store Summary Pill */}
                <div className="reserve-store-summary-pill">
                  <Store size={16} className="store-pill-icon" />
                  <div className="store-pill-text">
                    <span className="store-pill-name">{activeReserveShop.name}</span>
                    {activeReserveShop.distanceStr && (
                      <span className="store-pill-dist">• {activeReserveShop.distanceStr}</span>
                    )}
                  </div>
                  {isPricePublic && currentPrice > 0 && (
                    <span className="store-pill-price">
                      ₹{((activeReserveShop.price || currentPrice) * reserveQty).toFixed(0)}
                    </span>
                  )}
                </div>

                {/* Quantity Stepper */}
                <div className="reserve-form-field">
                  <label className="reserve-form-label">{isHindi ? 'मात्रा (Quantity)' : 'Quantity'}</label>
                  <div className="reserve-qty-control">
                    <button
                      type="button"
                      onClick={() => setReserveQty((q) => Math.max(1, q - 1))}
                      disabled={reserveQty <= 1}
                      className="qty-step-btn"
                    >
                      -
                    </button>
                    <span className="qty-val">{reserveQty}</span>
                    <button
                      type="button"
                      onClick={() => setReserveQty((q) => q + 1)}
                      className="qty-step-btn"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Hold Time Pill Selector */}
                <div className="reserve-form-field">
                  <label className="reserve-form-label">
                    {isHindi ? 'कितनी देर तक होल्ड करें' : 'Hold Duration'}
                  </label>
                  <div className="hold-hours-selector">
                    {[2, 4, 8].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHoldHours(h)}
                        className={`hold-pill-btn ${holdHours === h ? 'is-selected' : ''}`}
                      >
                        {h} {isHindi ? 'घंटे' : 'Hours'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer Contact Inputs */}
                <div className="reserve-form-row">
                  <div className="reserve-form-field flex-1">
                    <label className="reserve-form-label">{isHindi ? 'आपका नाम' : 'Your Name'}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="reserve-form-input"
                    />
                  </div>
                  <div className="reserve-form-field flex-1">
                    <label className="reserve-form-label">{isHindi ? 'फ़ोन नंबर' : 'Phone Number'}</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="reserve-form-input"
                    />
                  </div>
                </div>

                {/* Notes Input */}
                <div className="reserve-form-field">
                  <label className="reserve-form-label">
                    {isHindi ? 'दुकानदार के लिए नोट (वैकल्पिक)' : 'Notes for Store (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      isHindi ? 'उदा. मैं शाम 6 बजे पिकअप करूंगा' : 'e.g. Will arrive around 6 PM'
                    }
                    value={reserveNotes}
                    onChange={(e) => setReserveNotes(e.target.value)}
                    className="reserve-form-input"
                  />
                </div>

                {/* Trust Guarantee callout */}
                <div className="reserve-guarantee-box">
                  <ShieldCheck size={16} color="#16a34a" />
                  <span>
                    {isHindi
                      ? 'कोई ऑनलाइन पेमेंट नहीं। सामान चेक करके दुकान पर ही पे करें।'
                      : 'No online payment required. Inspect and pay at the shop counter.'}
                  </span>
                </div>

                {reserveError && (
                  <div className="reserve-error-banner">
                    <AlertCircle size={15} />
                    <span>{reserveError}</span>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={reserving}
                  className="reserve-modal-submit-btn"
                >
                  {reserving
                    ? isHindi
                      ? 'रिज़र्व हो रहा है...'
                      : 'Securing Hold...'
                    : isHindi
                    ? 'पुष्टि करें व टोकन लें'
                    : 'Confirm & Get Pickup Pass'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Share Toast Feedback */}
      {copiedLink && (
        <div className="share-feedback-toast">
          ✓ {isHindi ? 'लिंक कॉपी हो गया!' : 'Product Link Copied!'}
        </div>
      )}
    </div>
  );
};

export default ProductTrustDetailView;
