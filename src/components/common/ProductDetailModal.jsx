/**
 * ProductDetailModal Component
 * 
 * Production-ready modal with:
 * - High-resolution image gallery (multi-image carousel & thumbnail strip)
 * - Complete product specifications & attributes
 * - Star ratings and customer reviews section
 * - 🤝 Algorithmic Bargaining (Make Offer)
 * - 🔔 Out-of-stock notification registration
 * - 🛒 Add to Cart with live quantity control
 * - 🛍️ 1-Click Counter Pickup Reservation
 * - Full i18n support (Strict English & Formal Hindi)
 */

import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Package,
  Layers,
  CheckCircle,
  Copy,
  ChevronLeft,
  ChevronRight,
  Store,
  MapPin,
  Phone,
  Navigation,
  Sparkles,
  MessageSquare,
  Send,
  Bell,
  ShoppingCart,
  Plus,
  Minus,
} from 'lucide-react';
import { getCategoryEmoji } from '../../utils/categoryMeta';
import { getImageUrl } from '../../utils/imageUrl';
import { productApi } from '../../api/product.api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { ProductReviewsSection } from '../customer/ProductReviewsSection';

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
  const [copiedSKU, setCopiedSKU] = useState(false);

  // Reserve form state
  const [reserveQty, setReserveQty] = useState(1);
  const [reserveHours, setReserveHours] = useState(4);
  const [reserveNotes, setReserveNotes] = useState('');
  const [reserving, setReserving] = useState(false);

  // Cart quantity selector
  const [cartQty, setCartQty] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  // Bargaining State
  const [showBargainBox, setShowBargainBox] = useState(false);
  const [offerPrice, setOfferPrice] = useState(product?.price ? Math.round(product.price * 0.9) : 0);
  const [offerQty, setOfferQty] = useState(1);
  const [offerPhone, setOfferPhone] = useState(user?.phone || '');
  const [offerName] = useState(user?.name || user?.full_name || '');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerResult, setOfferResult] = useState(null);
  const [offerError, setOfferError] = useState(null);

  // Stock alert state
  const [alertPhone, setAlertPhone] = useState(user?.phone || '');
  const [alertName] = useState(user?.name || user?.full_name || '');
  const [subscribingAlert, setSubscribingAlert] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertError, setAlertError] = useState(null);

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
  const allowBargain = product.allow_bargain !== false;

  const handleCopySKU = () => {
    if (product.sku) {
      navigator.clipboard.writeText(product.sku);
      setCopiedSKU(true);
      setTimeout(() => setCopiedSKU(false), 2000);
    }
  };

  const handleAddToCart = () => {
    addItem(product, cartQty);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleReserveSubmit = async (e) => {
    e.preventDefault();
    if (onReserve) {
      setReserving(true);
      try {
        await onReserve({
          product,
          quantity: Number(reserveQty),
          hold_hours: Number(reserveHours),
          notes: reserveNotes,
        });
      } finally {
        setReserving(false);
      }
    }
  };

  const handleBargainSubmit = async (e) => {
    e.preventDefault();
    setOfferError(null);
    if (!offerPhone || offerPhone.trim().length < 10) {
      setError(t('auth.invalid_phone'));
      return;
    }
    if (Number(offerPrice) <= 0) {
      setOfferError('Invalid offer price');
      return;
    }

    setSubmittingOffer(true);
    try {
      const res = await productApi.makeOffer(product.id, {
        offered_price: Number(offerPrice),
        quantity: Number(offerQty) || 1,
        customer_phone: offerPhone.trim(),
        customer_name: offerName.trim() || undefined,
      });
      const data = res.data || res;
      setOfferResult(data);
    } catch (err) {
      setOfferError(err.response?.data?.message || err.message || t('common.error'));
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleStockAlertSubmit = async (e) => {
    e.preventDefault();
    setAlertError(null);
    if (!alertPhone || alertPhone.trim().length < 10) {
      setAlertError(t('auth.invalid_phone'));
      return;
    }

    setSubscribingAlert(true);
    try {
      await productApi.subscribeStockAlert(product.id, {
        customer_phone: alertPhone.trim(),
        customer_name: alertName.trim() || undefined,
      });
      setAlertSuccess(true);
    } catch (err) {
      setAlertError(err.response?.data?.message || err.message || t('common.error'));
    } finally {
      setSubscribingAlert(false);
    }
  };

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
          maxHeight: '90vh',
        }}
      >
        {/* Modal Handle & Close Button */}
        <div
          style={{
            padding: '12px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <div className="sheet-handle" style={{ margin: 0 }} />
          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            {t('products.product_details')}
          </div>
          <button
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
            }}
            title={t('common.close')}
            aria-label={t('common.close')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {/* Main Image Gallery */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                width: '100%',
                height: '240px',
                borderRadius: 'var(--radius-lg)',
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
                <img loading="lazy" decoding="async" 
                  src={getImageUrl(images[selectedImageIdx] || images[0])}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transition: 'all 0.2s ease',
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Package size={64} style={{ opacity: 0.4, margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{t('products.no_photo')}</div>
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    style={{
                      position: 'absolute',
                      left: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255,255,255,0.9)',
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
                    onClick={() => setSelectedImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255,255,255,0.9)',
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

            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                {images.map((img, idx) => (
                  <img loading="lazy" decoding="async" 
                    key={idx}
                    src={getImageUrl(img)}
                    alt={`Thumb ${idx + 1}`}
                    onClick={() => setSelectedImageIdx(idx)}
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: 'var(--radius-sm)',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25, margin: 0 }}>
                  {product.name}
                </h2>

                <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                  {(product.attributes?.brand || product.attributes?.company) && (
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        padding: '2px 8px',
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
                        padding: '2px 8px',
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
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                  ₹{product.price}
                </div>
                {product.compare_price && product.compare_price > product.price && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      {t('products.mrp')} ₹{product.compare_price}
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
                      {t('products.save_amount', { amount: product.compare_price - product.price })} (
                      {Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}% OFF)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Badges Bar: Stock & SKU */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  backgroundColor: inStock ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  color: inStock ? '#065f46' : '#991b1b',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: inStock ? '#10b981' : '#ef4444',
                  }}
                />
                {inStock ? `${t('products.in_stock')}: ${currentStock} units` : t('products.out_of_stock')}
              </span>

              {product.sku && (
                <button
                  type="button"
                  onClick={handleCopySKU}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: 'var(--bg-surface-subtle)',
                    color: 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  title={t('common.copy')}
                >
                  <Copy size={12} />
                  <span>SKU: {product.sku}</span>
                  {copiedSKU && <span style={{ color: '#15803d', fontWeight: 700 }}>✓ {t('common.copied')}</span>}
                </button>
              )}
            </div>
          </div>

          {/* 🛒 Add to Cart Quick Bar */}
          {!isMerchant && inStock && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                marginBottom: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {t('products.select_quantity')}:
                  </span>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: '1.5px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-full)',
                      padding: '3px 8px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setCartQty((q) => Math.max(1, q - 1))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px' }}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', minWidth: '18px', textAlign: 'center' }}>
                      {cartQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCartQty((q) => Math.min(currentStock, q + 1))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px' }}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="btn btn-primary"
                    style={{
                      padding: '9px 18px',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <ShoppingCart size={16} />
                    <span>{t('products.add_to_cart')}</span>
                  </button>
                </div>
              </div>

              {addedToast && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: '#065f46',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={15} color="#10b981" />
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
                      fontSize: '0.78rem',
                    }}
                  >
                    {t('nav.cart')} →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 🤝 Customer Feature: Bargaining (Make Offer) */}
          {!isMerchant && inStock && allowBargain && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1.5px dashed var(--color-primary)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} color="var(--color-primary)" />
                    {t('bargain.title')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {t('bargain.subtitle')}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBargainBox(!showBargainBox)}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: showBargainBox ? 'var(--bg-surface)' : 'var(--color-primary)',
                    color: showBargainBox ? 'var(--text-primary)' : '#ffffff',
                    border: showBargainBox ? '1px solid var(--border-subtle)' : 'none',
                    fontWeight: 700,
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {showBargainBox ? t('common.close') : t('bargain.submit_offer')}
                </button>
              </div>

              {showBargainBox && (
                <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  {!offerResult ? (
                    <form onSubmit={handleBargainSubmit}>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {[5, 10, 15, 20].map((pct) => {
                          const discounted = Math.round(product.price * (1 - pct / 100));
                          const isActive = offerPrice === discounted;
                          return (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => setOfferPrice(discounted)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                border: isActive ? '1.5px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                                backgroundColor: isActive ? 'var(--color-primary-light)' : 'var(--bg-surface)',
                                color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              -{pct}% (₹{discounted})
                            </button>
                          );
                        })}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '10px' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>
                            {t('bargain.propose_price')}
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={product.price}
                            required
                            className="form-input"
                            style={{ fontSize: '0.88rem', fontWeight: 800 }}
                            value={offerPrice}
                            onChange={(e) => setOfferPrice(Number(e.target.value))}
                          />
                        </div>

                        <div>
                          <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>
                            {t('bargain.quantity')}
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={currentStock}
                            required
                            className="form-input"
                            style={{ fontSize: '0.88rem', fontWeight: 700 }}
                            value={offerQty}
                            onChange={(e) => setOfferQty(Number(e.target.value))}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>
                          {t('bargain.mobile_label')}
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. 9876543210"
                          required
                          className="form-input"
                          value={offerPhone}
                          onChange={(e) => setOfferPhone(e.target.value)}
                        />
                      </div>

                      {offerError && (
                        <div style={{ color: '#b91c1c', fontSize: '0.78rem', marginBottom: '10px', fontWeight: 600 }}>
                          ⚠️ {offerError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submittingOffer}
                        className="btn btn-primary btn-block"
                        style={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <Send size={16} />
                        <span>{submittingOffer ? t('bargain.calculating') : `${t('bargain.submit_offer')} (₹${offerPrice * offerQty})`}</span>
                      </button>
                    </form>
                  ) : (
                    <div>
                      {offerResult.status === 'DEAL_ACCEPTED' && (
                        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontWeight: 900, fontSize: '0.92rem' }}>
                            <CheckCircle size={20} color="#10b981" />
                            {t('bargain.deal_accepted_title')}
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#047857', marginTop: '6px', lineHeight: 1.4 }}>
                            {offerResult.message || t('bargain.deal_accepted_msg')}
                          </p>

                          <div style={{ backgroundColor: '#ffffff', border: '1px dashed #10b981', borderRadius: 'var(--radius-sm)', padding: '10px', margin: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t('bargain.deal_code')}</div>
                              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '1px' }}>
                                {offerResult.deal_code}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t('bargain.valid_for')}</div>
                              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b91c1c' }}>30 Minutes</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            {offerResult.whatsapp_order_url && (
                              <a
                                href={offerResult.whatsapp_order_url}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm"
                                style={{ flex: 1, backgroundColor: '#25D366', color: '#ffffff', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px' }}
                              >
                                <MessageSquare size={16} /> {t('bargain.order_whatsapp')}
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => setOfferResult(null)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontWeight: 600 }}
                            >
                              {t('common.retry')}
                            </button>
                          </div>
                        </div>
                      )}

                      {offerResult.status === 'COUNTER_OFFER' && (
                        <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', fontWeight: 900, fontSize: '0.92rem' }}>
                            <Sparkles size={18} color="#d97706" />
                            {t('bargain.counter_offer_title', { price: offerResult.agreed_price })}
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#78350f', marginTop: '6px', lineHeight: 1.4 }}>
                            {offerResult.message}
                          </p>

                          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                            {offerResult.whatsapp_order_url && (
                              <a
                                href={offerResult.whatsapp_order_url}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm"
                                style={{ flex: 1, backgroundColor: '#25D366', color: '#ffffff', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px' }}
                              >
                                <MessageSquare size={16} /> {t('bargain.order_whatsapp')}
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => setOfferResult(null)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontWeight: 600 }}
                            >
                              {t('bargain.try_another')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 🔔 Customer Feature: Out-of-Stock Notification Subscription */}
          {!isMerchant && !inStock && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              <Bell size={26} color="#ef4444" style={{ margin: '0 auto 6px auto' }} />
              <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                {t('stock_alert.title')}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '12px' }}>
                {t('stock_alert.subtitle')}
              </p>

              {alertSuccess ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#15803d', fontWeight: 800, fontSize: '0.85rem' }}>
                  <CheckCircle size={18} color="#15803d" />
                  {t('stock_alert.registered_msg')}
                </div>
              ) : (
                <form onSubmit={handleStockAlertSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '360px', margin: '0 auto' }}>
                  <input
                    type="tel"
                    placeholder={t('stock_alert.phone_placeholder')}
                    required
                    value={alertPhone}
                    onChange={(e) => setAlertPhone(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.85rem' }}
                  />
                  {alertError && (
                    <div style={{ color: '#b91c1c', fontSize: '0.74rem', fontWeight: 600 }}>
                      ⚠️ {alertError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={subscribingAlert}
                    className="btn btn-primary btn-block btn-sm"
                    style={{ fontWeight: 700 }}
                  >
                    {subscribingAlert ? t('common.loading') : t('stock_alert.notify_me_btn')}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Specifications & Attributes */}
          {(() => {
            const PRIVATE_KEYS = ['cost_price', 'unit_profit', 'profit_margin_pct', 'profit', 'margin', 'supplier', 'wholesale_price'];
            const safeEntries = Object.entries(product.attributes || {}).filter(([key, val]) => {
              if (!val) return false;
              if (!isMerchant && PRIVATE_KEYS.includes(key.toLowerCase())) return false;
              return true;
            });

            if (safeEntries.length === 0 && (!product.weight || product.weight <= 0)) {
              return null;
            }

            return (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={14} color="var(--color-primary)" />
                  {t('products.product_details')}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {product.weight > 0 && (
                    <div style={{ backgroundColor: 'var(--bg-surface)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                        {t('products.weight')}
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {product.weight} kg
                      </div>
                    </div>
                  )}
                  {safeEntries.map(([key, val]) => {
                    const label = key.replace(/_/g, ' ').toUpperCase();
                    return (
                      <div key={key} style={{ backgroundColor: 'var(--bg-surface)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
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
            );
          })()}

          {/* Description */}
          {product.description && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                {t('products.description')}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                {product.description}
              </p>
            </div>
          )}

          {/* Product Reviews & Ratings Feed */}
          {!isMerchant && <ProductReviewsSection product={product} />}

          {/* Seller / Shop Info Card */}
          {!isMerchant && (product.shop_name || product.shop?.name) && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                marginBottom: '16px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Store size={14} color="var(--color-primary)" />
                {t('products.seller_info')}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {product.shop_name || product.shop?.name}
                  </div>
                  {(product.shop_address || product.shop_city) && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="var(--text-muted)" />
                      <span>{[product.shop_address, product.shop_city].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                </div>

                {product.shop_slug && (
                  <a
                    href={`/shop/${product.shop_slug}`}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.74rem', padding: '6px 10px', textDecoration: 'none', flexShrink: 0, fontWeight: 700 }}
                  >
                    {t('products.visit_storefront')} →
                  </a>
                )}
              </div>

              {(product.shop_phone || (product.shop_latitude && product.shop_longitude)) && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                  {product.shop_phone && (
                    <a
                      href={`tel:${product.shop_phone}`}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', textDecoration: 'none', fontWeight: 600 }}
                    >
                      <Phone size={13} /> {t('common.call_shop')}
                    </a>
                  )}
                  {product.shop_latitude && product.shop_longitude && (
                    <a
                      href={`https://maps.google.com/?q=${product.shop_latitude},${product.shop_longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', textDecoration: 'none', fontWeight: 600 }}
                    >
                      <Navigation size={13} /> {t('common.directions')}
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 🛍️ Customer Action: Direct 1-Click Pickup Reservation */}
          {!isMerchant && inStock && (
            <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShoppingBag size={16} color="var(--color-primary)" />
                <span>{t('products.reserve_for_pickup')}</span>
              </div>

              <form onSubmit={handleReserveSubmit}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>{t('cart.quantity')}</label>
                    <input
                      type="number"
                      min="1"
                      max={currentStock}
                      required
                      className="form-input"
                      value={reserveQty}
                      onChange={(e) => setReserveQty(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>{t('products.hold_hours')}</label>
                    <select
                      className="form-input"
                      value={reserveHours}
                      onChange={(e) => setReserveHours(e.target.value)}
                    >
                      <option value="2">{t('products.hours_count', { count: 2 })}</option>
                      <option value="4">{t('products.hours_count', { count: 4 })}</option>
                      <option value="8">{t('products.hours_count', { count: 8 })}</option>
                      <option value="24">{t('products.hours_count', { count: 24 })}</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>{t('products.special_instructions')}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t('checkout.notes_placeholder')}
                    value={reserveNotes}
                    onChange={(e) => setReserveNotes(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-lg"
                  disabled={reserving}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <ShoppingBag size={18} />
                  <span>{reserving ? t('common.processing') : `${t('products.reserve_for_pickup')} (₹${product.price * reserveQty})`}</span>
                </button>
              </form>
            </div>
          )}

          {/* Merchant Action: Quick Stock Adjust */}
          {isMerchant && onAdjustStock && (
            <div style={{ marginTop: '16px' }}>
              <button
                className="btn btn-primary btn-block"
                onClick={() => {
                  onClose();
                  onAdjustStock(product);
                }}
              >
                {t('inventory.edit_product')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
