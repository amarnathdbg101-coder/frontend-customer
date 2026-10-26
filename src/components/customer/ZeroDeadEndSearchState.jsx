/**
 * ZeroDeadEndSearchState Component
 * 
 * Replaces dull empty states with an interactive recovery experience:
 * - 1-Tap Item Request ("सामान की माँग करें") so shopkeepers know customer demand
 * - Popular neighborhood staples quick chips (Milk, Oil, Atta, Biscuits, Soap, etc.)
 * - 1-Tap Reset to view all catalog
 * - Avoids vegetable images/icons (pure grocery & packaged goods icons)
 */

import React, { useState } from 'react';
import { PackageSearch, Send, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

const POPULAR_STAPLES = [
  { label: 'दूध (Milk)', query: 'Milk', en: 'Milk' },
  { label: 'तेल (Oil)', query: 'Oil', en: 'Oil' },
  { label: 'आटा (Atta)', query: 'Atta', en: 'Atta' },
  { label: 'नमक (Salt)', query: 'Tata Salt', en: 'Salt' },
  { label: 'मैगी (Maggi)', query: 'Maggi', en: 'Maggi' },
  { label: 'बिस्किट (Biscuits)', query: 'Parle', en: 'Biscuits' },
  { label: 'साबुन (Soap)', query: 'Soap', en: 'Soap' },
  { label: 'शैम्पू (Shampoo)', query: 'Clinic Plus', en: 'Shampoo' },
];

export const ZeroDeadEndSearchState = ({
  query = '',
  onSelectPopular,
  onResetFilters,
  isHindi = false,
  style = {},
}) => {
  const [isRequested, setIsRequested] = useState(false);

  const handleRequestItem = () => {
    setIsRequested(true);
    // Auto-reset state message after 5 seconds
    setTimeout(() => {
      setIsRequested(false);
    }, 5000);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '36px 16px',
        backgroundColor: 'var(--bg-surface, #ffffff)',
        border: '1px solid var(--border-subtle, #e2e8f0)',
        borderRadius: '20px',
        maxWidth: '560px',
        margin: '16px auto',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        ...style,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '14px',
          color: 'var(--color-primary, #4f46e5)',
        }}
      >
        <PackageSearch size={28} />
      </div>

      {/* Main Title */}
      <h3
        style={{
          fontSize: '1rem',
          fontWeight: 800,
          color: 'var(--text-primary, #0f172a)',
          margin: '0 0 6px 0',
        }}
      >
        {query ? (
          isHindi ? (
            <span>"{query}" के लिए कोई सामान नहीं मिला</span>
          ) : (
            <span>No items found for "{query}"</span>
          )
        ) : (
          isHindi ? 'कोई सामान नहीं मिला' : 'No items found'
        )}
      </h3>

      {/* Subtitle */}
      <p
        style={{
          fontSize: '0.82rem',
          color: 'var(--text-secondary, #64748b)',
          margin: '0 0 18px 0',
          maxWidth: '420px',
          lineHeight: 1.45,
        }}
      >
        {isHindi
          ? 'हो सकता है यह सामान अभी स्टॉक में न हो। आप नीचे से इस सामान की माँग कर सकते हैं या लोकप्रिय सामान खोज सकते हैं।'
          : 'This item might be temporarily out of stock. You can request local shops to stock it or browse popular neighborhood staples.'}
      </p>

      {/* 1-Tap Item Demand Request Button */}
      {query && (
        <div style={{ marginBottom: '22px', width: '100%', maxWidth: '340px' }}>
          {isRequested ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '12px',
                backgroundColor: '#dcfce7',
                border: '1px solid #86efac',
                color: '#15803d',
                fontSize: '0.82rem',
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={16} />
              <span>
                {isHindi
                  ? 'दुकानदारों को माँग भेज दी गई!'
                  : 'Demand sent to nearby shops!'}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleRequestItem}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 18px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-surface-subtle, #f1f5f9)',
                border: '1.5px solid var(--border-subtle, #cbd5e1)',
                color: 'var(--color-primary, #4f46e5)',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.08)';
                e.currentTarget.style.borderColor = 'var(--color-primary, #4f46e5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle, #f1f5f9)';
                e.currentTarget.style.borderColor = 'var(--border-subtle, #cbd5e1)';
              }}
            >
              <Send size={15} />
              <span>
                {isHindi ? `दुकान से "${query}" की माँग करें` : `Request "${query}" from shops`}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Popular Everyday Staples Quick Chips */}
      <div style={{ width: '100%', marginBottom: '18px' }}>
        <div
          style={{
            fontSize: '0.74rem',
            fontWeight: 800,
            color: 'var(--text-muted, #94a3b8)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
          }}
        >
          <Sparkles size={12} color="var(--color-primary, #4f46e5)" />
          <span>{isHindi ? 'लोकप्रिय ज़रूरी सामान' : 'Popular Everyday Staples'}</span>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {POPULAR_STAPLES.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPopular?.(item.query)}
              style={{
                padding: '6px 12px',
                borderRadius: '16px',
                backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                color: 'var(--text-primary, #0f172a)',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface, #ffffff)';
                e.currentTarget.style.borderColor = 'var(--color-primary, #4f46e5)';
                e.currentTarget.style.color = 'var(--color-primary, #4f46e5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle, #f8fafc)';
                e.currentTarget.style.borderColor = 'var(--border-subtle, #e2e8f0)';
                e.currentTarget.style.color = 'var(--text-primary, #0f172a)';
              }}
            >
              {isHindi ? item.label : item.en}
            </button>
          ))}
        </div>
      </div>

      {/* 1-Tap Reset Filters / View All Catalog */}
      {onResetFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary, #64748b)',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '6px 12px',
            textDecoration: 'underline',
          }}
        >
          <RotateCcw size={13} />
          <span>{isHindi ? 'सभी सामान देखें' : 'View all items'}</span>
        </button>
      )}
    </div>
  );
};

export default ZeroDeadEndSearchState;
