/**
 * ProductDetailModal Component
 *
 * Ultra-Clean, Modern & High-Vibe Product Details Showcase Modal for Customer Web App.
 * Uses ProductStudioView with:
 * - Real-time finger touch swipe + desktop mouse drag physics
 * - Animated expandable dot pagination pills (Apple/Shopify style)
 * - Studio Hero Gallery with tap-to-zoom fullscreen lightbox
 * - Pricing Hero Card with tax-inclusive badge and savings pill
 * - Minimalist Specifications Chip Grid (matching Shop-side Flutter architecture)
 * - 1-Click Counter Pickup Hold & WhatsApp Inquiries
 */

import React, { useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ProductStudioView } from '../product/ProductStudioView';

export const ProductDetailModal = ({
  product,
  onClose,
  onReserve,
  isMerchant = false,
}) => {
  const { isHindi } = useLanguage();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const categoryName = typeof product.category === 'object'
    ? (product.category?.name || product.category_name || '')
    : String(product.category_name || product.category || '');

  return (
    <div
      className="modal-overlay modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
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
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          border: '1px solid var(--border-subtle, #e2e8f0)',
          overflow: 'hidden',
          position: 'relative',
          animation: 'modalSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Clean Modal Header */}
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
          {/* Breadcrumb Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
              {product.shop_name || (isHindi ? 'दुकान' : 'Store')}
            </span>
            {categoryName && (
              <>
                <ChevronRight size={13} />
                <span style={{ fontWeight: 700, color: 'var(--color-primary, #4f46e5)' }}>
                  {categoryName}
                </span>
              </>
            )}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'var(--bg-surface-subtle, #f8fafc)',
              border: '1px solid var(--border-subtle, #e2e8f0)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'background 0.15s ease',
            }}
            title={isHindi ? 'बंद करें' : 'Close'}
            aria-label="Close modal"
          >
            <X size={17} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '20px',
          }}
        >
          <ProductStudioView
            product={product}
            isModal={true}
            onClose={onClose}
            onReserve={onReserve}
            isMerchant={isMerchant}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
