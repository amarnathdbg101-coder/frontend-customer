/**
 * CuratedProductShelf Component
 * Horizontal scrolling supermarket aisle / curated shelf.
 * Inspired by Blinkit, Zepto, and Swiggy Instamart.
 * Provides effortless thumb-friendly horizontal browsing with 1-tap cart additions.
 */

import React, { useRef } from 'react';
import { ChevronRight, ChevronLeft, ArrowRight, Sparkles } from 'lucide-react';
import { ProductCard } from '../cards/ProductCard';

export const CuratedProductShelf = ({
  title,
  subtitle,
  icon,
  badgeText,
  badgeBg = '#eff6ff',
  badgeColor = '#2563eb',
  products = [],
  onViewAll,
  onProductClick,
  isProductSaved,
  onToggleSave,
  shopName,
  shopSlug,
  isHindi = false,
}) => {
  const scrollContainerRef = useRef(null);

  if (!products || products.length === 0) return null;

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section
      style={{
        marginBottom: '16px',
        backgroundColor: 'var(--bg-card, #ffffff)',
        borderRadius: '16px',
        border: '1px solid var(--border-subtle, #e2e8f0)',
        padding: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
      aria-label={title}
    >
      {/* Shelf Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}
      >
        <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon && (
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: badgeBg,
                color: badgeColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                flexShrink: 0,
              }}
            >
              {icon}
            </div>
          )}

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <h3
                style={{
                  fontSize: '0.96rem',
                  fontWeight: 800,
                  margin: 0,
                  color: 'var(--text-primary, #0f172a)',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                }}
              >
                {title}
              </h3>
              {badgeText && (
                <span
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    backgroundColor: badgeBg,
                    color: badgeColor,
                    padding: '2px 6px',
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                  }}
                >
                  {badgeText}
                </span>
              )}
            </div>
            {subtitle && (
              <p
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary, #64748b)',
                  margin: '2px 0 0 0',
                  lineHeight: 1.25,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* View All & Desktop Scroll Arrows */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-primary, #2563eb)',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                padding: '4px 6px',
                borderRadius: '6px',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle, #f8fafc)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span>{isHindi ? 'सब देखें' : 'View All'}</span>
              <ChevronRight size={15} />
            </button>
          )}

          {/* Desktop Arrow Controls */}
          <div className="shelf-desktop-arrows" style={{ display: 'none', gap: '4px' }}>
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                backgroundColor: 'var(--bg-surface, #ffffff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                backgroundColor: 'var(--bg-surface, #ffffff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollContainerRef}
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          paddingBottom: '6px',
          paddingRight: '8px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              flex: '0 0 calc(50% - 4px)',
              width: 'calc(50% - 4px)',
              maxWidth: '180px',
              scrollSnapAlign: 'start',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            <ProductCard
              product={p}
              isSaved={isProductSaved ? isProductSaved(p.id) : false}
              onToggleSave={onToggleSave}
              onClick={() => onProductClick?.(p)}
              shopName={shopName}
              shopSlug={shopSlug}
            />
          </div>
        ))}

        {/* Trailing "Explore All" Card */}
        {products.length >= 4 && onViewAll && (
          <div
            onClick={onViewAll}
            style={{
              flex: '0 0 120px',
              scrollSnapAlign: 'start',
              height: '270px',
              borderRadius: '12px',
              border: '1.5px dashed var(--border-subtle, #cbd5e1)',
              backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              textAlign: 'center',
              cursor: 'pointer',
              color: 'var(--color-primary, #2563eb)',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-light, #eff6ff)';
              e.currentTarget.style.borderColor = 'var(--color-primary, #2563eb)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle, #f8fafc)';
              e.currentTarget.style.borderColor = 'var(--border-subtle, #cbd5e1)';
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light, #eff6ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowRight size={18} color="var(--color-primary, #2563eb)" />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>
              {isHindi ? 'और देखें' : 'See More'}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary, #64748b)', fontWeight: 600 }}>
              {products.length} {isHindi ? 'सामान' : 'items'}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
