import React, { useRef } from 'react';
import {
  Search,
  X,
  Mic,
  MicOff,
  Loader2,
  Scale,
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
    <section className="search-hero-section" aria-label={isHindi ? 'सामान खोजें' : 'Product search'} style={{ padding: '6px 0 2px 0', width: '100%', maxWidth: '100vw', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div className="search-hero-inner">
        <div className="search-hero-heading" style={{ marginBottom: '12px' }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: '0 0 4px 0', lineHeight: 1.25 }}>
            {isHindi ? 'अपने आसपास ज़रूरत का सामान खोजें' : 'Find what you need, close to home'}
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary, #475569)', margin: 0, lineHeight: 1.4 }}>
            {isHindi ? 'स्थानीय दुकानों के सामान और उपलब्ध जानकारी देखें।' : 'Browse products and availability shared by local shops.'}
          </p>
        </div>

        <div className="hero-search-wrapper" role="search" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', position: 'relative' }}>
          <div
            className={`hero-search-box ${isSuggestionsOpen ? 'is-focused' : ''}`}
            onClick={() => inputRef.current?.focus()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 8px 6px 14px',
              backgroundColor: 'var(--bg-surface, #ffffff)',
              border: '1.5px solid var(--border-subtle, #e2e8f0)',
              borderRadius: '14px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              boxSizing: 'border-box',
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
            }}
          >
            <div className="search-icon-slot" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {isSearchingServer ? (
                <Loader2 size={18} className="animate-spin text-primary" color="#0f172a" />
              ) : (
                <Search size={18} color="#0f172a" />
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
                gap: '5px',
                padding: '7px 14px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.80rem',
                fontWeight: 750,
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
              title={isHindi ? 'खोजें' : 'Search'}
            >
              <Search size={14} />
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

        {onOpenSmartSearch && (
          <div className="search-hero-tools" style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-start' }}>
            <button
              type="button"
              className="search-hero-compare"
              onClick={onOpenSmartSearch}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--color-primary, #4f46e5)',
                padding: '4px 2px',
                fontSize: '0.78rem',
                fontWeight: 750,
                cursor: 'pointer',
              }}
              title={isHindi ? 'आस-पास की दुकानों में तुलना करें' : 'Compare nearby stores'}
            >
              <Scale size={13} color="var(--color-primary, #4f46e5)" aria-hidden="true" />
              <span>{isHindi ? 'दुकानों की कीमतें तुलना करें' : 'Compare nearby store prices'} →</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchHeroSection;
