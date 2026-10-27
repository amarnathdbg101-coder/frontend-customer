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

  const trustBadges = [
    {
      id: 'verified_shops',
      title: isHindi ? 'वेरीफाइड दुकानें' : 'Verified Shops',
      icon: <ShieldCheck size={16} className="trust-icon verified" />,
    },
    {
      id: 'live_inventory',
      title: isHindi ? 'लाइव स्टॉक' : 'Live Inventory',
      icon: <Radio size={15} className="trust-icon live" />,
    },
    {
      id: 'compare_prices',
      title: isHindi ? 'कीमत तुलना' : 'Compare Prices',
      icon: <Scale size={16} className="trust-icon compare" />,
    },
    {
      id: 'reserve_pickup',
      title: isHindi ? 'रिज़र्व व पिकअप' : 'Reserve & Pickup',
      icon: <ShoppingBag size={15} className="trust-icon reserve" />,
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

        {/* 3. Four Trust Badges in One Row */}
        <div className="trust-badges-row" role="region" aria-label="Trust and Reliability Badges">
          {trustBadges.map((badge) => (
            <div key={badge.id} className="trust-badge-item">
              <span className="trust-badge-icon">{badge.icon}</span>
              <span className="trust-badge-title">{badge.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SearchHeroSection;
