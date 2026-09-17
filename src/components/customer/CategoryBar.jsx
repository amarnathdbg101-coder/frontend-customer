import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  X,
  Check,
  Sparkles,
} from 'lucide-react';
import { ALL_CATEGORIES, CATEGORY_DEPARTMENTS, getCategoryMeta } from '../../constants/categoryData';
import { CategoryExplorerModal } from './CategoryExplorerModal';
import { useLanguage } from '../../context/LanguageContext';

export function CategoryBar({ selectedCategoryId, onSelectCategory }) {
  const { isHindi } = useLanguage();
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [activeDepartment, setActiveDepartment] = useState('all');
  const scrollContainerRef = useRef(null);

  const activeMeta = selectedCategoryId ? getCategoryMeta(selectedCategoryId) : null;

  // Filter categories shown in quick horizontal carousel
  const railCategories = React.useMemo(() => {
    if (activeDepartment === 'all') {
      return ALL_CATEGORIES;
    }
    return ALL_CATEGORIES.filter((c) => c.department === activeDepartment);
  }, [activeDepartment]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ marginBottom: '18px' }}>
      {/* 1. Header with Title and "View All Categories" Modal Trigger */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {isHindi ? 'श्रेणियां (Categories)' : 'Explore by Category'}
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              backgroundColor: 'rgba(79, 70, 229, 0.12)',
              color: 'var(--color-primary)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            {ALL_CATEGORIES.length}+
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExplorerOpen(true)}
          className="btn btn-sm btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 800,
            padding: '5px 12px',
            color: 'var(--color-primary)',
            borderColor: 'rgba(79, 70, 229, 0.3)',
          }}
          title={isHindi ? 'सभी 40+ श्रेणियां देखें' : 'View all 40+ categories'}
        >
          <LayoutGrid size={14} />
          <span>{isHindi ? 'सभी श्रेणियां देखें' : 'View All'}</span>
        </button>
      </div>

      {/* 2. Department Quick Switcher Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          paddingBottom: '8px',
        }}
      >
        {CATEGORY_DEPARTMENTS.slice(0, 7).map((dept) => {
          const isActive = activeDepartment === dept.id;
          return (
            <button
              key={dept.id}
              onClick={() => setActiveDepartment(dept.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                backgroundColor: isActive ? 'rgba(79, 70, 229, 0.12)' : 'var(--bg-surface-subtle)',
                color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontSize: '0.74rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{dept.icon}</span>
              <span>{isHindi ? dept.nameHi : dept.nameEn}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Horizontal Visual Category Rail with Desktop Left/Right Controls */}
      <div style={{ position: 'relative', marginTop: '2px' }}>
        {/* Desktop Left Scroll Button */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          style={{
            position: 'absolute',
            left: '2px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            color: 'var(--text-primary)',
          }}
          className="desktop-only-btn"
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Carousel Scroll Container */}
        <div
          ref={scrollContainerRef}
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: '10px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            padding: '4px 2px 8px 2px',
          }}
        >
          {/* "All" Card */}
          <button
            type="button"
            onClick={() => onSelectCategory(undefined)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '82px',
              maxWidth: '82px',
              padding: '10px 6px',
              borderRadius: '16px',
              border: !selectedCategoryId ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
              backgroundColor: !selectedCategoryId ? 'rgba(79, 70, 229, 0.1)' : 'var(--bg-surface)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'center',
              boxShadow: !selectedCategoryId ? '0 4px 14px rgba(79, 70, 229, 0.25)' : 'none',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: !selectedCategoryId
                  ? 'linear-gradient(135deg, var(--color-primary) 0%, #8b5cf6 100%)'
                  : 'var(--bg-surface-subtle)',
                color: !selectedCategoryId ? '#ffffff' : 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                marginBottom: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              ✨
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: !selectedCategoryId ? 'var(--color-primary)' : 'var(--text-primary)',
                lineHeight: 1.15,
              }}
            >
              {isHindi ? 'सभी' : 'All'}
            </span>
          </button>

          {/* Dynamic Category Cards */}
          {railCategories.map((cat) => {
            const isSelected =
              selectedCategoryId === cat.id ||
              selectedCategoryId === cat.slug ||
              selectedCategoryId === cat.nameEn ||
              selectedCategoryId === cat.nameHi;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(isSelected ? undefined : cat.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '86px',
                  maxWidth: '86px',
                  padding: '10px 6px',
                  borderRadius: '16px',
                  border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.1)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'center',
                  position: 'relative',
                  boxShadow: isSelected ? '0 4px 14px rgba(79, 70, 229, 0.25)' : 'none',
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: cat.color ? cat.color + '22' : 'rgba(99, 102, 241, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    marginBottom: '6px',
                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid transparent',
                  }}
                >
                  {cat.icon}
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)',
                    lineHeight: 1.15,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {isHindi ? cat.nameHi : cat.nameEn}
                </span>

                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={10} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Desktop Right Scroll Button */}
        <button
          type="button"
          onClick={() => handleScroll('right')}
          style={{
            position: 'absolute',
            right: '2px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            color: 'var(--text-primary)',
          }}
          className="desktop-only-btn"
          aria-label="Scroll right"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 4. Active Category Filter Banner */}
      {activeMeta && (
        <div
          style={{
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
            border: '1px solid rgba(79, 70, 229, 0.25)',
            borderRadius: '14px',
            padding: '8px 14px',
            fontSize: '0.8rem',
            color: 'var(--text-primary)',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>{activeMeta.icon}</span>
            <span>
              {isHindi ? 'दिखा रहे हैं' : 'Filtered by'}:{' '}
              <strong style={{ color: 'var(--color-primary)', fontWeight: 800 }}>
                {isHindi ? activeMeta.nameHi : activeMeta.nameEn}
              </strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSelectCategory(undefined)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: 'none',
              backgroundColor: 'rgba(79, 70, 229, 0.15)',
              color: 'var(--color-primary)',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <X size={13} />
            <span>{isHindi ? 'फ़िल्टर हटाएं' : 'Clear'}</span>
          </button>
        </div>
      )}

      {/* 5. Full Searchable Category Explorer Modal */}
      <CategoryExplorerModal
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={onSelectCategory}
      />
    </div>
  );
}
