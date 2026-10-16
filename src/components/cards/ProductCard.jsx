import React, { memo } from 'react';
import { ShoppingCart, Heart, Package } from 'lucide-react';
import { getImageUrl, extractFirstImage } from '../../utils/imageUrl';
import { formatCurrency } from '../../utils/format';
import { useLanguage } from '../../context/LanguageContext';
import { Badge, Button } from '../ui';

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
  const isPricePublic = p.is_price_public !== false && 
                        p.isPricePublic !== false && 
                        p.attributes?.is_price_public !== false && 
                        p.attributes?.is_price_public !== 'false' && 
                        price > 0 &&
                        !p.hide_price;
  const firstImage = extractFirstImage(p.images || p.image || p.image_url);
  const hasDiscount = isPricePublic && mrp > price;
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
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
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
          {firstImage ? (
            <img
              src={getImageUrl(firstImage)}
              alt={p.name}
              loading="lazy"
              decoding="async"
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
            <div style={{ position: 'absolute', top: '6px', left: '6px', zIndex: 2 }}>
              <Badge variant="danger" size="sm">
                {discountPct}% OFF
              </Badge>
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
              zIndex: 2,
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
        {isPricePublic ? (
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
        ) : (
          <Badge variant="bargain" size="sm">
            {isHindi ? '🔒 मोलभाव करें' : '🔒 Ask Price'}
          </Badge>
        )}

        {/* Add to Cart / Ask Price Button */}
        <button
          type="button"
          onClick={onClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: !isPricePublic
              ? '#25d366'
              : inStock
                ? 'var(--color-primary, #4f46e5)'
                : 'rgba(148, 163, 184, 0.15)',
            color: '#ffffff',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 800,
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          {isPricePublic ? (
            <>
              <ShoppingCart size={12} strokeWidth={2.5} />
              <span>{inStock ? (isHindi ? 'जोड़ें' : 'Add') : (isHindi ? 'खत्म' : 'Out')}</span>
            </>
          ) : (
            <span>{isHindi ? 'रेट पूछें' : 'Ask Price'}</span>
          )}
        </button>
      </div>
    </div>
  );
};

export const ProductCard = memo(ProductCardInner);
export default ProductCard;
