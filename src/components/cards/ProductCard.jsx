/**
 * Customer Product Card Component (Pixel-perfect square layout, 1-line name truncation)
 */

import React, { memo } from 'react';
import { Package, ShoppingCart, Heart } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';
import { formatCurrency } from '../../utils/format';
import { useLanguage } from '../../context/LanguageContext';

const ProductCardInner = ({
  product,
  isSaved = false,
  onToggleSave,
  onClick,
}) => {
  const { isHindi } = useLanguage();
  const p = product;
  const stock = Number(
    p.available_quantity ??
    p.stock_quantity ??
    p.inventory?.available_quantity ??
    p.inventory?.quantity ??
    p.stock ??
    0
  );
  const inStock = stock > 0;
  const mrp = Number(p.compare_price || p.mrp || 0);
  const price = Number(p.price || 0);
  const hasDiscount = mrp > price;
  const discountPct = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'var(--bg-surface, #ffffff)',
        borderRadius: '14px',
        border: '1px solid var(--border-subtle, #e2e8f0)',
        overflow: 'hidden',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.15s ease, boxShadow 0.15s ease',
        position: 'relative',
        height: '100%',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 14px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.04)';
      }}
    >
      <div>
        {/* Square Product Image Box (1:1 Ratio) */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1 / 1',
            backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {p.images && p.images[0] ? (
            <img
              src={getImageUrl(p.images[0])}
              alt={p.name}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: '6px',
                transition: 'transform 0.2s ease',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <Package size={36} color="var(--text-muted, #94a3b8)" style={{ opacity: 0.4 }} />
          )}

          {/* Discount Badge on Top-Left */}
          {hasDiscount && discountPct > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '0.64rem',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '6px',
                boxShadow: '0 2px 5px rgba(239, 68, 68, 0.3)',
                letterSpacing: '0.2px',
              }}
            >
              {discountPct}% OFF
            </div>
          )}

          {/* Wishlist / Save Button on Top-Right */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave?.(p);
            }}
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            }}
            aria-label="Save item"
          >
            <Heart
              size={13}
              color={isSaved ? '#ef4444' : '#64748b'}
              fill={isSaved ? '#ef4444' : 'none'}
            />
          </button>
        </div>

        {/* Product Name Truncated to EXACTLY 1 LINE */}
        <div style={{ padding: '8px 10px 4px 10px' }}>
          <h4
            style={{
              margin: 0,
              fontSize: '0.82rem',
              fontWeight: 800,
              color: 'var(--text-primary, #0f172a)',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={p.name}
          >
            {p.name}
          </h4>
        </div>
      </div>

      {/* Price & Add to Cart Row */}
      <div
        style={{
          padding: '0 10px 10px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', minWidth: 0 }}>
          <span style={{ fontSize: '0.92rem', fontWeight: 900, color: 'var(--color-primary, #2563eb)' }}>
            {formatCurrency(price)}
          </span>
          {hasDiscount && (
            <span
              style={{
                fontSize: '0.68rem',
                color: 'var(--text-muted, #94a3b8)',
                textDecoration: 'line-through',
                fontWeight: 600,
              }}
            >
              {formatCurrency(mrp)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={onClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: inStock ? 'var(--color-primary, #4f46e5)' : 'rgba(148, 163, 184, 0.15)',
            color: inStock ? '#ffffff' : '#64748b',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 800,
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: inStock ? '0 2px 6px rgba(79, 70, 229, 0.25)' : 'none',
          }}
        >
          <ShoppingCart size={12} strokeWidth={2.5} />
          <span>{inStock ? (isHindi ? 'कार्ट' : 'Add') : (isHindi ? 'आउट' : 'Out')}</span>
        </button>
      </div>
    </div>
  );
};

export const ProductCard = memo(ProductCardInner);
export default ProductCard;
