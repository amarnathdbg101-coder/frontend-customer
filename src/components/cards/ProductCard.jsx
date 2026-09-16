/**
 * Reusable Product Card Component
 * Bilingual, accessible, and responsive card with live stock badges and hold actions
 */

import React, { memo } from 'react';
import { Package, Heart, Store, Sparkles, Eye } from 'lucide-react';
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
  const hasDiscount = p.compare_price && p.compare_price > p.price;
  const discountPct = hasDiscount ? Math.round(((p.compare_price - p.price) / p.compare_price) * 100) : 0;
  const brand = p.attributes?.brand || p.attributes?.company;
  const allowBargain = p.allow_bargain !== false;

  return (
    <div
      className="card card-clickable product-card"
      onClick={onClick}
      role="article"
      aria-label={`Product: ${p.name}, Price: ₹${p.price}`}
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

        {/* Price */}
        <div className="product-card-price-row">
          <span className="product-card-price">₹{p.price}</span>
          {hasDiscount && (
            <span className="product-card-mrp">₹{p.compare_price}</span>
          )}
          {hasDiscount && (
            <span className="product-card-discount">{discountPct}% OFF</span>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="product-card-actions" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClick}
          className="btn btn-primary btn-sm product-card-cta"
        >
          {allowBargain && inStock ? (
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
