import React, { useState, useMemo } from 'react';
import { Check, Sparkles, Folder } from 'lucide-react';
import { ALL_CATEGORIES } from '../../constants/categoryData';
import { useLanguage } from '../../context/LanguageContext';
import { BaseModal, ModalHeader, ModalBody, SearchInput } from '../ui';

export const CategoryExplorerModal = ({
  isOpen,
  onClose,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const { isHindi } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

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
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="560px" maxHeight="88vh">
      <ModalHeader
        title={isHindi ? 'कैटेगरी चुनें' : 'Choose Category'}
        subtitle={isHindi ? '44 कैटेगरीज उपलब्ध • फ़िल्टर करने के लिए टैप करें' : '44 categories available • Tap to filter products'}
        icon={Folder}
        onClose={onClose}
      />
      
      {/* Search Bar */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-subtle, #e2e8f0)', backgroundColor: 'var(--bg-surface)' }}>
        <SearchInput
          placeholder={isHindi ? 'कैटेगरी खोजें (उदा. दूध, तेल, आटा, साबुन...)' : 'Search category (e.g. Milk, Oil, Atta, Soap...)'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          autoFocus={false}
        />
      </div>

      {/* Category List */}
      <ModalBody padding="16px 20px" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
      </ModalBody>
    </BaseModal>
  );
};

export default CategoryExplorerModal;
