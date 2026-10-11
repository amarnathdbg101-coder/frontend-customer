/**
 * ProductDetailModal Component
 *
 * Pixel-perfect match with the ShopSilo Flutter Mobile OS & Flipkart-style studio showcase.
 * Features:
 * - Responsive 2-Column Desktop Studio & Fluid Mobile Bottom-Sheet Layout
 * - Studio Hero Gallery with Click-to-Zoom Fullscreen Lightbox
 * - Multi-Image Carousel with Arrow Controls & Thumbnail Navigation Strip
 * - Live Price & Strikethrough MRP with Green Savings Badge
 * - Quantity Stepper with Stock Limits & Dynamic "Add to Cart • ₹Price" Button
 * - 1-Click Quick In-Store Pickup Reserve with Real-Time Feedback
 * - Direct WhatsApp Merchant Inquiry with Pre-filled Product Details
 * - Key Specifications Grid with Private Merchant Field Privacy Shield
 * - Verified Local Seller Card with Locality, Direct Call & Storefront Link
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  Layers,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Store,
  MapPin,
  Phone,
  ShoppingCart,
  Plus,
  Minus,
  AlertCircle,
  MessageCircle,
  Maximize2,
  Clock,
  Flame,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { getCategoryEmoji } from '../../utils/categoryMeta';
import { getImageUrl } from '../../utils/imageUrl';
import { formatCurrency } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

export const ProductDetailModal = ({
  product,
  onClose,
  onReserve,
  onAdjustStock,
  isMerchant = false,
}) => {
  const { user } = useAuth();
  const { addItem, openCart } = useCart();
  const { isHindi, t } = useLanguage();

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [cartQty, setCartQty] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Reserve state
  const [reserving, setReserving] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [reserveError, setReserveError] = useState(null);

  // Share feedback
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setSelectedImageIdx(0);
    setCartQty(1);
  }, [product?.id]);

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : (product.image_url ? [product.image_url] : []);

  const currentStock = Number(
    product.available_quantity ??
    product.stock_quantity ??
    product.inventory?.available_quantity ??
    product.inventory?.quantity ??
    product.stock ??
    0
  );
  const inStock = currentStock > 0;

  const price = Number(product.price || 0);
  const comparePrice = Number(product.compare_price || product.mrp || 0);
  const hasDiscount = comparePrice > price;
  const savings = hasDiscount ? comparePrice - price : 0;
  const discountPct = hasDiscount ? Math.round((savings / comparePrice) * 100) : 0;

  const categoryName = typeof product.category === 'object'
    ? (product.category?.name || product.category_name || '')
    : String(product.category_name || product.category || '');

  const isPricePublic = product.is_price_public !== false && 
                        product.isPricePublic !== false && 
                        product.attributes?.is_price_public !== false && 
                        product.attributes?.is_price_public !== 'false' && 
                        price > 0 &&
                        !product.hide_price;

  const brand = product.brand ||
                product.attributes?.brand ||
                product.attributes?.Brand ||
                product.attributes?.company ||
                '';

  // Strict Private Merchant Blocklist (Zero leakage of internal shop metrics to customer)
  const PRIVATE_KEYS = [
    // Internal Financials & Purchase Costs
    'cost_price', 'costprice', 'cost', 'unit_profit', 'profit_margin_pct', 'profit',
    'margin', 'wholesale_price', 'wholesaleprice', 'purchase_price', 'kharid_price', 'cogs', 'markup',

    // Internal Bargaining Limits
    'floor_price', 'floorprice', 'min_price', 'bottom_price', 'allow_bargain', 'is_bargain_allowed',

    // Supplier & Dealer Contacts
    'supplier', 'supplier_name', 'distributor', 'distributor_name', 'vendor',
    'dealer', 'dealer_name', 'dealer_phone', 'wholesaler',

    // Internal Inventory Alert Thresholds & Counts
    'reorder_point', 'reorder_qty', 'threshold', 'stock_alert_threshold',
    'low_stock_threshold', 'min_stock', 'inventory',

    // Internal Codes, UUIDs & Barcodes
    'barcode', 'sku', 'id', 'uuid', 'shop_id', 'user_id', 'internal_code',

    // Internal System Flags & Redundant Category Keys
    'is_price_public', 'ispricepublic', 'hide_price', 'price_public', 'is_public', 'is_active', 'is_featured',
    'category', 'category_name', 'category_id', 'category_slug', 'unit', 'brand'
  ];

  const safeAttributes = Object.entries(product.attributes || {}).filter(([key, val]) => {
    if (val === null || val === undefined || val === '') return false;
    if (typeof val === 'boolean') return false; // Never render internal true/false flags
    if (PRIVATE_KEYS.includes(key.toLowerCase().trim())) return false;
    return true;
  });

  const hasSpecifications = Boolean(categoryName || (product.weight && Number(product.weight) > 0) || safeAttributes.length > 0 || product.unit);

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

  const handleShareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `${product.name} at ${formatCurrency(product.price)} on ShopSilo`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const activeImage = images[selectedImageIdx] || images[0];

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
              transition: 'background 0.2s',
            }}
            title={t('common.close')}
            aria-label={t('common.close')}
          >
            <X size={24} />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <img
              src={getImageUrl(activeImage)}
              alt={product.name}
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
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

      {/* --- 2. MAIN RESPONSIVE PRODUCT DETAIL MODAL --- */}
      <div className="modal-overlay modal-backdrop" onClick={onClose} style={{ zIndex: 120, padding: '16px' }}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '960px',
            maxHeight: '92vh',
            margin: 'auto',
            backgroundColor: 'var(--bg-surface, #ffffff)',
            borderRadius: '24px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.22)',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Top Bar Navigation */}
          <div
            style={{
              padding: '14px 22px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
              backgroundColor: 'var(--bg-surface, #ffffff)',
              flexShrink: 0,
            }}
          >
            {/* Category Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem' }}>
                {getCategoryEmoji(
                  typeof product.category === 'object'
                    ? (product.category?.slug || product.category?.name || '')
                    : String(product.category || '')
                )}
              </span>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary, #64748b)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {typeof product.category === 'object'
                  ? (product.category?.name || t('products.product_details'))
                  : (product.category || t('products.product_details'))}
              </span>
            </div>

            {/* Top Action Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={handleShareProduct}
                style={{
                  background: 'var(--bg-surface-subtle, #f8fafc)',
                  border: '1px solid var(--border-subtle, #e2e8f0)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-secondary, #64748b)',
                  transition: 'background 0.2s',
                }}
                title={copiedLink ? (isHindi ? 'लिंक कॉपी हो गया!' : 'Link Copied!') : (isHindi ? 'शेयर करें' : 'Share')}
                aria-label="Share product"
              >
                {copiedLink ? <CheckCircle size={17} color="#10b981" /> : <Share2 size={17} />}
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'var(--bg-surface-subtle, #f8fafc)',
                  border: '1px solid var(--border-subtle, #e2e8f0)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-primary, #0f172a)',
                  transition: 'background 0.2s',
                }}
                title={t('common.close')}
                aria-label={t('common.close')}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal Body: Responsive 2-Column Grid / Single Column Mobile Layout */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: '18px 20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              alignItems: 'start',
            }}
          >
            {/* === LEFT COLUMN: STUDIO HERO GALLERY === */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
              {/* Main Showcase Stage */}
              <div
                style={{
                  width: '100%',
                  height: '280px',
                  maxHeight: '40vh',
                  borderRadius: '16px',
                  backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-subtle, #e2e8f0)',
                  overflow: 'hidden',
                  cursor: activeImage ? 'zoom-in' : 'default',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                }}
                onClick={() => {
                  if (activeImage) setIsZoomOpen(true);
                }}
              >
                {activeImage ? (
                  <img
                    loading="lazy"
                    decoding="async"
                    src={getImageUrl(activeImage)}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      padding: '16px',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted, #94a3b8)' }}>
                    <Package size={64} style={{ opacity: 0.35, margin: '0 auto 10px auto' }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('products.no_photo')}</div>
                  </div>
                )}

                {/* Floating Top-Left Discount Badge */}
                {hasDiscount && discountPct > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      left: '14px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 10px rgba(239, 68, 68, 0.35)',
                      letterSpacing: '0.3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      zIndex: 2,
                    }}
                  >
                    <Flame size={13} fill="#ffffff" />
                    <span>{discountPct}% OFF</span>
                  </div>
                )}

                {/* Floating Top-Right Stock Status Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    backgroundColor: inStock ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
                    color: '#ffffff',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                    }}
                  />
                  <span>{inStock ? t('products.in_stock') : t('products.out_of_stock')}</span>
                </div>

                {/* Fullscreen Zoom Hint Button */}
                {activeImage && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                      color: '#ffffff',
                      borderRadius: '8px',
                      padding: '5px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backdropFilter: 'blur(4px)',
                      pointerEvents: 'none',
                    }}
                  >
                    <Maximize2 size={12} />
                    <span>Zoom</span>
                  </div>
                )}

                {/* Next / Previous Arrow Controls */}
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
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.92)',
                        border: '1px solid var(--border-subtle, #e2e8f0)',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 3,
                      }}
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={20} color="#0f172a" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                      }}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.92)',
                        border: '1px solid var(--border-subtle, #e2e8f0)',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 3,
                      }}
                      aria-label="Next image"
                    >
                      <ChevronRight size={20} color="#0f172a" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    overflowX: 'auto',
                    paddingBottom: '4px',
                    alignItems: 'center',
                  }}
                >
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImageIdx(idx)}
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                        border: selectedImageIdx === idx
                          ? '2.5px solid var(--color-primary, #2563eb)'
                          : '1px solid var(--border-subtle, #e2e8f0)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        flexShrink: 0,
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: selectedImageIdx === idx ? 1 : 0.65,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <img
                        loading="lazy"
                        decoding="async"
                        src={getImageUrl(img)}
                        alt={`Thumbnail ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* === RIGHT COLUMN: PRODUCT INTELLIGENCE & COMMERCE HUB === */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Product Header */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {brand && (
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        backgroundColor: 'rgba(37,99,235,0.08)',
                        color: 'var(--color-primary, #2563eb)',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        letterSpacing: '0.3px',
                      }}
                    >
                      {brand}
                    </span>
                  )}
                  {product.unit && (
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                        color: 'var(--text-secondary, #64748b)',
                        padding: '3px 10px',
                        borderRadius: '6px',
                      }}
                    >
                      Per {product.unit}
                    </span>
                  )}
                </div>

                <h1
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 800,
                    color: 'var(--text-primary, #0f172a)',
                    lineHeight: 1.3,
                    margin: 0,
                  }}
                >
                  {product.name}
                </h1>
              </div>

                            {/* Pricing Hero Card */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                  border: '1px solid var(--border-subtle, #e2e8f0)',
                  borderRadius: '16px',
                  padding: '16px 18px',
                }}
              >
                {isPricePublic ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '1.85rem',
                          fontWeight: 900,
                          color: 'var(--color-primary, #2563eb)',
                          lineHeight: 1,
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
                            fontWeight: 600,
                          }}
                        >
                          {formatCurrency(comparePrice)}
                        </span>
                      )}

                      {hasDiscount && savings > 0 && (
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            color: '#15803d',
                            backgroundColor: '#dcfce7',
                            padding: '4px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          {isHindi ? `बचत ${formatCurrency(savings)}` : `Save ${formatCurrency(savings)}`} ({discountPct}% OFF)
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: '0.74rem',
                        color: 'var(--text-muted, #94a3b8)',
                        fontWeight: 600,
                        marginTop: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <ShieldCheck size={14} color="#10b981" />
                      <span>{isHindi ? 'सभी कर शामिल (Inclusive of all taxes)' : 'Inclusive of all taxes'}</span>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <span>🔒</span>
                        <span>{isHindi ? 'मोलभाव करें / Price on Request' : 'Price on Request / Bargain Allowed'}</span>
                      </span>
                    </div>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary, #64748b)' }}>
                      {isHindi ? 'दुकानदार से बेस्ट रेट प्राप्त करने के लिए WhatsApp पर चैट करें या सीधे स्टोर विजिट करें।' : 'Contact the store on WhatsApp or visit directly to negotiate the best price.'}
                    </span>
                  </div>
                )}
              </div>

              {/* Quantity Stepper & Cart / Reserve Action Station */}
              {!isMerchant && inStock && isPricePublic && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    {/* Tactile Quantity Stepper */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        border: '1.5px solid var(--border-subtle, #e2e8f0)',
                        borderRadius: '12px',
                        padding: '6px 12px',
                        backgroundColor: 'var(--bg-surface, #ffffff)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setCartQty((q) => Math.max(1, q - 1))}
                        disabled={cartQty <= 1}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: cartQty <= 1 ? 'not-allowed' : 'pointer',
                          color: cartQty <= 1 ? 'var(--text-muted, #cbd5e1)' : 'var(--text-primary, #0f172a)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '2px',
                        }}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>

                      <span
                        style={{
                          fontSize: '1rem',
                          fontWeight: 800,
                          minWidth: '24px',
                          textAlign: 'center',
                          color: 'var(--text-primary, #0f172a)',
                        }}
                      >
                        {cartQty}
                      </span>

                      <button
                        type="button"
                        onClick={() => setCartQty((q) => (currentStock > q ? q + 1 : q))}
                        disabled={cartQty >= currentStock}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: cartQty >= currentStock ? 'not-allowed' : 'pointer',
                          color: cartQty >= currentStock ? 'var(--text-muted, #cbd5e1)' : 'var(--text-primary, #0f172a)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '2px',
                        }}
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Primary Add to Cart Button */}
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      style={{
                        flex: 1,
                        minWidth: '200px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        backgroundColor: 'var(--color-primary, #2563eb)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 20px',
                        fontSize: '0.94rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                        transition: 'transform 0.1s ease',
                      }}
                      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
                      onMouseUp={(e) => (e.currentTarget.style.transform = 'none')}
                    >
                      <ShoppingCart size={18} />
                      <span>{t('cart.add_to_cart')} • {formatCurrency(price * cartQty)}</span>
                    </button>
                  </div>

                  {/* Secondary WhatsApp Inquiry Row */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {(() => {
                      const rawPhone = product.shop_phone || product.shop?.phone || '';
                      const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
                      const sName = product.shop_name || product.shop?.name || (isHindi ? 'दुकानदार' : 'Store');
                      const inquiryMsg = isHindi
                        ? `नमस्ते ${sName}! क्या ${product.name} (${formatCurrency(price)}) अभी आपकी दुकान पर उपलब्ध है?`
                        : `Hello ${sName}! Is ${product.name} (${formatCurrency(price)}) currently available at your store?`;
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
                            backgroundColor: '#25d366',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 16px',
                            fontSize: '0.86rem',
                            fontWeight: 800,
                            textDecoration: 'none',
                            boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
                          }}
                        >
                          <MessageCircle size={16} />
                          <span>{isHindi ? 'व्हाट्सएप पूछताछ' : 'WhatsApp Shop'}</span>
                        </a>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* If price is hidden or bargain item, prominent WhatsApp Price Inquiry CTA */}
              {!isMerchant && inStock && !isPricePublic && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {(() => {
                    const rawPhone = product.shop_phone || product.shop?.phone || '';
                    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
                    const sName = product.shop_name || product.shop?.name || (isHindi ? 'दुकानदार' : 'Store');
                    const inquiryMsg = isHindi
                      ? `नमस्ते ${sName}! मुझे ${product.name} का बेस्ट रेट जानना है। क्या यह आपकी दुकान पर उपलब्ध है?`
                      : `Hello ${sName}! I would like to inquire about the best price for ${product.name}. Is it available at your store?`;
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
                          gap: '8px',
                          backgroundColor: '#25d366',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '12px 20px',
                          fontSize: '0.94rem',
                          fontWeight: 800,
                          textDecoration: 'none',
                          boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                          flex: 1,
                        }}
                      >
                        <MessageCircle size={18} />
                        <span>{isHindi ? 'व्हाट्सएप पर रेट पूछें / मोलभाव करें' : 'Ask Best Price on WhatsApp'}</span>
                      </a>
                    );
                  })()}
                </div>
              )}

              {/* Toast & Status Feedback */}
              {addedToast && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: '#065f46',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={16} color="#10b981" />
                    {t('cart.item_added')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openCart();
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary, #2563eb)',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                    }}
                  >
                    {t('nav.cart')} →
                  </button>
                </div>
              )}

              {reserveSuccess && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: '#065f46',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <CheckCircle size={16} color="#10b981" />
                  <span>{t('reservations.success') || 'Reservation confirmed! Ready for counter pickup.'}</span>
                </div>
              )}

              {reserveError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    color: '#991b1b',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <AlertCircle size={16} color="#ef4444" />
                  <span>{reserveError}</span>
                </div>
              )}

              {/* Product Specifications Grid */}
              {hasSpecifications && (
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                    border: '1px solid var(--border-subtle, #e2e8f0)',
                    borderRadius: '16px',
                    padding: '14px 16px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: 'var(--text-secondary, #64748b)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Layers size={14} color="var(--color-primary, #2563eb)" />
                    <span>{t('products.product_details')}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                    {brand && (
                      <div
                        style={{
                          backgroundColor: 'var(--bg-surface, #ffffff)',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle, #e2e8f0)',
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 700 }}>
                          Brand
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)', marginTop: '2px' }}>
                          {brand}
                        </div>
                      </div>
                    )}
                    {categoryName && (
                      <div
                        style={{
                          backgroundColor: 'var(--bg-surface, #ffffff)',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle, #e2e8f0)',
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 700 }}>
                          Category
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)', marginTop: '2px' }}>
                          {categoryName}
                        </div>
                      </div>
                    )}

                    {product.weight > 0 && (
                      <div
                        style={{
                          backgroundColor: 'var(--bg-surface, #ffffff)',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle, #e2e8f0)',
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 700 }}>
                          {t('products.weight')}
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)', marginTop: '2px' }}>
                          {product.weight} kg
                        </div>
                      </div>
                    )}

                    {product.unit && (
                      <div
                        style={{
                          backgroundColor: 'var(--bg-surface, #ffffff)',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle, #e2e8f0)',
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 700 }}>
                          Unit
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)', marginTop: '2px' }}>
                          {product.unit}
                        </div>
                      </div>
                    )}

                    {safeAttributes.map(([key, val]) => {
                      const label = key.replace(/_/g, ' ').toUpperCase();
                      return (
                        <div
                          key={key}
                          style={{
                            backgroundColor: 'var(--bg-surface, #ffffff)',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle, #e2e8f0)',
                          }}
                        >
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 700 }}>
                            {label}
                          </div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)', marginTop: '2px' }}>
                            {String(val)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Product Description */}
              {product.description && (
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                    border: '1px solid var(--border-subtle, #e2e8f0)',
                    borderRadius: '16px',
                    padding: '14px 16px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: 'var(--text-secondary, #64748b)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                    }}
                  >
                    {t('products.description')}
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-primary, #0f172a)', lineHeight: 1.6, margin: 0 }}>
                    {product.description}
                  </p>
                </div>
              )}

              {/* Verified Local Seller / Shop Card */}
              {!isMerchant && (product.shop_name || product.shop?.name) && (
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface, #ffffff)',
                    border: '1.5px solid var(--border-subtle, #e2e8f0)',
                    borderRadius: '16px',
                    padding: '14px 16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Store size={13} color="var(--color-primary, #2563eb)" />
                        <span>{t('products.seller_info')}</span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary, #0f172a)', marginTop: '2px' }}>
                        {product.shop_name || product.shop?.name}
                      </div>
                      {(product.shop_address || product.shop_city) && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #64748b)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} color="var(--text-muted, #94a3b8)" />
                          <span>{[product.shop_address, product.shop_city].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      {product.shop_phone && (
                        <a
                          href={`tel:${product.shop_phone}`}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle, #e2e8f0)',
                            backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                            color: 'var(--text-primary, #0f172a)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                          }}
                          title={t('common.call_shop')}
                        >
                          <Phone size={14} style={{ marginRight: '4px' }} />
                          <span>Call</span>
                        </a>
                      )}
                      {product.shop_slug && (
                        <a
                          href={`/shop/${product.shop_slug}`}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(37,99,235,0.08)',
                            color: 'var(--color-primary, #2563eb)',
                            textDecoration: 'none',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                          }}
                        >
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
