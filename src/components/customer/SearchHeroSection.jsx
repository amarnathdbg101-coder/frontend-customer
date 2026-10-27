/**
 * SearchHeroSection Component
 * Above-the-fold Search-First Hero Section for ShopSilo Homepage:
 * 1. Hero Heading: "Find Products in Nearby Shops"
 * 2. Hero Subtitle: "Compare prices, check availability and reserve nearby."
 * 3. Large Search Box as primary focus (with live autocomplete & voice search)
 * 4. Four trust badges in one row:
 *    - Verified Shops
 *    - Live Inventory
 *    - Compare Prices
 *    - Reserve & Pickup
 */

import React, { useRef } from 'react';
import {
  Search,
  X,
  Mic,
  MicOff,
  Loader2,
  ShieldCheck,
  Radio,
  Scale,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { SearchSuggestionsDropdown } from './SearchSuggestionsDropdown';

export const SearchHeroSection = ({
  searchTerm = '',
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  isSearchingServer = false,
  isSuggestionsOpen = false,
  onOpenSuggestions,
  onCloseSuggestions,
  searchSuggestions = [],
  isLoadingSuggestions = false,
  onSelectSuggestion,
  recentSearches = [],
  onSelectRecent,
  onRemoveRecent,
  onClearAllRecent,
  isVoiceListening = false,
  onToggleVoiceSearch,
  onOpenSmartSearch,
  isHindi = false,
}) => {
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onCloseSuggestions?.();
      onSearchSubmit?.(searchTerm);
    }
  };

  return (
    <section className="search-hero-section" aria-label="Product Search Hero" style={{ padding: '6px 0 2px 0' }}>
      <div className="search-hero-inner">
        {/* Large Search Box as Primary App Focus (Placed Right At Top - Blinkit PWA Style) */}
        <div className="hero-search-wrapper" role="search" style={{ width: '100%', position: 'relative' }}>
          <div
            className={`hero-search-box ${isSuggestionsOpen ? 'is-focused' : ''}`}
            onClick={() => inputRef.current?.focus()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 8px 6px 12px',
              backgroundColor: 'var(--bg-surface, #ffffff)',
              border: '2px solid var(--border-subtle, #e2e8f0)',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            }}
          >
            <div className="search-icon-slot" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {isSearchingServer ? (
                <Loader2 size={20} className="animate-spin text-primary" color="var(--color-primary, #4f46e5)" />
              ) : (
                <Search size={20} color="var(--color-primary, #4f46e5)" />
              )}
            </div>

            <input
              ref={inputRef}
              type="search"
              aria-label={isHindi ? 'दुकानों या सामान में खोजें' : 'Search for products or nearby shops'}
              placeholder={
                isHindi
                  ? 'सामान, दुकान या ब्रांड खोजें...'
                  : 'Search products, brands, shops...'
              }
              value={searchTerm}
              onFocus={() => onOpenSuggestions?.()}
              onChange={(e) => {
                onSearchChange?.(e.target.value);
                onOpenSuggestions?.();
              }}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                minWidth: '70px',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '0.86rem',
                fontWeight: 600,
                color: 'var(--text-primary, #0f172a)',
              }}
            />

            {/* Clear Input Button */}
            {searchTerm && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearSearch?.();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: 'var(--text-muted, #94a3b8)',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
                title={isHindi ? 'साफ़ करें' : 'Clear search'}
              >
                <X size={16} />
              </button>
            )}

            {/* Voice Search Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVoiceSearch?.();
              }}
              style={{
                background: isVoiceListening ? '#fee2e2' : 'var(--bg-surface-subtle, #f8fafc)',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                borderRadius: '10px',
                padding: '6px',
                cursor: 'pointer',
                color: isVoiceListening ? '#dc2626' : 'var(--text-secondary, #64748b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              title={isHindi ? 'बोलकर खोजें' : 'Voice search'}
            >
              {isVoiceListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            {/* Compare / Smart Search Helper Pill (ALWAYS VISIBLE ON MOBILE) */}
            {onOpenSmartSearch && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSmartSearch();
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  backgroundColor: '#f0fdf4',
                  border: '1.5px solid #a7f3d0',
                  borderRadius: '12px',
                  color: '#059669',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: '0 1px 3px rgba(16, 185, 129, 0.15)',
                  whiteSpace: 'nowrap',
                }}
                title={isHindi ? 'मल्टी-शॉप लाइव तुलना' : 'Compare Nearby Stores'}
              >
                <Sparkles size={14} color="#059669" />
                <span>{isHindi ? 'तुलना' : 'Compare'}</span>
              </button>
            )}

            {/* Search Submit Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCloseSuggestions?.();
                onSearchSubmit?.(searchTerm);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '7px 12px',
                backgroundColor: 'var(--color-primary, #4f46e5)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.80rem',
                fontWeight: 800,
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
              }}
              title={isHindi ? 'खोजें' : 'Search'}
            >
              <span>{isHindi ? 'सर्च' : 'Search'}</span>
            </button>
          </div>

          {/* Live Autocomplete Suggestions Dropdown */}
          <SearchSuggestionsDropdown
            isOpen={isSuggestionsOpen}
            onClose={onCloseSuggestions}
            query={searchTerm}
            suggestions={searchSuggestions}
            isLoading={isLoadingSuggestions}
            onSelectSuggestion={onSelectSuggestion}
            recentSearches={recentSearches}
            onSelectRecent={onSelectRecent}
            onRemoveRecent={onRemoveRecent}
            onClearAllRecent={onClearAllRecent}
            isHindi={isHindi}
          />
        </div>
      </div>
    </section>
  );
};

export default SearchHeroSection;
