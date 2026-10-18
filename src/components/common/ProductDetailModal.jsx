/**
 * ProductDetailModal Component
 *
 * Ultra-Clean, Modern & Product-Focused View for ShopSilo Customer Platform.
 * Robust Image Parsing, Price Normalization, & Touch Finger Swiping.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
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
} from 'lucide-react';
import { getImageUrl, extractAllImages } from '../../utils/imageUrl';
import { QuantityStepper } from '../ui';
import { formatCurrency } from '../../utils/format';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { shareProduct, getProductShareUrl } from '../../utils/productShare';
import { parseProductDetails } from '../../utils/productDetailsHelper';

export const ProductDetailModal = ({
  product,
  onClose,
  onReserve,
  isMerchant = false,
}) => {
  const { addItem, openCart } = useCart();
  const { isHindi, t } = useLanguage();

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [cartQty, setCartQty] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Touch Swipe Gesture State
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchEndRef = useRef({ x: 0, y: 0 });

  // Reserve state
  const [reserving, setReserving] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [reserveError, setReserveError] = useState(null);

  // Share feedback
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setSelectedImageIdx(0);
    setCartQty(1);
    setReserveError(null);
    setReserveSuccess(false);
  }, [product?.id]);

  if (!product) return null;

  // Robustly extract all image URLs (supports JSON string, arrays, comma-separated)
  const images = extractAllImages(
    product.images ||
    product.image ||
    product.image_url ||
    product.photos ||
    product.image_urls
  );

  const currentStock = Number(
    product.available_quantity ??
    product.stock_quantity ??
    product.inventory?.available_quantity ??
    product.inventory?.quantity ??
    product.stock ??
    99
  );
  const inStock = currentStock > 0;

  const price = Number(
    product.price ??
    product.selling_price ??
    product.offer_price ??
    0
  );

  const comparePrice = Number(
    product.compare_price ??
    product.mrp ??
    product.original_price ??
    0
  );

  const hasDiscount = comparePrice > price && price > 0;
  const savings = hasDiscount ? comparePrice - price : 0;
  const discountPct = hasDiscount ? Math.round((savings / comparePrice) * 100) : 0;

  const categoryName = typeof product.category === 'object'
    ? (product.category?.name || product.category_name || '')
    : String(product.category_name || product.category || '');

  const isPricePublic = product.is_price_public !== false && 
                        product.isPricePublic !== false && 
                        product.attributes?.is_price_public !== false && 
                        product.attributes?.is_price_public !== 'false' && 
                        !product.hide_price &&
                        price > 0;

  // Touch Swipe Event Handlers for Finger Swiping Images
  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    touchEndRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touchEndRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
    if (images.length <= 1) return;
    const deltaX = touchStartRef.current.x - touchEndRef.current.x;
    const deltaY = touchStartRef.current.y - touchEndRef.current.y;

    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        setSelectedImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      } else {
        setSelectedImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      }
    }
  };

  // Complete specifications & description parsing with Privacy Shield
  const parsedDetails = parseProductDetails(product, isHindi);
  const brand = parsedDetails.brand || product.brand || '';
  const cleanDescription = parsedDetails.cleanDescription || product.description || '';
  const safeAttributes = parsedDetails.specifications.map((s) => [s.key, s.value]);
  const hasSpecifications = Boolean(brand || categoryName || (product.weight && Number(product.weight) > 0) || safeAttributes.length > 0 || product.unit || parsedDetails.unit);

  const handleAddToCart = () => {
    addItem(product, cartQty);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleQuickReserve = async () => {
    if (!onReserve) return;
    setReserving(true);
    setReserveError(null);
    try {
      await onReserve({
        product,
        quantity: Number(cartQty),
        hold_hours: 4,
        notes: '',
      });
      setReserveSuccess(true);
      setTimeout(() => setReserveSuccess(false), 3000);
    } catch (err) {
      setReserveError(err?.message || (isHindi ? 'रिजर्वेशन विफल रहा' : 'Failed to reserve item'));
    } finally {
      setReserving(false);
    }
  };

  const handleShareProduct = async () => {
    const res = await shareProduct({
      product,
      shopName: product.shop_name,
      shopSlug: product.shop_slug,
      isHindi,
    });
    if (res.method === 'native' && res.success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else if (!res.success && res.method !== 'cancelled') {
      const shareUrl = res?.url || getProductShareUrl({ product, shopSlug: product.shop_slug });
      navigator.clipboard?.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const activeImage = images[selectedImageIdx] || images[0] || '';

  return (
    <>
      {/* --- 1. FULLSCREEN ZOOM LIGHTBOX MODAL --- */}
      {isZoomOpen && activeImage && (
        <div
          onClick={() => setIsZoomOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.94)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
            }}
            title={t('common.close')}
            aria-label={t('common.close')}
          >
            <X size={24} />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              touchAction: 'pan-y',
            }}
          >
            <img
              src={getImageUrl(activeImage)}
              alt={product.name}
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: '8px',
                userSelect: 'none',
              }}
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  style={{
                    position: 'absolute',
                    left: '-20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#ffffff',
                  }}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  style={{
                    position: 'absolute',
                    right: '-20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#ffffff',
                  }}
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- 2. MAIN CLEAN PRODUCT DETAIL MODAL --- */}
      <div className="modal-overlay modal-backdrop" onClick={onClose} style={{ zIndex: 120, padding: '16px' }}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '920px',
            maxHeight: '90vh',
            margin: 'auto',
            backgroundColor: 'var(--bg-surface, #ffffff)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Top Clean Header */}
          <div
            style={{
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
              backgroundColor: 'var(--bg-surface, #ffffff)',
              flexShrink: 0,
            }}
          >
            {/* Category Breadcrumb */}
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {typeof product.category === 'object'
                ? (product.category?.name || t('products.product_details'))
                : (product.category || t('products.product_details'))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleShareProduct}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
                title={copiedLink ? (isHindi ? 'कॉपी हुआ!' : 'Copied!') : (isHindi ? 'शेयर' : 'Share')}
                aria-label="Share product"
              >
                {copiedLink ? <CheckCircle size={15} color="#10b981" /> : <Share2 size={15} />}
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#0f172a',
                }}
                title={t('common.close')}
                aria-label={t('common.close')}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body Grid */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* LEFT COLUMN: HERO IMAGE STAGE WITH TOUCH FINGER SWIPING */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                  width: '100%',
                  height: '300px',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  cursor: activeImage ? 'zoom-in' : 'default',
                  touchAction: 'pan-y',
                  userSelect: 'none',
                }}
                onClick={() => {
                  if (activeImage) setIsZoomOpen(true);
                }}
              >
                {activeImage ? (
                  <img
                    src={getImageUrl(activeImage)}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      padding: '16px',
                      transition: 'transform 0.2s ease',
                      pointerEvents: 'none',
                    }}
                  />
                ) : (
                  <Package size={54} color="#94a3b8" style={{ opacity: 0.3 }} />
                )}

                {/* Minimal Discount Badge */}
                {hasDiscount && discountPct > 0 && (
                  <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}>
                    <span style={{ backgroundColor: '#dc2626', color: '#ffffff', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                      {discountPct}% OFF
                    </span>
                  </div>
                )}

                {/* Active Dots Indicator for Multi-Image Swiping */}
                {images.length > 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: 'rgba(15, 23, 42, 0.65)',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      backdropFilter: 'blur(4px)',
                      zIndex: 3,
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
                          width: selectedImageIdx === idx ? '14px' : '6px',
                          height: '6px',
                          borderRadius: '3px',
                          backgroundColor: selectedImageIdx === idx ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Zoom hint */}
                {activeImage && images.length <= 1 && (
                  <div style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(15, 23, 42, 0.7)', color: '#ffffff', borderRadius: '6px', padding: '4px 8px', fontSize: '0.68rem', fontWeight: 700, pointerEvents: 'none' }}>
                    <Maximize2 size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    Zoom
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImageIdx(idx)}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '8px',
                        backgroundColor: '#f8fafc',
                        border: selectedImageIdx === idx ? '2px solid #0f172a' : '1px solid #e2e8f0',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: selectedImageIdx === idx ? 1 : 0.6,
                      }}
                    >
                      <img src={getImageUrl(img)} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: PRODUCT INFO & ACTIONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                {brand && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {brand}
                  </span>
                )}
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0', lineHeight: 1.3 }}>
                  {product.name}
                </h1>
              </div>

              {/* Price Row */}
              <div style={{ padding: '14px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                {isPricePublic ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                        {formatCurrency(price)}
                      </span>
                      {hasDiscount && (
                        <span style={{ fontSize: '1rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 500 }}>
                          {formatCurrency(comparePrice)}
                        </span>
                      )}
                      {hasDiscount && savings > 0 && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803d', backgroundColor: '#dcfce7', padding: '3px 8px', borderRadius: '4px' }}>
                          Save {formatCurrency(savings)}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={13} color="#16a34a" />
                      <span>{isHindi ? 'सभी कर शामिल' : 'Inclusive of all taxes'}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#d97706' }}>
                    🔒 {isHindi ? 'मोलभाव करें / Rate on Request' : 'Price on Request / Bargain Allowed'}
                  </div>
                )}
              </div>

              {/* Quantity & Actions */}
              {!isMerchant && isPricePublic && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
                        minWidth: '180px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        backgroundColor: inStock ? '#0f172a' : '#f1f5f9',
                        color: inStock ? '#ffffff' : '#94a3b8',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '12px 18px',
                        fontSize: '0.92rem',
                        fontWeight: 800,
                        cursor: inStock ? 'pointer' : 'not-allowed',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <ShoppingCart size={16} />
                      <span>{inStock ? `${t('cart.add_to_cart')} • ${formatCurrency(price * cartQty)}` : (isHindi ? 'स्टॉक समाप्त' : 'Out of Stock')}</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {onReserve && (
                      <button
                        type="button"
                        onClick={handleQuickReserve}
                        disabled={reserving || !inStock}
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          backgroundColor: '#ffffff',
                          color: '#0f172a',
                          border: '1.5px solid #0f172a',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          cursor: inStock ? 'pointer' : 'not-allowed',
                          opacity: inStock ? 1 : 0.5,
                        }}
                      >
                        <Clock size={15} />
                        <span>{reserving ? (isHindi ? 'रिज़र्व...' : 'Reserving...') : (isHindi ? '⚡ काउंटर पिकअप रिज़र्व' : '⚡ Reserve In-Store Pickup')}</span>
                      </button>
                    )}

                    {(() => {
                      const rawPhone = product.shop_phone || product.shop?.phone || '';
                      const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
                      const sName = product.shop_name || product.shop?.name || '';
                      const inquiryMsg = isHindi
                        ? `नमस्ते! क्या ${product.name} (${formatCurrency(price)}) उपलब्ध है?`
                        : `Hello! Is ${product.name} (${formatCurrency(price)}) available?`;
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
                            borderRadius: '10px',
                            padding: '10px 14px',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            textDecoration: 'none',
                          }}
                        >
                          <MessageCircle size={15} />
                          <span>WhatsApp</span>
                        </a>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Toast Messages */}
              {addedToast && (
                <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.82rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>✓ {t('cart.item_added')}</span>
                  <button type="button" onClick={() => { onClose(); openCart(); }} style={{ background: 'none', border: 'none', color: '#0f172a', fontWeight: 800, cursor: 'pointer' }}>
                    {t('nav.cart')} →
                  </button>
                </div>
              )}

              {reserveSuccess && (
                <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.82rem', fontWeight: 700 }}>
                  ✓ {t('reservations.success') || 'Reservation confirmed! Ready for counter pickup.'}
                </div>
              )}

              {reserveError && (
                <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.82rem', fontWeight: 600 }}>
                  <AlertCircle size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {reserveError}
                </div>
              )}

              {/* Product Specifications Grid */}
              {hasSpecifications && (
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    {t('products.product_details')}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                    {brand && (
                      <div style={{ backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>Brand</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{brand}</div>
                      </div>
                    )}
                    {categoryName && (
                      <div style={{ backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>Category</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{categoryName}</div>
                      </div>
                    )}
                    {product.weight > 0 && (
                      <div style={{ backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>{t('products.weight')}</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{product.weight} kg</div>
                      </div>
                    )}
                    {product.unit && (
                      <div style={{ backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>Unit</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{product.unit}</div>
                      </div>
                    )}
                    {safeAttributes.map(([key, val]) => {
                      if (key.toLowerCase() === 'brand' && brand) return null;
                      const label = key.replace(/_/g, ' ').toUpperCase();
                      return (
                        <div key={key} style={{ backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>{label}</div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{String(val)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    {t('products.description')}
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#0f172a', lineHeight: 1.5, margin: 0 }}>
                    {product.description}
                  </p>
                </div>
              )}

              {/* Seller Card */}
              {!isMerchant && (product.shop_name || product.shop?.name) && (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Store size={12} color="#0f172a" />
                        <span>{t('products.seller_info')}</span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#0f172a', marginTop: '2px' }}>
                        {product.shop_name || product.shop?.name}
                      </div>
                      {(product.shop_address || product.shop_city) && (
                        <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={11} color="#94a3b8" />
                          <span>{[product.shop_address, product.shop_city].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      {product.shop_phone && (
                        <a href={`tel:${product.shop_phone}`} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#0f172a', textDecoration: 'none', fontWeight: 700, fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={13} />
                          <span>Call</span>
                        </a>
                      )}
                      {product.shop_slug && (
                        <a href={`/shop/${product.shop_slug}`} style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#0f172a', textDecoration: 'none', fontWeight: 800, fontSize: '0.78rem' }}>
                          {t('products.visit_storefront')} →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailModal;
