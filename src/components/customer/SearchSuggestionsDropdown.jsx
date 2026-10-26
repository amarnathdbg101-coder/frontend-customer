/**
 * SearchSuggestionsDropdown Component
 * 
 * Floating, instant autocomplete suggestions card for all search bars (Explore, Storefront, etc.)
 * Features:
 * - Real-time suggestions with matching keywords highlighted
 * - Recent searches chips with 1-tap delete & 1-tap re-search
 * - Keyboard navigation (Escape to close)
 * - Click-outside dismiss
 * - Zero lag & dark mode compatible
 */

import React, { useEffect, useRef } from 'react';
import { Search, Clock, X, Loader2, ArrowUpLeft } from 'lucide-react';
import { highlightMatch } from '../../utils/searchHelpers';

export const SearchSuggestionsDropdown = ({
  isOpen = false,
  onClose,
  query = '',
  suggestions = [],
  isLoading = false,
  onSelectSuggestion,
  recentSearches = [],
  onSelectRecent,
  onRemoveRecent,
  onClearAllRecent,
  isHindi = false,
  style = {},
}) => {
  const containerRef = useRef(null);

  // Click-outside listener
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose?.();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const hasSuggestions = suggestions.length > 0;
  const hasRecent = !query.trim() && recentSearches.length > 0;

  if (!isOpen || (!hasSuggestions && !hasRecent && !isLoading)) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 6px)',
        left: 0,
        right: 0,
        backgroundColor: 'var(--bg-surface, #ffffff)',
        border: '1px solid var(--border-subtle, #e2e8f0)',
        borderRadius: '16px',
        boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.06)',
        zIndex: 1050,
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
        padding: '8px 0',
        ...style,
      }}
    >
      {/* Loading state for suggestions */}
      {isLoading && suggestions.length === 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            fontSize: '0.8rem',
            color: 'var(--text-secondary, #64748b)',
          }}
        >
          <Loader2 size={15} className="animate-spin" color="var(--color-primary, #4f46e5)" />
          <span>{isHindi ? 'सुझाव खोज रहे हैं...' : 'Finding matching products...'}</span>
        </div>
      )}

      {/* Autocomplete Suggestions List */}
      {hasSuggestions && (
        <div>
          <div
            style={{
              padding: '4px 16px 6px 16px',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: 'var(--text-muted, #94a3b8)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {isHindi ? 'सुझाव' : 'Suggestions'}
          </div>

          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onSelectSuggestion?.(item);
                onClose?.();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.85rem',
                color: 'var(--text-primary, #0f172a)',
                transition: 'background-color 0.15s ease',
                gap: '10px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle, #f8fafc)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <Search size={15} color="var(--color-primary, #4f46e5)" style={{ flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {highlightMatch(item, query)}
                </span>
              </div>
              <ArrowUpLeft size={14} color="var(--text-muted, #94a3b8)" style={{ flexShrink: 0 }} />
            </button>
          ))}
        </div>
      )}

      {/* Recent Searches (when query is empty and input is focused) */}
      {hasRecent && (
        <div style={{ padding: '6px 16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                color: 'var(--text-secondary, #64748b)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Clock size={13} color="var(--color-primary, #4f46e5)" />
              {isHindi ? 'हाल की खोजें' : 'Recent Searches'}
            </span>
            {onClearAllRecent && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearAllRecent();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted, #94a3b8)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  padding: '2px 4px',
                }}
              >
                {isHindi ? 'हटाएं' : 'Clear All'}
              </button>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
              maxHeight: '120px',
              overflowY: 'auto',
              paddingBottom: '4px',
            }}
          >
            {recentSearches.map((term, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-surface-subtle, #f1f5f9)',
                  border: '1px solid var(--border-subtle, #e2e8f0)',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: 'var(--text-primary, #0f172a)',
                  whiteSpace: 'nowrap',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectRecent?.(term);
                    onClose?.();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    fontWeight: 'inherit',
                    fontSize: 'inherit',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {term}
                </button>
                {onRemoveRecent && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveRecent(term);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted, #94a3b8)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                    }}
                    title={isHindi ? 'हटाएं' : 'Remove'}
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSuggestionsDropdown;
