import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Check,
  Sparkles,
  Layers,
  ArrowRight,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { ALL_CATEGORIES, CATEGORY_DEPARTMENTS, getCategoryMeta } from '../../constants/categoryData';
import { useLanguage } from '../../context/LanguageContext';

export const CategoryExplorerModal = ({
  isOpen,
  onClose,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const { isHindi } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDept, setActiveDept] = useState('all');

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return ALL_CATEGORIES.filter((cat) => {
      const matchesDept = activeDept === 'all' || cat.department === activeDept;
      if (!matchesDept) return false;
      if (!term) return true;

      const nameEnMatch = cat.nameEn.toLowerCase().includes(term);
      const nameHiMatch = cat.nameHi.includes(term);
      const descMatch = (cat.descriptionEn + ' ' + cat.descriptionHi).toLowerCase().includes(term);
      const keywordMatch = cat.keywords.some((k) => k.includes(term) || term.includes(k));

      return nameEnMatch || nameHiMatch || descMatch || keywordMatch;
    });
  }, [searchTerm, activeDept]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-explorer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '24px',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--color-primary) 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              }}
            >
              <Layers size={22} />
            </div>
            <div>
              <h2
                id="category-explorer-title"
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {isHindi ? 'सभी श्रेणियां एवं विभाग' : 'Explore All Categories'}
              </h2>
              <p
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  margin: '3px 0 0 0',
                  fontWeight: 600,
                }}
              >
                {isHindi
                  ? 'अपनी पसंदीदा श्रेणी चुनें और आस-पास की दुकानों में लाइव स्टॉक खोजें'
                  : 'Select a category to discover live in-stock products and local stores'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close category modal"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '16px 24px 12px 24px', background: 'var(--bg-surface)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '10px 16px',
              transition: 'border-color 0.15s ease',
            }}
          >
            <Search size={20} color="var(--text-muted)" />
            <input
              type="text"
              placeholder={
                isHindi
                  ? 'श्रेणी खोजें (जैसे: दाल, आटा, तेल, बिस्कुट, दूध, शैम्पू, दवाएं)...'
                  : 'Search category (e.g. Rice, Dal, Milk, Biscuit, Medicine, Cables)...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '0.92rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Department Filter Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 24px 14px 24px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {CATEGORY_DEPARTMENTS.map((dept) => {
            const isDeptActive = activeDept === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => setActiveDept(dept.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: isDeptActive ? '1.5px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                  backgroundColor: isDeptActive ? 'var(--color-primary)' : 'var(--bg-surface-subtle)',
                  color: isDeptActive ? '#ffffff' : 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isDeptActive ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none',
                }}
              >
                <span>{dept.icon}</span>
                <span>{isHindi ? dept.nameHi : dept.nameEn}</span>
              </button>
            );
          })}
        </div>

        {/* Category Cards Grid */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 24px 24px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '12px',
          }}
        >
          {/* Option: View All / Clear Filter */}
          <div
            onClick={() => {
              onSelectCategory(undefined);
              onClose();
            }}
            style={{
              padding: '14px 16px',
              borderRadius: '16px',
              border: !selectedCategoryId ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
              backgroundColor: !selectedCategoryId ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface-subtle)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: !selectedCategoryId ? 'var(--color-primary)' : 'var(--border-subtle)',
                color: !selectedCategoryId ? '#ffffff' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 900,
              }}
            >
              ✨
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {isHindi ? 'सभी सामान व श्रेणियां' : 'All Products & Categories'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {isHindi ? 'पूरा हाइपरलोकल बाज़ार' : 'View full catalog without filters'}
              </div>
            </div>
            {!selectedCategoryId && (
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check size={14} strokeWidth={3} />
              </div>
            )}
          </div>

          {/* Filtered Category Items */}
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
                  onSelectCategory(cat.id);
                  onClose();
                }}
                style={{
                  padding: '14px 16px',
                  borderRadius: '16px',
                  border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-surface-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: cat.color ? cat.color + '22' : 'rgba(99, 102, 241, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    flexShrink: 0,
                  }}
                >
                  {cat.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {isHindi ? cat.nameHi : cat.nameEn}
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
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
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {selectedCategoryId && (
          <div
            style={{
              padding: '12px 24px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-surface-subtle)',
            }}
          >
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {isHindi ? 'फ़िल्टर लागू है' : 'Filter active'}:{' '}
              <strong style={{ color: 'var(--color-primary)' }}>
                {getCategoryMeta(selectedCategoryId)?.[isHindi ? 'nameHi' : 'nameEn'] || selectedCategoryId}
              </strong>
            </span>
            <button
              onClick={() => {
                onSelectCategory(undefined);
                onClose();
              }}
              className="btn btn-sm btn-secondary"
              style={{ fontWeight: 700 }}
            >
              {isHindi ? 'फ़िल्टर हटाएं (Clear)' : 'Clear Filter'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
