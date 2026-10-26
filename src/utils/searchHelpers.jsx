/**
 * Search Helpers & Utilities
 * 
 * Centralized, resilient search helpers for:
 * - LocalStorage recent searches sync across Explore, Storefront, and SmartSearchModal
 * - High-performance match highlighting using <mark>
 * - Popular search suggestions (bilingual English / Hindi)
 */

import React from 'react';

export const RECENT_SEARCHES_KEY = 'shopsilo_recent_searches';

export function getStoredRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function persistRecentSearch(term) {
  if (!term || !term.trim()) return getStoredRecentSearches();
  try {
    const clean = term.trim();
    const existing = getStoredRecentSearches().filter((t) => t.toLowerCase() !== clean.toLowerCase());
    const updated = [clean, ...existing].slice(0, 8);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function removeRecentSearch(term) {
  try {
    const existing = getStoredRecentSearches().filter((t) => t !== term);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(existing));
    return existing;
  } catch {
    return [];
  }
}

export function clearAllRecentSearches() {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {}
  return [];
}

export function highlightMatch(text, query) {
  if (!query || !query.trim() || !text) return text;
  const parts = query.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return text;
  const regex = new RegExp(`(${parts.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const splitText = text.split(regex);
  return splitText.map((chunk, idx) =>
    regex.test(chunk) ? (
      <mark
        key={idx}
        style={{
          backgroundColor: 'rgba(234, 179, 8, 0.32)',
          color: 'inherit',
          fontWeight: 800,
          padding: '0 2px',
          borderRadius: '3px',
        }}
      >
        {chunk}
      </mark>
    ) : (
      chunk
    )
  );
}

export const POPULAR_SEARCH_TERMS = [
  { en: 'Fortune Sunlite Oil 1L', hi: 'फॉर्च्यून तेल 1L' },
  { en: 'Amul Taaza Milk 500ml', hi: 'अमूल ताज़ा दूध' },
  { en: 'Aashirvaad Shudh Chakki Atta 5kg', hi: 'आशीर्वाद आटा 5kg' },
  { en: 'Tata Salt 1kg', hi: 'टाटा नमक 1kg' },
  { en: 'Maggi 2-Minute Noodles', hi: 'मैगी नूडल्स' },
  { en: 'Dettol Original Soap', hi: 'डेटॉल साबुन' },
];
