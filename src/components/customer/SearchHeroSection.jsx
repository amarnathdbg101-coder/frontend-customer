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

  const popularSearches = [
    { id: 'rice', label: isHindi ? '🌾 चावल' : '🌾 Rice', term: isHindi ? 'चावल' : 'Rice' },
    { id: 'atta', label: isHindi ? '🌾 आटा' : '🌾 Atta', term: isHindi ? 'आटा' : 'Atta' },
    { id: 'milk', label: isHindi ? '🥛 दूध' : '🥛 Milk', term: isHindi ? 'दूध' : 'Milk' },
    { id: 'hairoil', label: isHindi ? '🧴 हेयर ऑयल' : '🧴 Hair Oil', term: isHindi ? 'हेयर ऑयल' : 'Hair Oil' },
    { id: 'saree', label: isHindi ? '🥻 साड़ी' : '🥻 Saree', term: isHindi ? 'साड़ी' : 'Saree' },
    { id: 'cooker', label: isHindi ? '🍲 कुकर' : '🍲 Pressure Cooker', term: isHindi ? 'कुकर' : 'Pressure Cooker' },
    { id: 'soap', label: isHindi ? '🧼 साबुन' : '🧼 Soap', term: isHindi ? 'साबुन' : 'Soap' },
    { id: 'snacks', label: isHindi ? '🍪 स्नैक्स' : '🍪 Snacks', term: isHindi ? 'स्नैक्स' : 'Snacks' },
  ];

  const trustBadges = [
    {
      id: 'verified_shops',
      title: isHindi ? 'सत्यापित स्थानीय दुकानें' : 'Verified Local Shops',
      emoji: '✅',
    },
    {
      id: 'live_inventory',
      title: isHindi ? 'लाइव इन्वेंटरी' : 'Live Inventory',
      emoji: '⚡',
    },
    {
      id: 'compare_prices',
      title: isHindi ? 'दामों की तुलना' : 'Compare Prices',
      emoji: '💰',
    },
    {
      id: 'reserve_pickup',
      title: isHindi ? 'रिज़र्व एवं पिकअप' : 'Reserve & Pickup',
      emoji: '🏪',
    },
  ];

  return (
    <section className="search-hero-section" aria-label="Product Search Hero">
      <div className="search-hero-inner">
        {/* 1. Hero Heading & Subtitle */}
        <div className="hero-typography">
          <h1 className="hero-main-heading">
            {isHindi ? 'पास की दुकानों में सामान खोजें' : 'Find Products in Nearby Shops'}
          </h1>
          <p className="hero-subtitle">
            {isHindi
              ? 'कीमतों की तुलना करें, उपलब्धता जांचें और पास से रिज़र्व करें।'
              : 'Compare prices, check availability and reserve nearby.'}
          </p>
        </div>

        {/* 2. Large Search Box as Primary Focus */}
        <div className="hero-search-wrapper" role="search">
          <div
            className={`hero-search-box ${isSuggestionsOpen ? 'is-focused' : ''}`}
            onClick={() => inputRef.current?.focus()}
          >
            <div className="search-icon-slot">
              {isSearchingServer ? (
                <Loader2 size={22} className="animate-spin text-primary" />
              ) : (
                <Search size={22} className="hero-search-icon" />
              )}
            </div>

            <input
              ref={inputRef}
              type="search"
              aria-label={isHindi ? 'दुकानों या सामान में खोजें' : 'Search for products or nearby shops'}
              placeholder={
                isHindi
                  ? 'सामान, दुकान या ब्रांड खोजें (उदा. दूध, दवा, इलेक्ट्रॉनिक्स)...'
                  : 'Search for products, brands, or nearby shops...'
              }
              value={searchTerm}
              onFocus={() => onOpenSuggestions?.()}
              onChange={(e) => {
                onSearchChange?.(e.target.value);
                onOpenSuggestions?.();
              }}
              onKeyDown={handleKeyDown}
              className="hero-search-input"
            />

            {/* Clear Input Button */}
            {searchTerm && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearSearch?.();
                }}
                className="hero-search-clear-btn"
                title={isHindi ? 'साफ़ करें' : 'Clear search'}
                aria-label={isHindi ? 'साफ़ करें' : 'Clear search'}
              >
                <X size={17} />
              </button>
            )}

            {/* Voice Search Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVoiceSearch?.();
              }}
              className={`hero-voice-btn ${isVoiceListening ? 'is-listening' : ''}`}
              title={
                isVoiceListening
                  ? (isHindi ? 'सुन रहे हैं... रोकें' : 'Listening... click to stop')
                  : (isHindi ? 'बोलकर खोजें' : 'Voice search')
              }
              aria-label={isHindi ? 'बोलकर खोजें' : 'Voice search'}
            >
              {isVoiceListening ? (
                <MicOff size={18} className="animate-pulse" />
              ) : (
                <Mic size={18} />
              )}
            </button>

            {/* Compare / Smart Search Helper Pill */}
            {onOpenSmartSearch && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSmartSearch();
                }}
                className="hero-compare-pill-btn"
                title={isHindi ? 'मल्टी-शॉप तुलना' : 'Compare Nearby Stores'}
              >
                <Sparkles size={14} />
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
              className="hero-search-action-btn"
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

        {/* 2.5 POPULAR SEARCHES CHIPS (Immediate 1-Tap Search Trigger) */}
        <div
          style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
          role="region"
          aria-label="Popular Searches"
        >
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: 'var(--text-muted, #94a3b8)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginRight: '2px',
            }}
          >
            {isHindi ? '🔥 लोकप्रिय खोजें:' : '🔥 Popular:'}
          </span>

          {popularSearches.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSearchChange?.(item.term);
                onSelectSuggestion?.(item.term);
                onSearchSubmit?.(item.term);
                onCloseSuggestions?.();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '5px 12px',
                backgroundColor: 'var(--bg-surface, #ffffff)',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                borderRadius: '20px',
                fontSize: '0.76rem',
                fontWeight: 600,
                color: 'var(--text-primary, #0f172a)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-light, #eff6ff)';
                e.currentTarget.style.borderColor = 'var(--color-primary, #2563eb)';
                e.currentTarget.style.color = 'var(--color-primary, #2563eb)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface, #ffffff)';
                e.currentTarget.style.borderColor = 'var(--border-subtle, #e2e8f0)';
                e.currentTarget.style.color = 'var(--text-primary, #0f172a)';
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 3. Small Rounded Trust Badge Cards in One Row (Credibility Focus) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginTop: '16px',
          }}
          role="region"
          aria-label="Trust and Credibility Badges"
        >
          {trustBadges.map((badge) => (
            <div
              key={badge.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                backgroundColor: 'var(--bg-surface, #ffffff)',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-primary, #0f172a)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
              }}
            >
              <span style={{ fontSize: '0.85rem' }}>{badge.emoji}</span>
              <span>{badge.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SearchHeroSection;
