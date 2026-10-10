/**
 * ProductDetailModal Component
 * 
 * Clean, modern, and focused Product Detail modal.
 * Prioritizes high visual clarity, seamless cart actions, and zero clutter:
 * - High-resolution image gallery (multi-image carousel & thumbnail strip)
 * - Clear pricing with Indian Rupee (₹) symbol & discount savings
 * - Brand, category, and real-time stock availability
 * - Clean specifications & description (unnecessary/internal fields removed)
 * - Seamless Add-to-Cart with live quantity stepper
 * - 1-Click Quick Reserve for Pickup (when enabled)
 * - Compact shop / seller locality card
 */

import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
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
  const { t } = useLanguage();

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  // Cart quantity selector
  const [cartQty, setCartQty] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  // Reserve state
  const [reserving, setReserving] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [reserveError, setReserveError] = useState(null);

  if (!product) return null;

  const images = product.images && product.images.length > 0 ? product.images : [];
  const currentStock = Number(
    product.available_quantity ??
    product.stock_quantity ??
    product.inventory?.available_quantity ??
    product.inventory?.quantity ??
    product.stock ??
    0
  );
  const inStock = currentStock > 0;

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
      setReserveError(err?.message || 'Failed to reserve item');
    } finally {
      setReserving(false);
    }
  };

  // Filter safe customer specifications
  const PRIVATE_KEYS = [
    'cost_price', 'unit_profit', 'profit_margin_pct', 'profit',
    'margin', 'supplier', 'wholesale_price', 'barcode', 'sku', 'id'
  ];
  const safeAttributes = Object.entries(product.attributes || {}).filter(([key, val]) => {
    if (!val) return false;
    if (PRIVATE_KEYS.includes(key.toLowerCase())) return false;
    return true;
  });

  const hasSpecifications = (product.weight && product.weight > 0) || safeAttributes.length > 0;
  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const savings = hasDiscount ? product.compare_price - product.price : 0;
  const discountPct = hasDiscount ? Math.round((savings / product.compare_price) * 100) : 0;

  return (
    <div className="modal-overlay modal-backdrop" onClick={onClose} style={{ zIndex: 120 }}>
      <div
        className="modal-dialog-responsive bottom-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          maxHeight: '92vh',
          maxWidth: '520px',
          margin: 'auto',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl, 20px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            flexShrink: 0,
          }}
        >
          <div className="sheet-handle" style={{ margin: 0 }} />
          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            {typeof product.category === 'object'
              ? (product.category?.name || t('products.product_details'))
              : (product.category || t('products.product_details'))}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'var(--bg-surface-subtle)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'background 0.2s',
            }}
            title={t('common.close')}
            aria-label={t('common.close')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Product Details */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {/* Main Image Gallery */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                width: '100%',
                height: '240px',
                borderRadius: 'var(--radius-lg, 14px)',
                backgroundColor: 'var(--bg-surface-subtle)',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {images.length > 0 ? (
                <img
                  loading="lazy"
                  decoding="async"
                  src={getImageUrl(images[selectedImageIdx] || images[0])}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    padding: '8px',
                    transition: 'all 0.2s ease',
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Package size={56} style={{ opacity: 0.35, margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{t('products.no_photo')}</div>
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    style={{
                      position: 'absolute',
                      left: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255,255,255,0.92)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} color="#0f172a" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255,255,255,0.92)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    }}
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} color="#0f172a" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                {images.map((img, idx) => (
                  <img
                    loading="lazy"
                    decoding="async"
                    key={idx}
                    src={getImageUrl(img)}
                    alt={`Thumb ${idx + 1}`}
                    onClick={() => setSelectedImageIdx(idx)}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: selectedImageIdx === idx ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                      opacity: selectedImageIdx === idx ? 1 : 0.65,
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Header & Pricing */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.28rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, margin: 0 }}>
                  {product.name}
                </h2>

                <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                  {(product.attributes?.brand || product.attributes?.company) && (
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--color-primary-light, rgba(37,99,235,0.1))',
                        color: 'var(--color-primary)',
                        padding: '3px 9px',
                        borderRadius: '6px',
                      }}
                    >
                      {product.attributes?.brand || product.attributes?.company}
                    </span>
                  )}

                  {Boolean(product.category) && (
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--bg-surface-subtle)',
                        color: 'var(--text-secondary)',
                        padding: '3px 9px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>
                        {getCategoryEmoji(
                          typeof product.category === 'object'
                            ? (product.category?.slug || product.category?.name || '')
                            : String(product.category || '')
                        )}
                      </span>
                      <span>
                        {typeof product.category === 'object'
                          ? (product.category?.name || product.category?.slug || 'Category')
                          : String(product.category || 'Category')}
                      </span>
                    </span>
                  )}

                  {/* Clean In-Stock Badge */}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-full, 9999px)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: inStock ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      color: inStock ? '#065f46' : '#991b1b',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: inStock ? '#10b981' : '#ef4444',
                      }}
                    />
                    {inStock ? t('products.in_stock') : t('products.out_of_stock')}
                  </span>
                </div>
              </div>

              {/* Price Block */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                  {formatCurrency(product.price)}
                </div>
                {hasDiscount && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      {t('products.mrp')} {formatCurrency(product.compare_price)}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#15803d',
                        backgroundColor: '#dcfce7',
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {discountPct}% OFF
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md, 10px)',
                padding: '12px 14px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                }}
              >
                {t('products.description')}
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.55, margin: 0 }}>
                {product.description}
              </p>
            </div>
          )}

          {/* Key Specifications (if clean attributes exist) */}
          {hasSpecifications && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md, 10px)',
                padding: '12px 14px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Layers size={13} color="var(--color-primary)" />
                {t('products.product_details')}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {product.weight > 0 && (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm, 6px)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      {t('products.weight')}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {product.weight} kg
                    </div>
                  </div>
                )}
                {safeAttributes.map(([key, val]) => {
                  const label = key.replace(/_/g, ' ').toUpperCase();
                  return (
                    <div
                      key={key}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm, 6px)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                        {label}
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {String(val)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Seller / Shop Info (Clean & Compact) */}
          {!isMerchant && (product.shop_name || product.shop?.name) && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md, 10px)',
                padding: '12px 14px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Store size={12} color="var(--color-primary)" />
                    {t('products.seller_info')}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {product.shop_name || product.shop?.name}
                  </div>
                  {(product.shop_address || product.shop_city) && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={11} color="var(--text-muted)" />
                      <span>{[product.shop_address, product.shop_city].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {product.shop_phone && (
                    <a
                      href={`tel:${product.shop_phone}`}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 8px', borderRadius: 'var(--radius-sm, 6px)' }}
                      title={t('common.call_shop')}
                    >
                      <Phone size={13} />
                    </a>
                  )}
                  {product.shop_slug && (
                    <a
                      href={`/shop/${product.shop_slug}`}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.74rem', padding: '6px 10px', textDecoration: 'none', fontWeight: 700 }}
                    >
                      {t('products.visit_storefront')} →
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Toast / Feedback States */}
          {addedToast && (
            <div
              style={{
                marginBottom: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#065f46',
                fontSize: '0.82rem',
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
                  color: 'var(--color-primary)',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                {t('nav.cart')} →
              </button>
            </div>
          )}

          {reserveSuccess && (
            <div
              style={{
                marginBottom: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#065f46',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CheckCircle size={16} color="#10b981" />
              <span>{t('reservations.success') || 'Reservation confirmed! Ready for pickup.'}</span>
            </div>
          )}

          {reserveError && (
            <div
              style={{
                marginBottom: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#991b1b',
                fontSize: '0.82rem',
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
        </div>

        {/* Sticky Action Footer */}
        <div
          style={{
            padding: '14px 18px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            flexShrink: 0,
          }}
        >
          {isMerchant ? (
            onAdjustStock && (
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => {
                  onClose();
                  onAdjustStock(product);
                }}
              >
                {t('inventory.edit_product')}
              </button>
            )
          ) : inStock ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Quantity Stepper */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    border: '1.5px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-full, 9999px)',
                    padding: '6px 12px',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setCartQty((q) => Math.max(1, q - 1))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px', color: 'var(--text-primary)' }}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} />
                  </button>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', minWidth: '20px', textAlign: 'center', color: 'var(--text-primary)' }}>
                    {cartQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCartQty((q) => Math.min(currentStock || 99, q + 1))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px', color: 'var(--text-primary)' }}
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                {/* Primary Add to Cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    padding: '12px 18px',
                    borderRadius: 'var(--radius-lg, 12px)',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <ShoppingCart size={18} />
                  <span>{t('products.add_to_cart')} • {formatCurrency(product.price * cartQty)}</span>
                </button>
              </div>

              {/* Clean Quick Reserve Option (Only if onReserve provided) */}
              {onReserve && (
                <button
                  type="button"
                  onClick={handleQuickReserve}
                  disabled={reserving}
                  className="btn btn-secondary btn-block"
                  style={{
                    padding: '9px 14px',
                    borderRadius: 'var(--radius-md, 10px)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <ShoppingBag size={15} />
                  <span>
                    {reserving ? t('common.processing') : t('products.reserve_for_pickup')}
                  </span>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              disabled
              className="btn btn-block"
              style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                color: 'var(--text-muted)',
                padding: '12px',
                borderRadius: 'var(--radius-md, 10px)',
                fontWeight: 700,
                border: '1px solid var(--border-subtle)',
                cursor: 'not-allowed',
              }}
            >
              {t('products.out_of_stock')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
