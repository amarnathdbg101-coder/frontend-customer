/**
 * Reusable Product Card Component
 * Supports MRP strike-through, discount percentage, rating badge, and Add to Cart
 */

import React, { memo } from 'react';
import { Package, Heart, Store, Sparkles, Eye, MessageCircle, Star, ShoppingCart } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';

const ProductCardInner = ({
  product,
  isSaved = false,
  onToggleSave,
  onClick,
}) => {
  const { t, isHindi } = useLanguage();
  const { addItem, isInCart } = useCart();
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
  const inCart = isInCart(p.id);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addItem(p, 1);
  };

  return (
    <div
      className="card card-clickable product-card"
      onClick={onClick}
      role="article"
      aria-label={`Product: ${p.name}, Price: ${isPricePublic ? '₹' + price : 'Price on Request'}`}
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
    >
      <div>
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
            {inStock ? (isHindi ? `${stock} उपलब्ध` : `${stock} in stock`) : t('products.out_of_stock')}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            {brand ? (
              <div className="product-card-brand">{brand}</div>
            ) : <span />}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.72rem', fontWeight: 700, color: '#eab308' }}>
              <Star size={11} fill="#eab308" />
              <span>4.8</span>
            </div>
          </div>

          <h4 className="product-card-name" style={{ margin: '2px 0 6px 0' }}>{p.name}</h4>

          {/* Shop Name */}
          <div className="product-card-shop">
            <Store size={12} color="var(--text-muted)" aria-hidden="true" />
            <span>{p.shop_name || (isHindi ? 'प्रमाणित दुकान' : 'Verified Merchant')}</span>
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="product-card-actions" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
        {inStock && isPricePublic && (
          <button
            type="button"
            onClick={handleQuickAdd}
            className={`btn btn-sm ${inCart ? 'btn-success' : 'btn-secondary'}`}
            style={{ padding: '6px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
            title={t('products.add_to_cart')}
          >
            <ShoppingCart size={13} />
            <span>{inCart ? t('products.already_in_cart') : '+'}</span>
          </button>
        )}

        <button
          onClick={onClick}
          className="btn btn-primary btn-sm product-card-cta"
          style={{ flex: 1, padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
        >
          <Eye size={13} aria-hidden="true" />
          <span>{inStock ? t('products.reserve_for_pickup') : t('products.product_details')}</span>
        </button>
      </div>
    </div>
  );
};

export const ProductCard = memo(ProductCardInner);
export default ProductCard;
