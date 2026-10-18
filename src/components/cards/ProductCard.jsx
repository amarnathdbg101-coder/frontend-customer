import React, { memo } from 'react';
import { ShoppingCart, Heart, Package, Check } from 'lucide-react';
import { getImageUrl, extractFirstImage } from '../../utils/imageUrl';
import { formatCurrency } from '../../utils/format';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';

const ProductCardInner = ({
  product,
  isSaved = false,
  onToggleSave,
  onClick,
}) => {
  const { isHindi } = useLanguage();
  const { getItemQuantity } = useCart();
  const p = product;
  const qtyInCart = p?.id ? getItemQuantity(p.id) : 0;

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
        borderRadius: '12px',
        border: qtyInCart > 0 ? '1.5px solid #0f172a' : '1px solid var(--border-subtle, #e2e8f0)',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.15s ease-in-out',
        position: 'relative',
        height: '100%',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.04)';
      }}
    >
      <div>
        {/* Clean Square Product Image Box (1:1 Ratio) */}
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
                padding: '8px',
                transition: 'transform 0.2s ease',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <Package size={32} color="#94a3b8" style={{ opacity: 0.35 }} />
          )}

          {/* Minimal Discount Badge */}
          {hasDiscount && discountPct > 0 && (
            <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 2 }}>
              <span
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  letterSpacing: '0.3px',
                }}
              >
                {discountPct}% OFF
              </span>
            </div>
          )}

          {/* Quantity Badge if in Cart */}
          {qtyInCart > 0 && (
            <div style={{ position: 'absolute', bottom: '8px', left: '8px', zIndex: 2 }}>
              <span
                style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <Check size={10} strokeWidth={3} />
                <span>{qtyInCart}</span>
              </span>
            </div>
          )}

          {/* Wishlist Heart */}
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
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
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

        {/* Clean Product Name */}
        <div style={{ padding: '8px 10px 4px 10px' }}>
          <h4
            style={{
              margin: 0,
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
            title={p.name}
          >
            {p.name}
          </h4>
        </div>
      </div>

      {/* Price & Action Row */}
      <div
        style={{
          padding: '4px 10px 10px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
        }}
      >
        {isPricePublic ? (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', minWidth: 0 }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
              {formatCurrency(price)}
            </span>
            {hasDiscount && (
              <span
                style={{
                  fontSize: '0.7rem',
                  color: '#94a3b8',
                  textDecoration: 'line-through',
                  fontWeight: 500,
                }}
              >
                {formatCurrency(mrp)}
              </span>
            )}
          </div>
        ) : (
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d97706' }}>
            {isHindi ? 'रेट पूछें' : 'Ask Price'}
          </span>
        )}

        {/* Clean Add to Cart Button */}
        <button
          type="button"
          onClick={onClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: !isPricePublic
              ? '#16a34a'
              : qtyInCart > 0
                ? '#0f172a'
                : inStock
                  ? '#0f172a'
                  : '#f1f5f9',
            color: !isPricePublic || qtyInCart > 0 || inStock ? '#ffffff' : '#94a3b8',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: inStock ? 'pointer' : 'default',
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
        >
          {isPricePublic ? (
            <>
              {qtyInCart > 0 ? <Check size={12} strokeWidth={3} /> : <ShoppingCart size={12} strokeWidth={2} />}
              <span>
                {qtyInCart > 0
                  ? `${qtyInCart}`
                  : inStock
                    ? (isHindi ? 'जोड़ें' : 'Add')
                    : (isHindi ? 'खत्म' : 'Out')}
              </span>
            </>
          ) : (
            <span>{isHindi ? 'पूछें' : 'Ask'}</span>
          )}
        </button>
      </div>
    </div>
  );
};

export const ProductCard = memo(ProductCardInner);
export default ProductCard;
