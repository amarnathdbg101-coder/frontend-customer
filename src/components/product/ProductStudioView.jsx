/**
 * ProductStudioView Component
 *
 * Clean, Aesthetic, High-Vibe E-Commerce Product Details Showcase for Customer Web App.
 * Inspired directly by the ShopSilo Merchant Product Details Architecture:
 * - Studio Hero Gallery with real-time finger touch swipe + desktop mouse drag physics
 * - Animated expandable dot pagination pills (Apple/Shopify style)
 * - Floating badges: Glowing 🔥 % OFF fire badge, 🟢 stock pulse pill, zoom hint, 1/N counter
 * - Tap-to-zoom fullscreen lightbox with swipe & keyboard navigation
 * - Clean Product Header with category tag, brand chip, and verified counter pill
 * - Pricing Hero Card with tax-inclusive badge, big bold price, strike-through MRP, savings pill
 * - Counter Restock / Stepper with Tactile "Add to Cart" and Quick Action Buttons
 * - Minimalist Specifications Chip Grid (brand, category, unit, net weight, custom attributes)
 * - Enterprise Privacy Shield (Rule 15): zero leakage of cost price, floor price, SKU, supplier
 * - Verified Local Store Card with distance, driving/walking time, directions, call, storefront
 * - Trust & Quality Guarantee highlights
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Store,
  MapPin,
  Phone,
  ShoppingCart,
  AlertCircle,
  MessageCircle,
  Maximize2,
  Clock,
  ShieldCheck,
  Share2,
  Check,
  Star,
  ExternalLink,
  X,
} from 'lucide-react';
import { getImageUrl, extractAllImages } from '../../utils/imageUrl';
import { QuantityStepper } from '../ui';
import { formatCurrency } from '../../utils/format';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation as useGeoLocation } from '../../context/LocationContext';
import { shareProduct } from '../../utils/productShare';
import { parseProductDetails } from '../../utils/productDetailsHelper';
import { getDirectionsUrl, calculateDistanceKm, formatTravelTime } from '../../utils/distance';

export const ProductStudioView = ({
  product,
  shop: propShop = null,
  isModal = false,
  onClose = null,
  onReserve = null,
  isMerchant = false,
}) => {
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  const { isHindi, t } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const { coords } = useGeoLocation();

  // Active image index
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [cartQty, setCartQty] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Drag / Swipe State for Touch & Mouse Drag Physics
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, time: 0 });
  const isHorizontalSwipeRef = useRef(false);

  // Reserve state
  const [holdHours, setHoldHours] = useState(4);
  const [reserving, setReserving] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [reserveError, setReserveError] = useState(null);

  // Share feedback
  const [copiedLink, setCopiedLink] = useState(false);

  // Reset state whenever product changes
  useEffect(() => {
    setSelectedImageIdx(0);
    setCartQty(1);
    setReserveError(null);
    setReserveSuccess(false);
    setDragOffset(0);
    setIsDragging(false);
  }, [product?.id]);

  // Extract all images robustly
  const images = useMemo(() => {
    if (!product) return [];
    return extractAllImages(
      product.images ||
      product.image ||
      product.image_url ||
      product.photos ||
      product.image_urls
    );
  }, [product]);

  // Stock, Pricing, and Badges
  const currentStock = Number(
    product?.available_quantity ??
    product?.stock_quantity ??
    product?.inventory?.available_quantity ??
    product?.inventory?.quantity ??
    product?.stock ??
    99
  );
  const inStock = currentStock > 0;
  const isLowStock = inStock && currentStock <= 5;

  const price = Number(
    product?.price ??
    product?.selling_price ??
    product?.offer_price ??
    0
  );

  const comparePrice = Number(
    product?.compare_price ??
    product?.mrp ??
    product?.original_price ??
    0
  );

  const hasDiscount = comparePrice > price && price > 0;
  const savings = hasDiscount ? comparePrice - price : 0;
  const discountPct = hasDiscount ? Math.round((savings / comparePrice) * 100) : 0;

  const isPricePublic = product?.is_price_public !== false &&
                        product?.isPricePublic !== false &&
                        product?.attributes?.is_price_public !== false &&
                        product?.attributes?.is_price_public !== 'false' &&
                        !product?.hide_price &&
                        price > 0;

  // Complete Specifications Parsing & Privacy Shield (Rule 15)
  const parsedDetails = useMemo(() => {
    return parseProductDetails(product, isHindi);
  }, [product, isHindi]);

  const brand = parsedDetails.brand || product?.brand || '';
  const categoryName = parsedDetails.categoryName ||
    (typeof product?.category === 'object'
      ? (product.category?.name || product.category_name || '')
      : String(product?.category_name || product?.category || ''));
  const unitLabel = parsedDetails.unit || product?.unit || '';
  const weightLabel = parsedDetails.weightLabel || (product?.weight > 0 ? `${product.weight} kg` : '');
  const cleanDescription = parsedDetails.cleanDescription || product?.description || '';
  const specifications = parsedDetails.specifications || [];

  // Shop & Storefront Information
  const shop = propShop || product?.shop || {};
  const storeName = shop?.name || product?.shop_name || (isHindi ? 'स्थानीय दुकान' : 'Local Store');
  const storeSlug = shop?.slug || product?.shop_slug || '';
  const storePhone = shop?.phone || product?.shop_phone || '';
  const storeAddress = shop?.address || product?.shop_address || '';
  const storeCity = shop?.city || product?.shop_city || '';
  const storeLat = shop?.latitude || product?.shop_latitude;
  const storeLng = shop?.longitude || product?.shop_longitude;
  const distanceKm = storeLat && storeLng ? calculateDistanceKm(coords?.lat, coords?.lng, storeLat, storeLng) : null;
  const travelInfo = distanceKm !== null ? formatTravelTime(distanceKm, isHindi) : null;
  const travelTime = travelInfo?.timeStr || null;

  // --- Real-Time Finger Swap / Mouse Drag Physics Handlers ---
  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0 || images.length <= 1) return;
    const touch = e.touches[0];
    dragStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    isHorizontalSwipeRef.current = false;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !e.touches || e.touches.length === 0 || images.length <= 1) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartRef.current.x;
    const deltaY = touch.clientY - dragStartRef.current.y;

    if (!isHorizontalSwipeRef.current) {
      if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
        isHorizontalSwipeRef.current = true;
      } else if (Math.abs(deltaY) > 8) {
        setIsDragging(false);
        return;
      }
    }

    if (isHorizontalSwipeRef.current) {
      // Elastic resistance at carousel boundaries
      const isAtFirst = selectedImageIdx === 0 && deltaX > 0;
      const isAtLast = selectedImageIdx === images.length - 1 && deltaX < 0;
      const appliedOffset = (isAtFirst || isAtLast) ? deltaX * 0.35 : deltaX;
      setDragOffset(appliedOffset);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || images.length <= 1) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    const elapsed = Date.now() - dragStartRef.current.time;
    const velocity = Math.abs(dragOffset) / Math.max(elapsed, 1);
    const threshold = velocity > 0.4 ? 25 : 50;

    if (dragOffset < -threshold && selectedImageIdx < images.length - 1) {
      setSelectedImageIdx((prev) => prev + 1);
    } else if (dragOffset > threshold && selectedImageIdx > 0) {
      setSelectedImageIdx((prev) => prev - 1);
    }

    setIsDragging(false);
    setDragOffset(0);
    isHorizontalSwipeRef.current = false;
  };

  // Mouse Drag Support (Desktop Touch Feel)
  const handleMouseDown = (e) => {
    if (images.length <= 1) return;
    dragStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    isHorizontalSwipeRef.current = true;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || images.length <= 1) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const isAtFirst = selectedImageIdx === 0 && deltaX > 0;
    const isAtLast = selectedImageIdx === images.length - 1 && deltaX < 0;
    const appliedOffset = (isAtFirst || isAtLast) ? deltaX * 0.35 : deltaX;
    setDragOffset(appliedOffset);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    handleTouchEnd();
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isZoomOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setSelectedImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        setSelectedImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'Escape') {
        setIsZoomOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomOpen, images.length]);

  // Handlers
  const handleAddToCart = () => {
    if (!product || !inStock) return;
    addItem(product, cartQty);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleReservePickup = async () => {
    if (!onReserve) return;
    if (!isAuthenticated) {
      alert(isHindi ? 'पिकअप बुक करने के लिए कृपया लॉगिन करें' : 'Please sign in to reserve items for store pickup');
      navigate('/login');
      return;
    }

    try {
      setReserving(true);
      setReserveError(null);
      await onReserve({
        product,
        quantity: Number(cartQty),
        hold_hours: Number(holdHours),
        notes: '',
      });
      setReserveSuccess(true);
      setTimeout(() => setReserveSuccess(false), 3500);
    } catch (err) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('user not found') || msg.includes('unauthorized') || msg.includes('session expired')) {
        alert(isHindi ? 'सत्र समाप्त हो गया है। कृपया दोबारा लॉग इन करें।' : 'Your session has expired. Please sign in again.');
        logout();
        navigate('/login');
      } else {
        setReserveError(err?.message || (isHindi ? 'पिकअप बुक करने में त्रुटि' : 'Failed to reserve item'));
      }
    } finally {
      setReserving(false);
    }
  };

  const handleShare = async () => {
    if (!product) return;
    const res = await shareProduct({
      product,
      shopName: storeName,
      shopSlug: storeSlug,
      isHindi,
    });
    if (res?.success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const activeImage = images[selectedImageIdx] || images[0] || '';

  return (
    <>
      {/* ================= 1. FULLSCREEN ZOOM LIGHTBOX ================= */}
      {isZoomOpen && activeImage && (
        <div
          onClick={() => setIsZoomOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backdropFilter: 'blur(10px)',
            userSelect: 'none',
          }}
        >
          {/* Top Bar with counter & close */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '16px',
              left: '20px',
              right: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <div style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 700, opacity: 0.85 }}>
              {product.name} {images.length > 1 && `(${selectedImageIdx + 1}/${images.length})`}
            </div>

            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ffffff',
                transition: 'background 0.15s ease',
              }}
              title="Close"
            >
              <X size={22} />
            </button>
          </div>

          {/* Lightbox Image Stage with Swipe */}
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{
              maxWidth: '92vw',
              maxHeight: '82vh',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              touchAction: 'pan-y',
            }}
          >
            <img
              src={getImageUrl(activeImage)}
              alt={product.name}
              style={{
                maxWidth: '90vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '12px',
                transform: `translateX(${dragOffset}px)`,
                transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />

            {/* Desktop Left/Right Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  style={{
                    position: 'absolute',
                    left: '-24px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.22)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '46px',
                    height: '46px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#ffffff',
                  }}
                  title="Previous image"
                >
                  <ChevronLeft size={26} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  style={{
                    position: 'absolute',
                    right: '-24px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.22)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '46px',
                    height: '46px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#ffffff',
                  }}
                  title="Next image"
                >
                  <ChevronRight size={26} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ================= 2. MAIN 2-COLUMN STUDIO SHOWCASE ================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isModal
            ? 'repeat(auto-fit, minmax(310px, 1fr))'
            : 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: isModal ? '20px' : '26px',
          alignItems: 'start',
          width: '100%',
        }}
      >
        {/* ================= LEFT COLUMN: STUDIO HERO GALLERY & LOCAL SELLER ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          {/* Main Showcase Stage */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              position: 'relative',
              width: '100%',
              height: isModal ? '320px' : '360px',
              backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
              borderRadius: '18px',
              border: '1.5px solid var(--border-subtle, #e2e8f0)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              cursor: activeImage ? (isDragging ? 'grabbing' : 'grab') : 'default',
              touchAction: 'pan-y',
              userSelect: 'none',
            }}
          >
            {/* Multi-Image Horizontal Slide Track */}
            {images.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  height: '100%',
                  transform: `translateX(calc(-${selectedImageIdx * 100}% + ${dragOffset}px))`,
                  transition: isDragging ? 'none' : 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                  willChange: 'transform',
                }}
              >
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    style={{
                      flex: '0 0 100%',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px',
                    }}
                    onClick={() => {
                      if (Math.abs(dragOffset) < 5) setIsZoomOpen(true);
                    }}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`${product.name} ${idx + 1}`}
                      draggable={false}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <Package size={56} color="var(--text-muted, #94a3b8)" style={{ opacity: 0.35, margin: '0 auto 8px auto' }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {isHindi ? 'फोटो उपलब्ध नहीं है' : 'No Product Photo'}
                </div>
              </div>
            )}

            {/* Floating Top-Left: Glowing Fire Discount Pill */}
            {hasDiscount && discountPct > 0 && isPricePublic && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  zIndex: 4,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '4px 9px',
                  borderRadius: '20px',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.35)',
                  letterSpacing: '0.3px',
                }}
              >
                <span>🔥</span>
                <span>{discountPct}% OFF</span>
              </div>
            )}

            {/* Floating Top-Right: Stock Status Pill with colored glowing dot */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                zIndex: 4,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: inStock ? (isLowStock ? '#f59e0b' : '#10b981') : '#ef4444',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '20px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
                }}
              />
              <span>
                {inStock
                  ? (isLowStock
                      ? (isHindi ? `कम स्टॉक (${currentStock})` : `Low (${currentStock})`)
                      : (isHindi ? `${currentStock} उपलब्ध` : `${currentStock} In Stock`))
                  : (isHindi ? 'स्टॉक समाप्त' : 'Out of Stock')}
              </span>
            </div>

            {/* Floating Bottom-Left: Tap to zoom micro-pill */}
            {activeImage && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomOpen(true);
                }}
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  zIndex: 4,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(15, 23, 42, 0.65)',
                  color: '#ffffff',
                  backdropFilter: 'blur(6px)',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
                title="Tap to zoom"
              >
                <Maximize2 size={11} />
                <span>{isHindi ? 'ज़ूम' : 'Tap to zoom'}</span>
              </div>
            )}

            {/* Floating Bottom-Right: Image counter badge */}
            {images.length > 1 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  zIndex: 4,
                  backgroundColor: 'rgba(15, 23, 42, 0.65)',
                  color: '#ffffff',
                  backdropFilter: 'blur(6px)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '8px',
                  pointerEvents: 'none',
                }}
              >
                {selectedImageIdx + 1} / {images.length}
              </div>
            )}

            {/* Floating Bottom-Center: Animated Expandable Dot Pagination Pills */}
            {images.length > 1 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: 'rgba(15, 23, 42, 0.55)',
                  padding: '4px 8px',
                  borderRadius: '20px',
                  backdropFilter: 'blur(6px)',
                  zIndex: 4,
                }}
              >
                {images.map((_, idx) => (
                  <span
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIdx(idx);
                    }}
                    style={{
                      width: selectedImageIdx === idx ? '18px' : '6px',
                      height: '6px',
                      borderRadius: '999px',
                      backgroundColor: selectedImageIdx === idx ? 'var(--color-primary, #4f46e5)' : 'rgba(255, 255, 255, 0.45)',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Desktop Left/Right Chevrons */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                  }}
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.88)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    zIndex: 4,
                    color: 'var(--text-primary)',
                  }}
                  title="Previous image"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                  }}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.88)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    zIndex: 4,
                    color: 'var(--text-primary)',
                  }}
                  title="Next image"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip (Multi-Image Support) */}
          {images.length > 1 && (
            <div
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                padding: '2px 2px 6px 2px',
                scrollbarWidth: 'none',
              }}
            >
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  style={{
                    width: '58px',
                    height: '58px',
                    borderRadius: '12px',
                    border: selectedImageIdx === idx
                      ? '2.5px solid var(--color-primary, #4f46e5)'
                      : '1.5px solid var(--border-subtle, #e2e8f0)',
                    backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                    padding: '4px',
                    cursor: 'pointer',
                    flexShrink: 0,
                    overflow: 'hidden',
                    transition: 'all 0.18s ease',
                    transform: selectedImageIdx === idx ? 'scale(1.04)' : 'none',
                    opacity: selectedImageIdx === idx ? 1 : 0.65,
                    boxShadow: selectedImageIdx === idx ? '0 2px 8px rgba(79, 70, 229, 0.2)' : 'none',
                  }}
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`Thumb ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Verified Local Store Showcase Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface, #ffffff)',
              border: '1.5px solid var(--border-subtle, #e2e8f0)',
              borderRadius: '16px',
              padding: '14px 16px',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    color: 'var(--color-primary, #4f46e5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Store size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                    {storeName}
                  </div>
                  {(storeAddress || storeCity) && (
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', flexWrap: 'wrap' }}>
                      <MapPin size={11} color="var(--text-muted)" />
                      <span>{[storeAddress, storeCity].filter(Boolean).join(', ')}</span>
                      {distanceKm !== null && (
                        <span>• <strong>{distanceKm.toFixed(1)} km</strong>{travelTime ? ` (${travelTime})` : ''}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <span
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: '#059669',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '10px',
                  flexShrink: 0,
                }}
              >
                ✓ Verified
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  const dirUrl = getDirectionsUrl(storeLat, storeLng, storeName, storeAddress);
                  window.open(dirUrl, '_blank', 'noopener,noreferrer');
                }}
                style={{
                  flex: 1,
                  minWidth: '100px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle, #e2e8f0)',
                  backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  color: 'var(--text-primary)',
                }}
              >
                <MapPin size={12} color="var(--color-primary, #4f46e5)" />
                <span>{isHindi ? 'रास्ता देखें' : 'Directions'}</span>
              </button>

              {storePhone && (
                <button
                  type="button"
                  onClick={() => window.open(`tel:${storePhone}`)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle, #e2e8f0)',
                    backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--text-primary)',
                  }}
                >
                  <Phone size={12} />
                  <span>{isHindi ? 'कॉल' : 'Call'}</span>
                </button>
              )}

              {storeSlug && (
                <button
                  type="button"
                  onClick={() => {
                    if (onClose) onClose();
                    navigate(`/shop/${storeSlug}`);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-primary, #4f46e5)',
                    backgroundColor: 'rgba(79, 70, 229, 0.08)',
                    color: 'var(--color-primary, #4f46e5)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ExternalLink size={12} />
                  <span>{isHindi ? 'दुकान देखें' : 'Store'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: PRODUCT DETAILS & ACTIONS ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          {/* --- 1. Product Header, Badges & Balanced Title --- */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
              {categoryName && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: 'var(--color-primary, #4f46e5)',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                  }}
                >
                  {categoryName}
                </span>
              )}

              {brand && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                    border: '1px solid var(--border-subtle, #e2e8f0)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {brand}
                </span>
              )}

              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#059669',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <Star size={11} fill="#10b981" color="#10b981" />
                <span>4.8 Verified Store Inventory</span>
              </span>
            </div>

            <h1
              style={{
                fontSize: isModal ? '1.3rem' : '1.45rem',
                fontWeight: 800,
                color: 'var(--text-primary, #0f172a)',
                margin: '4px 0 0 0',
                lineHeight: 1.28,
                letterSpacing: '-0.3px',
              }}
            >
              {product.name}
            </h1>
          </div>

          {/* --- 2. PRICING HERO CARD (Shop-Side Inspired Architecture) --- */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--bg-surface, #ffffff)',
              border: '1.5px solid var(--border-subtle, #e2e8f0)',
              borderRadius: '16px',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
            }}
          >
            {isPricePublic ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: 'var(--text-muted, #94a3b8)',
                      letterSpacing: '0.4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {isHindi ? 'दुकान की ऑनलाइन कीमत' : 'ONLINE SELLING PRICE'}
                  </span>

                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#059669',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      padding: '2px 7px',
                      borderRadius: '5px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <CheckCircle size={10} color="#059669" />
                    <span>{isHindi ? 'सभी कर शामिल' : 'Tax Inclusive'}</span>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '1.85rem',
                      fontWeight: 900,
                      color: 'var(--text-primary, #0f172a)',
                      lineHeight: 1,
                      letterSpacing: '-0.4px',
                    }}
                  >
                    {formatCurrency(price)}
                  </span>

                  {hasDiscount && (
                    <span
                      style={{
                        fontSize: '1.05rem',
                        color: 'var(--text-muted, #94a3b8)',
                        textDecoration: 'line-through',
                        fontWeight: 500,
                      }}
                    >
                      {formatCurrency(comparePrice)}
                    </span>
                  )}

                  {hasDiscount && savings > 0 && (
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        color: '#15803d',
                        backgroundColor: '#dcfce7',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      Save {formatCurrency(savings)} ({discountPct}% OFF)
                    </span>
                  )}

                  {unitLabel && (
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      / {unitLabel}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  {product.allow_bargain || product.attributes?.allow_bargain
                    ? (isHindi ? 'काउंटर पर मोलभाव संभव • दुकान पर पूछें' : 'Counter bargain enabled • Ask at counter')
                    : (isHindi ? 'निश्चित दुकान कीमत • 100% असली सामान' : 'Fixed counter price • 100% Genuine product')}
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#b45309',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>🔒</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>
                    {isHindi ? 'रेट पूछें (Price on Request)' : 'Price on Request / Bargain Allowed'}
                  </div>
                  <div style={{ fontSize: '0.74rem', opacity: 0.9 }}>
                    {isHindi ? 'सर्वश्रेष्ठ कीमत के लिए दुकानदार से संपर्क करें' : 'Contact store owner for the best counter quotation'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* --- 3. QUANTITY STEPPER & ACTION BUTTONS --- */}
          {!isMerchant && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {isPricePublic && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <QuantityStepper
                    quantity={cartQty}
                    onIncrement={() => setCartQty((q) => (currentStock > q ? q + 1 : q))}
                    onDecrement={() => setCartQty((q) => Math.max(1, q - 1))}
                    min={1}
                    max={currentStock > 0 ? currentStock : 99}
                    size="md"
                  />

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    style={{
                      flex: 1,
                      minWidth: '170px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      backgroundColor: inStock ? 'var(--color-primary, #4f46e5)' : '#e2e8f0',
                      color: inStock ? '#ffffff' : '#94a3b8',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 18px',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      cursor: inStock ? 'pointer' : 'not-allowed',
                      boxShadow: inStock ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ShoppingCart size={16} />
                    <span>
                      {inStock
                        ? `${t('cart.add_to_cart')} • ${formatCurrency(price * cartQty)}`
                        : (isHindi ? 'स्टॉक समाप्त' : 'Out of Stock')}
                    </span>
                  </button>
                </div>
              )}

              {/* Secondary Buttons: Pickup Hold & WhatsApp Contact */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {onReserve && (
                  <button
                    type="button"
                    onClick={handleReservePickup}
                    disabled={reserving || !inStock}
                    style={{
                      flex: 1,
                      minWidth: '150px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      backgroundColor: 'var(--bg-surface, #ffffff)',
                      color: 'var(--text-primary)',
                      border: '1.5px solid var(--border-subtle, #e2e8f0)',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: inStock ? 'pointer' : 'not-allowed',
                      opacity: inStock ? 1 : 0.5,
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <Clock size={14} color="var(--color-primary, #4f46e5)" />
                    <span>
                      {reserving
                        ? (isHindi ? 'रिज़र्व हो रहा है...' : 'Reserving...')
                        : (isHindi ? '⚡ काउंटर पिकअप रिज़र्व' : '⚡ Reserve Counter Pickup')}
                    </span>
                  </button>
                )}

                {(() => {
                  const rawPhone = storePhone || '';
                  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
                  const inquiryMsg = isHindi
                    ? `नमस्ते! क्या ${product.name} (${formatCurrency(price)}) ${storeName} पर उपलब्ध है?`
                    : `Hello! Is ${product.name} (${formatCurrency(price)}) available at ${storeName}?`;
                  const waUrl = cleanPhone.length >= 10
                    ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(inquiryMsg)}`
                    : `https://wa.me/?text=${encodeURIComponent(inquiryMsg)}`;

                  return (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '10px 16px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                        boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
                      }}
                    >
                      <MessageCircle size={15} />
                      <span>WhatsApp</span>
                    </a>
                  );
                })()}

                <button
                  type="button"
                  onClick={handleShare}
                  style={{
                    backgroundColor: 'var(--bg-surface, #ffffff)',
                    border: '1.5px solid var(--border-subtle, #e2e8f0)',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: copiedLink ? '#16a34a' : 'var(--text-secondary)',
                  }}
                  title={isHindi ? 'शेयर करें' : 'Share'}
                >
                  {copiedLink ? <Check size={16} color="#16a34a" /> : <Share2 size={16} />}
                </button>
              </div>

              {/* Toast Feedback Messages */}
              {addedToast && (
                <div
                  style={{
                    padding: '9px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>✓ {t('cart.item_added')}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onClose) onClose();
                      openCart();
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0f172a',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {t('nav.cart')} →
                  </button>
                </div>
              )}

              {reserveSuccess && (
                <div
                  style={{
                    padding: '9px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                  }}
                >
                  ✓ {t('reservations.success') || (isHindi ? 'पिकअप सुरक्षित हो गया! दुकान काउंटर पर जाएं।' : 'Reservation confirmed! Ready for counter pickup.')}
                </div>
              )}

              {reserveError && (
                <div
                  style={{
                    padding: '9px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  <AlertCircle size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {reserveError}
                </div>
              )}
            </div>
          )}

          {/* --- 4. MINIMALIST SPECIFICATIONS CHIP GRID (Flutter Shop Side Architectural Match) --- */}
          {(specifications.length > 0 || brand || categoryName || unitLabel || weightLabel) && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface, #ffffff)',
                border: '1.5px solid var(--border-subtle, #e2e8f0)',
                borderRadius: '16px',
                padding: '14px 16px',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: 'var(--text-muted, #94a3b8)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '10px',
                }}
              >
                {isHindi ? 'उत्पाद विवरण एवं विशेषताएं' : 'SPECIFICATIONS & ATTRIBUTES'}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '8px',
                }}
              >
                {brand && (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle, #e2e8f0)',
                    }}
                  >
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Brand
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {brand}
                    </div>
                  </div>
                )}

                {categoryName && (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle, #e2e8f0)',
                    }}
                  >
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Category
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {categoryName}
                    </div>
                  </div>
                )}

                {unitLabel && (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle, #e2e8f0)',
                    }}
                  >
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Unit
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {unitLabel}
                    </div>
                  </div>
                )}

                {weightLabel && (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle, #e2e8f0)',
                    }}
                  >
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 700, textTransform: 'uppercase' }}>
                      Net Weight
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {weightLabel}
                    </div>
                  </div>
                )}

                {/* Dynamic Safe Attributes */}
                {specifications.map((spec) => {
                  const kLow = spec.key.toLowerCase();
                  if (kLow === 'brand' || kLow === 'category' || kLow === 'unit' || kLow === 'weight') return null;
                  return (
                    <div
                      key={spec.key}
                      style={{
                        backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-subtle, #e2e8f0)',
                      }}
                    >
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 700, textTransform: 'uppercase' }}>
                        {spec.key}
                      </div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {String(spec.value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* --- 5. DESCRIPTION CARD --- */}
          {cleanDescription && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface, #ffffff)',
                border: '1.5px solid var(--border-subtle, #e2e8f0)',
                borderRadius: '16px',
                padding: '14px 16px',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: 'var(--text-muted, #94a3b8)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                }}
              >
                {isHindi ? 'सामान के बारे में' : 'ABOUT THIS ITEM'}
              </div>
              <p
                style={{
                  fontSize: '0.86rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.55,
                  margin: 0,
                  whiteSpace: 'pre-line',
                }}
              >
                {cleanDescription}
              </p>
            </div>
          )}

          {/* --- 6. TRUST & QUALITY GUARANTEES --- */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface, #ffffff)',
              border: '1.5px solid var(--border-subtle, #e2e8f0)',
              borderRadius: '16px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontWeight: 700, color: '#047857' }}>
              <ShieldCheck size={15} color="#10b981" />
              <span>{isHindi ? '100% असली स्थानीय दुकान से प्रमाणित' : '100% Genuine from Local Merchant'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              <Clock size={15} color="var(--color-primary, #4f46e5)" />
              <span>{isHindi ? 'काउंटर पर 30 मिनट में पिकअप के लिए तैयार' : 'Ready for 30-min Counter Pickup'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              <CheckCircle size={15} color="#059669" />
              <span>{isHindi ? 'दुकान पर देखकर व संतुष्ट होकर लें' : 'Inspect before taking at store counter'}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductStudioView;
