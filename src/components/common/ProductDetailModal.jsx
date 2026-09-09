/**
 * ProductDetailModal Component
 * 
 * Hinglish Hint:
 * Kisi bhi product par tap karne par ek modern responsive bottom-sheet / modal khulti hai:
 * - High-resolution image gallery (multiple images preview)
 * - Complete product specifications & flexible attributes (Brand, Size, Color, etc.)
 * - SKU, Price, Stock indicator
 * - 🤝 Bhav-Taav Karein (Real-time algorithmic bargaining with instant acceptance or sweet-spot counter-offer)
 * - 🔔 Notify Me (Out-of-stock notification registration for automatic WhatsApp alerts)
 * - Customer ke liye instant "Hold / Reserve" for in-store counter pickup
 * - Merchant ke liye "Adjust Stock" action
 */

import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Package,
  Layers,
  Tag,
  CheckCircle,
  AlertCircle,
  Copy,
  Clock,
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
  ArrowRight,
} from 'lucide-react';
import { getCategoryEmoji } from '../../utils/categoryMeta';
import { getImageUrl } from '../../utils/imageUrl';
import { productApi } from '../../api/product.api';
import { useAuth } from '../../context/AuthContext';

export const ProductDetailModal = ({
  product,
  onClose,
  onReserve,        // Customer action
  onAdjustStock,    // Merchant action
  isMerchant = false,
}) => {
  if (!product) return null;

  const { user } = useAuth();
  const images = product.images && product.images.length > 0 ? product.images : [];
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [copiedSKU, setCopiedSKU] = useState(false);

  // Reserve form state for customers
  const [reserveQty, setReserveQty] = useState(1);
  const [reserveHours, setReserveHours] = useState(4);
  const [reserveNotes, setReserveNotes] = useState('');
  const [reserving, setReserving] = useState(false);

  // 🤝 Bhav-Taav (Bargaining) State
  const [showBargainBox, setShowBargainBox] = useState(false);
  const [offerPrice, setOfferPrice] = useState(Math.round(product.price * 0.9));
  const [offerQty, setOfferQty] = useState(1);
  const [offerPhone, setOfferPhone] = useState(user?.phone || '');
  const [offerName, setOfferName] = useState(user?.name || user?.full_name || '');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerResult, setOfferResult] = useState(null);
  const [offerError, setOfferError] = useState(null);

  // 🔔 Notify Me (Out of Stock Alert) State
  const [alertPhone, setAlertPhone] = useState(user?.phone || '');
  const [alertName, setAlertName] = useState(user?.name || user?.full_name || '');
  const [subscribingAlert, setSubscribingAlert] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertError, setAlertError] = useState(null);

  const currentStock = Number(
    product.stock_quantity ??
    product.inventory?.available_quantity ??
    product.inventory?.quantity ??
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

  // Submit Bhav-Taav proposal
  const handleBargainSubmit = async (e) => {
    e.preventDefault();
    setOfferError(null);
    if (!offerPhone || offerPhone.trim().length < 10) {
      setOfferError('Kripya valid 10-digit mobile number dalein taaki dukan par token dikha sakein.');
      return;
    }
    if (Number(offerPrice) <= 0) {
      setOfferError('Offer price 0 se jyada hona chahiye.');
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
      setOfferError(err.response?.data?.message || err.message || 'Bhav submit karne me dikkat aayi.');
    } finally {
      setSubmittingOffer(false);
    }
  };

  // Submit Out-of-Stock Notify Me
  const handleStockAlertSubmit = async (e) => {
    e.preventDefault();
    setAlertError(null);
    if (!alertPhone || alertPhone.trim().length < 10) {
      setAlertError('Kripya valid 10-digit mobile number dalein.');
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
      setAlertError(err.response?.data?.message || err.message || 'Alert register nahi ho paya.');
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
            Product Details
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
            title="Band Karein"
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
                <img
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
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Koi Photo Available Nahi Hai</div>
                </div>
              )}

              {/* Multiple Images Navigation Arrows */}
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
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                  {product.name}
                </h2>
                
                {/* Brand & Category line */}
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
                      Brand: {product.attributes?.brand || product.attributes?.company}
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
                      MRP ₹{product.compare_price}
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
                      Save ₹{product.compare_price - product.price} ({Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}% OFF)
                    </span>
                  </div>
                )}
                {isMerchant && product.cost_price > 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Kharid: ₹{product.cost_price}
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
                {inStock ? `Stock: ${currentStock} units available` : 'Currently Out of Stock'}
              </span>

              {product.sku && (
                <button
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
                  title="SKU Copy Karein"
                >
                  <Copy size={12} />
                  <span>SKU: {product.sku}</span>
                  {copiedSKU && <span style={{ color: '#15803d', fontWeight: 700 }}>✓ Copied</span>}
                </button>
              )}
            </div>
          </div>

          {/* 🤝 Customer Feature: Bhav-Taav Negotiation (Make Offer) */}
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
                    🤝 Bhav-Taav Karein (Make Offer)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Apna rate propose karein — hamara smart engine turant best discount calculate karega!
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
                  {showBargainBox ? 'Hide' : 'Rate Lagayein'}
                </button>
              </div>

              {showBargainBox && (
                <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  {!offerResult ? (
                    <form onSubmit={handleBargainSubmit}>
                      {/* Quick percentage discount pills */}
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
                            Aapka Proposed Rate (₹)
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
                            Quantity (Kitne Pieces)
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
                          Aapka Mobile Number (10-Digit WhatsApp)
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
                        <span>{submittingOffer ? 'Calculating Deal...' : `Bhav Submit Karein (₹${offerPrice * offerQty})`}</span>
                      </button>
                    </form>
                  ) : (
                    /* Offer Result Display */
                    <div>
                      {offerResult.status === 'DEAL_ACCEPTED' && (
                        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontWeight: 900, fontSize: '0.92rem' }}>
                            <CheckCircle size={20} color="#10b981" />
                            🎉 Deal Accepted! Rate Manzoor Hai!
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#047857', marginTop: '6px', lineHeight: 1.4 }}>
                            {offerResult.message || `Aapko yeh item ₹${offerResult.agreed_price} me diya jaa raha hai!`}
                          </p>

                          <div style={{ backgroundColor: '#ffffff', border: '1px dashed #10b981', borderRadius: 'var(--radius-sm)', padding: '10px', margin: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>EXCLUSIVE DEAL CODE</div>
                              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '1px' }}>
                                {offerResult.deal_code}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>VALID FOR</div>
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
                                <MessageSquare size={16} /> WhatsApp Order Karein
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => setOfferResult(null)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontWeight: 600 }}
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      )}

                      {offerResult.status === 'COUNTER_OFFER' && (
                        <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', fontWeight: 900, fontSize: '0.92rem' }}>
                            <Sparkles size={18} color="#d97706" />
                            🤝 Dukan Ka Counter Offer: ₹{offerResult.agreed_price}
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#78350f', marginTop: '6px', lineHeight: 1.4 }}>
                            {offerResult.message}
                          </p>

                          {/* Bundle Volume Upsell (Science of bargaining) */}
                          {offerResult.bundle_upsell && (
                            <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #6366f1', borderRadius: 'var(--radius-sm)', padding: '10px', margin: '10px 0' }}>
                              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                🔥 VOLUME BUNDLE BACHAT OFFER
                              </div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '3px' }}>
                                {offerResult.bundle_upsell.description}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700, marginTop: '2px' }}>
                                Total Savings: ₹{offerResult.bundle_upsell.total_savings} (Sirf ₹{offerResult.bundle_upsell.unit_price}/piece)
                              </div>
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                            {offerResult.whatsapp_order_url && (
                              <a
                                href={offerResult.whatsapp_order_url}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm"
                                style={{ flex: 1, backgroundColor: '#25D366', color: '#ffffff', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px' }}
                              >
                                <MessageSquare size={16} /> Deal Lock Karein (WhatsApp)
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => setOfferResult(null)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontWeight: 600 }}
                            >
                              Doosra Bhav Try Karein
                            </button>
                          </div>
                        </div>
                      )}

                      {offerResult.status === 'BARGAIN_DISABLED' && (
                        <div style={{ backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center' }}>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                            {offerResult.message || 'Is product par fixed price hai, bhav-taav uplabdh nahi hai.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => setOfferResult(null)}
                            className="btn btn-secondary btn-sm"
                            style={{ marginTop: '8px' }}
                          >
                            Theek Hai
                          </button>
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
                backgroundColor: 'var(--color-danger-light)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              <Bell size={26} color="#ef4444" style={{ margin: '0 auto 6px auto' }} />
              <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                Filhal Out of Stock Hai
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '12px' }}>
                Jaise hi dukan me naya stock aayega, hum aapko WhatsApp ya SMS par turant notify kar denge!
              </p>

              {alertSuccess ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#15803d', fontWeight: 800, fontSize: '0.85rem' }}>
                  <CheckCircle size={18} color="#15803d" />
                  Alert lag gaya hai! Restock hote hi aapko message aayega.
                </div>
              ) : (
                <form onSubmit={handleStockAlertSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '360px', margin: '0 auto' }}>
                  <input
                    type="tel"
                    placeholder="WhatsApp Mobile Number (10-Digit)"
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
                    {subscribingAlert ? 'Saving...' : '🔔 Notify Me (Jab Stock Aaye)'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Flexible Specifications & Attributes Card */}
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
                  SPECIFICATIONS & ATTRIBUTES
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {product.weight > 0 && (
                    <div style={{ backgroundColor: 'var(--bg-surface)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                        WEIGHT / NET QTY
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

          {/* Description Section */}
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
                Description / Vivaran
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                {product.description}
              </p>
            </div>
          )}

          {/* Seller / Shop Info Card (Customer View) */}
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
                DUKAN KI JANKARI (SELLER)
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
                    Storefront →
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
                      <Phone size={13} /> Call Shop
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
                      <Navigation size={13} /> Directions
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Customer Action: Reserve / Hold Item */}
          {!isMerchant && inStock && (
            <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-primary)' }}>
                🛍️ DUKAN SE PICKUP KE LIYE HOLD / RESERVE KAREIN
              </div>

              <form onSubmit={handleReserveSubmit}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Kitne Pieces (Qty)</label>
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
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Hold Time (Hours)</label>
                    <select
                      className="form-input"
                      value={reserveHours}
                      onChange={(e) => setReserveHours(e.target.value)}
                    >
                      <option value="2">2 Ghante</option>
                      <option value="4">4 Ghante</option>
                      <option value="8">8 Ghante</option>
                      <option value="24">24 Ghante</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Koi Special Note (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Mai 2 baje counter par aaunga"
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
                  <span>{reserving ? 'Hold Ho Raha Hai...' : `Item Hold Karein (₹${product.price * reserveQty})`}</span>
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
                Stock In / Stock Out Adjust Karein
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
