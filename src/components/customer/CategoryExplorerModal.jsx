/**
 * Category Explorer Modal / Bottom Sheet
 * Pixel-Perfect Match with Shopsilo Native Mobile OS (Screenshot_2026_0920_142033.jpg):
 * - Header: "Choose Category" + "44 categories available • Tap to filter products" + 'X' Close button
 * - Search bar: "🔍 Search category (e.g. Doodh, Tel, Atta, Soap..."
 * - Top card: "✨ All Categories (Show Everything)" - "View all trending products across all departments" with '✓'
 * - Single-column vertical scrollable list of 44 clean rounded category cards with icons, titles, and descriptions.
 */

import React, { useState, useMemo } from 'react';
import { Search, X, Check, Sparkles } from 'lucide-react';
import { ALL_CATEGORIES } from '../../constants/categoryData';
import { useLanguage } from '../../context/LanguageContext';

export const CategoryExplorerModal = ({
  isOpen,
  onClose,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const { isHindi } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter Categories by search term (English, Hindi, keywords)
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return ALL_CATEGORIES;
    const q = searchQuery.toLowerCase().trim();
    return ALL_CATEGORIES.filter((cat) => {
      const matchEn = cat.nameEn.toLowerCase().includes(q);
      const matchHi = (cat.nameHi || '').toLowerCase().includes(q);
      const matchDesc = (cat.descriptionEn || '').toLowerCase().includes(q) ||
        (cat.descriptionHi || '').toLowerCase().includes(q);
      const matchKeywords = Array.isArray(cat.keywords) && cat.keywords.some(k => k.includes(q));
      return matchEn || matchHi || matchDesc || matchKeywords;
    });
  }, [searchQuery]);

  if (!isOpen) return null;

  const isAllSelected = !selectedCategoryId || selectedCategoryId === 'All';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface, #ffffff)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -20px 40px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-subtle, #e2e8f0)',
          overflow: 'hidden',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* =========================================================================
            1. TOP HEADER (Title, Subtitle, Close Button)
           ========================================================================= */}
        <div
          style={{
            padding: '18px 20px 14px 20px',
            borderBottom: '1px solid var(--border-subtle, #f1f5f9)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 900,
                color: 'var(--text-primary, #0f172a)',
                letterSpacing: '-0.3px',
              }}
            >
              {isHindi ? 'कैटेगरी चुनें (Choose Category)' : 'Choose Category'}
            </h3>
            <p
              style={{
                margin: '3px 0 0 0',
                fontSize: '0.78rem',
                color: 'var(--text-secondary, #64748b)',
                fontWeight: 500,
              }}
            >
              {isHindi
                ? `${ALL_CATEGORIES.length} कैटेगरीज उपलब्ध • सामान फ़िल्टर करने के लिए टैप करें`
                : `${ALL_CATEGORIES.length} categories available • Tap to filter products`}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface-subtle, #f1f5f9)',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary, #64748b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close category explorer"
          >
            <X size={18} />
          </button>
        </div>

        {/* =========================================================================
            2. SEARCH INPUT BOX
           ========================================================================= */}
        <div style={{ padding: '12px 20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
              borderRadius: '14px',
              border: '1px solid var(--border-subtle, #cbd5e1)',
              padding: '10px 14px',
              gap: '10px',
            }}
          >
            <Search size={18} color="#6366f1" style={{ flexShrink: 0 }} />
            <input
              type="search"
              placeholder={isHindi ? 'कैटेगरी खोजें (उदा. दूध, तेल, आटा, साबुन)...' : 'Search category (e.g. Doodh, Tel, Atta, Soap)...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.86rem',
                color: 'var(--text-primary, #0f172a)',
                width: '100%',
                fontWeight: 500,
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* =========================================================================
            3. VERTICAL CATEGORY CARDS LIST
           ========================================================================= */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 20px 24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Top Option: All Categories (Show Everything) */}
          <div
            onClick={() => {
              onSelectCategory('All');
              onClose();
            }}
            style={{
              padding: '14px 16px',
              borderRadius: '16px',
              border: isAllSelected
                ? '1.5px solid rgba(99, 102, 241, 0.4)'
                : '1px solid var(--border-subtle, #e2e8f0)',
              backgroundColor: isAllSelected
                ? 'rgba(99, 102, 241, 0.08)'
                : 'var(--bg-surface, #ffffff)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: isAllSelected ? '#6366f1' : 'var(--bg-surface-subtle, #f1f5f9)',
                color: isAllSelected ? '#ffffff' : '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                flexShrink: 0,
              }}
            >
              ✨
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.94rem',
                  fontWeight: 800,
                  color: isAllSelected ? '#4f46e5' : 'var(--text-primary, #0f172a)',
                }}
              >
                {isHindi ? 'सभी कैटेगरीज (सब कुछ देखें)' : 'All Categories (Show Everything)'}
              </div>
              <div
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--text-secondary, #64748b)',
                  marginTop: '2px',
                }}
              >
                {isHindi ? 'सभी डिपार्टमेंट्स के प्रोडक्ट्स देखें' : 'View all trending products across all departments'}
              </div>
            </div>

            {isAllSelected && (
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Check size={15} strokeWidth={3} />
              </div>
            )}
          </div>

          {/* 44 Category Items */}
          {filteredCategories.map((cat) => {
            const isSelected =
              selectedCategoryId === cat.id ||
              selectedCategoryId === cat.slug ||
              selectedCategoryId === cat.nameEn ||
              selectedCategoryId === cat.nameHi;

            return (
              <div
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.nameEn);
                  onClose();
                }}
                style={{
                  padding: '12px 16px',
                  borderRadius: '16px',
                  border: isSelected
                    ? '1.5px solid rgba(99, 102, 241, 0.4)'
                    : '1px solid var(--border-subtle, #e2e8f0)',
                  backgroundColor: isSelected
                    ? 'rgba(99, 102, 241, 0.08)'
                    : 'var(--bg-surface, #ffffff)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle, #f8fafc)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-surface, #ffffff)';
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                    flexShrink: 0,
                    border: '1px solid var(--border-subtle, #f1f5f9)',
                  }}
                >
                  {cat.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      color: isSelected ? '#4f46e5' : 'var(--text-primary, #0f172a)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {isHindi ? cat.nameHi : cat.nameEn}
                  </div>
                  <div
                    style={{
                      fontSize: '0.74rem',
                      color: 'var(--text-secondary, #64748b)',
                      marginTop: '2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {isHindi ? cat.descriptionHi : cat.descriptionEn}
                  </div>
                </div>

                {isSelected && (
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#6366f1',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Check size={15} strokeWidth={3} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryExplorerModal;
