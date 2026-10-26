/**
 * DidYouMeanBanner Component
 * 
 * Non-intrusive, smart spell-correction banner (Blinkit / Amazon style).
 * Shown when user has a typo and results or suggestions were corrected.
 */

import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export const DidYouMeanBanner = ({
  originalQuery = '',
  suggestedQuery = '',
  onApplySuggestion,
  isHindi = false,
  style = {},
}) => {
  if (!suggestedQuery || !originalQuery || suggestedQuery.toLowerCase() === originalQuery.toLowerCase()) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        backgroundColor: 'rgba(79, 70, 229, 0.06)',
        border: '1px solid rgba(79, 70, 229, 0.2)',
        borderRadius: '14px',
        marginBottom: '14px',
        fontSize: '0.82rem',
        color: 'var(--text-primary, #0f172a)',
        gap: '8px',
        flexWrap: 'wrap',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={16} color="var(--color-primary, #4f46e5)" style={{ flexShrink: 0 }} />
        <span>
          {isHindi ? 'क्या आपका मतलब था:' : 'Showing results for:'}{' '}
          <button
            type="button"
            onClick={() => onApplySuggestion?.(suggestedQuery)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary, #4f46e5)',
              fontWeight: 800,
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
              fontSize: '0.84rem',
            }}
          >
            {suggestedQuery}
          </button>
        </span>
      </div>

      <button
        type="button"
        onClick={() => onApplySuggestion?.(suggestedQuery)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          background: 'none',
          border: 'none',
          color: 'var(--color-primary, #4f46e5)',
          fontSize: '0.74rem',
          fontWeight: 700,
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <span>{isHindi ? 'इसे खोजें' : 'Search this'}</span>
        <ArrowRight size={13} />
      </button>
    </div>
  );
};

export default DidYouMeanBanner;
