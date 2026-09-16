/**
 * Reusable Product Card Component
 * Supports MRP strike-through, discount percentage, and Public/Private Price Visibility toggle
 */

import React, { memo } from 'react';
import { Package, Heart, Store, Sparkles, Eye, MessageCircle, Phone } from 'lucide-react';
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
  const isPricePublic = p.is_price_public !== false && p.show_price !== false;
  const mrp = Number(p.compare_price || p.mrp || 0);
  const price = Number(p.price || 0);
  const hasDiscount = mrp > price;
  const discountPct = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const brand = p.attributes?.brand || p.attributes?.company;
  const allowBargain = p.allow_bargain !== false;

  return (
    <div
      className="card card-clickable product-card"
      onClick={onClick}
      role="article"
      aria-label={`Product: ${p.name}, Price: ${isPricePublic ? '₹' + price : 'Price on Request'}`}
    >
      {/* Image Box */}
      <div className="product-card-image-box">
        {p.images && p.images[0] ? (
          <img
            src={getImageUrl(p.images[0])}
            alt={p.name}
            className="product-card-image"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <Package size={44} color="var(--text-muted)" style={{ opacity: 0.35 }} aria-hidden="true" />
        )}

        {/* Stock Badge */}
        <span
          className={`product-card-stock-badge ${inStock ? 'in-stock' : 'out-of-stock'}`}
        >
          {inStock ? (isHindi ? `${stock} उपलब्ध` : `${stock} in stock`) : (isHindi ? 'स्टॉक समाप्त' : 'Out of stock')}
        </span>

        {/* Save/Wishlist */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave?.(p);
          }}
          className="product-card-save-btn"
          aria-label={isSaved ? `Remove ${p.name} from saved` : `Save ${p.name}`}
        >
          <Heart size={16} color={isSaved ? '#ef4444' : '#64748b'} fill={isSaved ? '#ef4444' : 'none'} />
        </button>
      </div>

      {/* Product Details */}
      <div className="product-card-body">
        {brand && (
          <div className="product-card-brand">{brand}</div>
        )}
        <h4 className="product-card-name">{p.name}</h4>

        {/* Shop Name */}
        <div className="product-card-shop">
          <Store size={12} color="var(--text-muted)" aria-hidden="true" />
          <span>{p.shop_name || (isHindi ? 'प्रमाणित दुकान' : 'Verified Store')}</span>
        </div>

        {/* Price & MRP Row */}
        <div className="product-card-price-row">
          {isPricePublic ? (
            <>
              <span className="product-card-price">₹{price}</span>
              {hasDiscount && (
                <span className="product-card-mrp">₹{mrp}</span>
              )}
              {hasDiscount && (
                <span className="product-card-discount">{discountPct}% OFF</span>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {isHindi ? 'मूल्य पूछताछ पर' : 'Price on Request'}
              </span>
              <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '2px 5px', borderRadius: '4px', fontWeight: 700 }}>
                {isHindi ? 'भाव-ताव' : 'Bargain'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="product-card-actions" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClick}
          className="btn btn-primary btn-sm product-card-cta"
        >
          {!isPricePublic ? (
            <>
              <MessageCircle size={13} aria-hidden="true" />
              <span>{isHindi ? 'दुकान से पूछें' : 'Ask Price'}</span>
            </>
          ) : allowBargain && inStock ? (
            <>
              <Sparkles size={13} aria-hidden="true" />
              <span>{isHindi ? 'भाव-ताव / होल्ड' : 'Bhav-Taav'}</span>
            </>
          ) : (
            <>
              <Eye size={13} aria-hidden="true" />
              <span>{isHindi ? 'देखें / होल्ड' : 'Hold / View'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const ProductCard = memo(ProductCardInner);
export default ProductCard;
