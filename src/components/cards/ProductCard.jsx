import React, { memo } from 'react';
import { ShoppingCart, Heart, Package, Check, Share2, Plus, Minus } from 'lucide-react';
import { getImageUrl, extractFirstImage } from '../../utils/imageUrl';
import { formatCurrency } from '../../utils/format';
import { shareProduct } from '../../utils/productShare';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { highlightMatch } from '../../utils/searchHelpers';

const ProductCardInner = ({
  product,
  isSaved = false,
  onToggleSave,
  onClick,
  highlightQuery = '',
}) => {
  const { isHindi } = useLanguage();
  const { getItemQuantity, addItem, updateQuantity } = useCart();
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
  const isLowStock = inStock && stock <= 5;
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

          {/* Low Stock Urgent Badge */}
          {isLowStock && (
            <div style={{ position: 'absolute', bottom: '8px', left: '8px', zIndex: 2 }}>
              <span
                style={{
                  backgroundColor: '#d97706',
                  color: '#ffffff',
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                ⚡ {isHindi ? `केवल ${stock} बाकी` : `Only ${stock} left`}
              </span>
            </div>
          )}

          {/* 1-Tap WhatsApp Share Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              shareProduct({
                product: p,
                shopName: p.shop_name,
                shopSlug: p.shop_slug,
                isHindi,
              });
            }}
            style={{
              position: 'absolute',
              top: '8px',
              right: '38px',
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
            aria-label="Share product"
            title={isHindi ? 'शेयर करें' : 'Share'}
          >
            <Share2
              size={12}
              color="#16a34a"
            />
          </button>

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
            {highlightQuery ? highlightMatch(p.name, highlightQuery) : p.name}
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
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', minWidth: 0, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
                {formatCurrency(price)}
              </span>
              {hasDiscount && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: '#94a3b8',
                    textDecoration: 'line-through',
                    fontWeight: 500,
                  }}
                >
                  {formatCurrency(mrp)}
                </span>
              )}
            </div>
            {hasDiscount && mrp > price && (
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  color: '#16a34a',
                  marginTop: '1px',
                }}
              >
                {isHindi ? `₹${Math.round(mrp - price)} बचत` : `Save ₹${Math.round(mrp - price)}`}
              </span>
            )}
          </div>
        ) : (
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d97706' }}>
            {isHindi ? 'रेट पूछें' : 'Ask Price'}
          </span>
        )}

        {/* Tactile Interactive Stepper or Add Button */}
        {qtyInCart > 0 ? (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '3px 7px',
              gap: '7px',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.35)',
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateQuantity(p.id, qtyInCart - 1);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
              }}
              aria-label="Decrease quantity"
            >
              <Minus size={12} strokeWidth={3} />
            </button>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, minWidth: '14px', textAlign: 'center' }}>
              {qtyInCart}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                addItem(p, 1);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
              }}
              aria-label="Increase quantity"
            >
              <Plus size={12} strokeWidth={3} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              if (inStock && isPricePublic && p.id) {
                e.stopPropagation();
                addItem(p, 1);
              } else {
                onClick?.();
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: !isPricePublic
                ? '#16a34a'
                : inStock
                  ? '#0f172a'
                  : '#f1f5f9',
              color: !isPricePublic || inStock ? '#ffffff' : '#94a3b8',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: inStock ? 'pointer' : 'default',
              flexShrink: 0,
              boxShadow: inStock ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {isPricePublic ? (
              <>
                <ShoppingCart size={12} strokeWidth={2.5} />
                <span>
                  {inStock
                    ? (isHindi ? 'जोड़ें' : 'ADD')
                    : (isHindi ? 'खत्म' : 'Out')}
                </span>
              </>
            ) : (
              <span>{isHindi ? 'पूछें' : 'Ask'}</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export const ProductCard = memo(ProductCardInner);
export default ProductCard;
