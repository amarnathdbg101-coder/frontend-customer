/**
 * Customer Product Card Component (Pixel-perfect match with Shopsilo Mobile OS)
 */

import React, { memo } from 'react';
import { Package, Clock, Heart } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';
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
        borderRadius: '16px',
        border: '1px solid var(--border-subtle, #e2e8f0)',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
      }}
    >
      <div>
        {/* Product Image Box */}
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
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <Package size={40} color="var(--text-muted, #94a3b8)" style={{ opacity: 0.4 }} />
          )}

          {/* Discount Badge on Top-Left */}
          {hasDiscount && discountPct > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)',
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
              top: '8px',
              right: '8px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            }}
            aria-label="Save item"
          >
            <Heart
              size={14}
              color={isSaved ? '#ef4444' : '#64748b'}
              fill={isSaved ? '#ef4444' : 'none'}
            />
          </button>
        </div>

        {/* Product Details */}
        <div style={{ padding: '10px 10px 6px 10px' }}>
          <h4
            style={{
              margin: '0 0 4px 0',
              fontSize: '0.84rem',
              fontWeight: 700,
              color: 'var(--text-primary, #0f172a)',
              lineHeight: 1.25,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.5em',
            }}
          >
            {p.name}
          </h4>
        </div>
      </div>

      {/* Price & Reserve Row */}
      <div
        style={{
          padding: '0 10px 10px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.96rem', fontWeight: 900, color: '#2563eb' }}>
            ₹{price}
          </span>
          {hasDiscount && (
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted, #94a3b8)',
                textDecoration: 'line-through',
                fontWeight: 600,
              }}
            >
              ₹{mrp}
            </span>
          )}
        </div>

        {/* Reserve Button */}
        <button
          type="button"
          onClick={onClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: inStock ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.15)',
            color: inStock ? '#059669' : '#64748b',
            border: inStock ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid transparent',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '0.72rem',
            fontWeight: 800,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Clock size={12} strokeWidth={2.5} />
          <span>{inStock ? (isHindi ? 'रिज़र्व' : 'Reserve') : (isHindi ? 'खत्म' : 'Out')}</span>
        </button>
      </div>
    </div>
  );
};

export const ProductCard = memo(ProductCardInner);
export default ProductCard;
