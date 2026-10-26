/**
 * CuratedShelfDetailView Component
 * Dedicated full collection page for a curated supermarket shelf
 * (e.g., Super Saver Deals, Budget Store <₹99, Tea & Snacks, Home Hygiene).
 * Opens when customer clicks "View All" or "See More" on any shelf.
 */

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, SlidersHorizontal, Package, ArrowUpDown } from 'lucide-react';
import { ProductCard } from '../cards/ProductCard';

export const CuratedShelfDetailView = ({
  shelf,
  onBack,
  onProductClick,
  isProductSaved,
  onToggleSave,
  shopName,
  shopSlug,
  isHindi = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('relevant');

  const products = shelf?.products || [];

  // Filter and sort products inside this shelf
  const displayProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.category_name && p.category_name.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price_low':
        result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        break;
      case 'price_high':
        result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        break;
      case 'discount':
        result.sort((a, b) => {
          const discA = a.compare_price && a.compare_price > a.price ? a.compare_price - a.price : 0;
          const discB = b.compare_price && b.compare_price > b.price ? b.compare_price - b.price : 0;
          return discB - discA;
        });
        break;
      default:
        break;
    }

    return result;
  }, [products, searchTerm, sortBy]);

  if (!shelf) return null;

  return (
    <div className="curated-shelf-detail-view" style={{ minHeight: '80vh', paddingBottom: '80px' }}>
      {/* 1. Top Navigation & Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
          paddingBottom: '12px',
          borderBottom: '1.5px solid var(--border-subtle, #e2e8f0)',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            border: '1.5px solid var(--border-subtle, #e2e8f0)',
            backgroundColor: 'var(--bg-card, #ffffff)',
            color: 'var(--text-primary, #0f172a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.15s ease',
          }}
          aria-label="Back to store"
        >
          <ArrowLeft size={18} />
        </button>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.2rem' }}>{shelf.icon || '🛒'}</span>
            <h2
              style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                margin: 0,
                color: 'var(--text-primary, #0f172a)',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}
            >
              {shelf.title}
            </h2>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                backgroundColor: shelf.badgeBg || '#eff6ff',
                color: shelf.badgeColor || '#2563eb',
                padding: '2px 8px',
                borderRadius: '8px',
              }}
            >
              {products.length} {isHindi ? 'सामान' : 'Items'}
            </span>
          </div>

          {shelf.subtitle && (
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary, #64748b)',
                margin: '2px 0 0 0',
                lineHeight: 1.3,
              }}
            >
              {shelf.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* 2. Shelf In-Category Search & Sort Controls */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-card, #ffffff)',
            border: '1.5px solid var(--border-subtle, #e2e8f0)',
            borderRadius: '12px',
            padding: '0 12px',
            height: '40px',
          }}
        >
          <Search size={16} color="var(--text-muted, #94a3b8)" style={{ marginRight: '8px', flexShrink: 0 }} />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isHindi ? `इस शेल्फ में खोजें...` : `Search in this shelf...`}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.84rem',
              color: 'var(--text-primary, #0f172a)',
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted, #94a3b8)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                padding: '2px',
              }}
            >
              ✕
            </button>
          )}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            height: '40px',
            fontSize: '0.76rem',
            fontWeight: 800,
            padding: '0 10px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-card, #ffffff)',
            border: '1.5px solid var(--border-subtle, #e2e8f0)',
            color: 'var(--color-primary, #2563eb)',
            cursor: 'pointer',
            outline: 'none',
            flexShrink: 0,
          }}
          aria-label="Sort products in shelf"
        >
          <option value="relevant">⚡ {isHindi ? 'लोकप्रिय' : 'Relevant'}</option>
          <option value="price_low">💰 {isHindi ? 'कम कीमत' : 'Price: Low'}</option>
          <option value="price_high">💎 {isHindi ? 'अधिक कीमत' : 'Price: High'}</option>
          <option value="discount">🔥 {isHindi ? 'छूट % OFF' : 'Discount %'}</option>
        </select>
      </div>

      {/* 3. Products Grid */}
      {displayProducts.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 16px',
            backgroundColor: 'var(--bg-card, #ffffff)',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle, #e2e8f0)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
              color: 'var(--text-muted, #94a3b8)',
            }}
          >
            <Package size={24} />
          </div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {isHindi ? 'कोई सामान नहीं मिला' : 'No items found'}
          </h4>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {isHindi ? 'कृपया सर्च शब्द बदलकर देखें' : 'Try searching with another keyword'}
          </p>
        </div>
      ) : (
        <div className="customer-product-grid">
          {displayProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              isSaved={isProductSaved ? isProductSaved(p.id) : false}
              onToggleSave={onToggleSave}
              onClick={() => onProductClick?.(p)}
              shopName={shopName || p.shop_name}
              shopSlug={shopSlug || p.shop_slug}
            />
          ))}
        </div>
      )}
    </div>
  );
};
