/**
 * CartDrawer Component (Customer Shopping Cart)
 * 
 * Features:
 * - Slide-out interactive drawer with glassy modern design
 * - Multi-item list with quantity increment/decrement steppers
 * - Transparent price breakdown (Subtotal, Savings, Net Total)
 * - Clear cart with confirmation
 * - 1-Click navigation to Checkout Modal
 * - Full i18n support (English & Hindi)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Store,
  CheckCircle,
  Package,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { getImageUrl } from '../../utils/imageUrl';

export const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    items,
    cartCount,
    subtotal,
    totalSavings,
    isCartOpen,
    closeCart,
    openCheckout,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();
  const { t, isHindi } = useLanguage();

  if (!isCartOpen) return null;

  const handleClear = () => {
    if (window.confirm(t('cart.clear_confirm'))) {
      clearCart();
    }
  };

  const handleBrowseStores = () => {
    closeCart();
    navigate('/');
  };

  return (
    <div
      className="modal-backdrop"
      onClick={closeCart}
      style={{
        zIndex: 140,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        padding: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          backgroundColor: 'var(--bg-surface, #ffffff)',
          color: 'var(--text-primary)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.25)',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
              }}
            >
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2
                id="cart-drawer-title"
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {t('cart.title')}
              </h2>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {t('cart.items_count', { count: cartCount })}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {items.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: '6px',
                }}
                title={t('cart.clear_cart')}
              >
                {t('cart.clear_cart')}
              </button>
            )}

            <button
              type="button"
              onClick={closeCart}
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
              aria-label={t('common.close')}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {items.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  color: 'var(--text-muted)',
                }}
              >
                <ShoppingBag size={36} style={{ opacity: 0.5 }} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px 0' }}>
                {t('cart.empty_title')}
              </h3>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  maxWidth: '280px',
                  lineHeight: 1.45,
                  margin: '0 0 20px 0',
                }}
              >
                {t('cart.empty_desc')}
              </p>
              <button
                type="button"
                onClick={handleBrowseStores}
                className="btn btn-primary"
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                {t('cart.browse_btn')}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map((item) => {
                const hasDiscount = item.compare_price && item.compare_price > item.price;
                const savings = hasDiscount ? (item.compare_price - item.price) * item.quantity : 0;

                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-subtle)',
                      position: 'relative',
                    }}
                  >
                    {/* Item Image */}
                    <div
                      style={{
                        width: '68px',
                        height: '68px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#ffffff',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {item.image ? (
                        <img loading="lazy" decoding="async" 
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Package size={28} color="var(--text-muted)" style={{ opacity: 0.4 }} />
                      )}
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.name}
                      </div>

                      {item.shop_name && (
                        <div
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--color-primary)',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            marginTop: '2px',
                          }}
                        >
                          <Store size={11} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.shop_name}
                          </span>
                        </div>
                      )}

                      {/* Pricing */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          ₹{item.price * item.quantity}
                        </span>
                        {item.quantity > 1 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            (₹{item.price}/unit)
                          </span>
                        )}
                        {hasDiscount && (
                          <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 700 }}>
                            Save ₹{savings}
                          </span>
                        )}
                      </div>

                      {/* Quantity Stepper & Remove */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '8px',
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-full)',
                            padding: '2px 6px',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-primary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '3px',
                            }}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>

                          <span style={{ fontWeight: 800, fontSize: '0.82rem', minWidth: '18px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-primary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '3px',
                            }}
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-danger, #ef4444)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '4px',
                          }}
                          title={t('common.delete')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer & Checkout Action */}
        {items.length > 0 && (
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              boxShadow: '0 -4px 15px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <span>{t('cart.subtotal')}</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{subtotal}</span>
              </div>

              {totalSavings > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#15803d', fontWeight: 700 }}>
                  <span>{t('cart.savings')}</span>
                  <span>- ₹{totalSavings}</span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.05rem',
                  fontWeight: 900,
                  color: 'var(--color-primary)',
                  paddingTop: '8px',
                  borderTop: '1px dashed var(--border-subtle)',
                  marginTop: '2px',
                }}
              >
                <span>{t('cart.total_payable')}</span>
                <span>₹{subtotal}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={openCheckout}
              className="btn btn-primary btn-block"
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 800,
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
              }}
            >
              <span>{t('cart.proceed_checkout')}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
