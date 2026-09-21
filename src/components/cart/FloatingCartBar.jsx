/**
 * Floating Quick Cart Bar
 * Appears seamlessly when items are added to cart, providing instant 1-tap checkout access.
 */

import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

export const FloatingCartBar = () => {
  const { cartCount, subtotal, totalSavings, openCart, isCartOpen, isCheckoutOpen } = useCart();
  const { isHindi } = useLanguage();

  if (cartCount <= 0 || isCartOpen || isCheckoutOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 'calc(var(--bottom-nav-height, 64px) + var(--safe-area-bottom, 0px) + 10px)',
        width: 'calc(100% - 24px)',
        maxWidth: '480px',
        zIndex: 90,
        pointerEvents: 'auto',
        animation: 'slideUpBounce 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <button
        type="button"
        onClick={openCart}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '16px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 8px 24px rgba(79, 70, 229, 0.45)',
          cursor: 'pointer',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.01)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
      >
        {/* Left Info: Icon + Count + Amount */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem',
            }}
          >
            <ShoppingBag size={18} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{cartCount} {isHindi ? 'सामान' : 'Items'}</span>
              <span>•</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {totalSavings > 0 && (
              <div style={{ fontSize: '0.72rem', color: '#a7f3d0', fontWeight: 700 }}>
                {isHindi ? `कुल बचत: ₹${totalSavings.toFixed(0)}` : `Total Savings: ₹${totalSavings.toFixed(0)}`}
              </div>
            )}
          </div>
        </div>

        {/* Right CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.88rem' }}>
          <span>{isHindi ? 'कार्ट देखें' : 'View Cart'}</span>
          <ArrowRight size={17} />
        </div>
      </button>
    </div>
  );
};
