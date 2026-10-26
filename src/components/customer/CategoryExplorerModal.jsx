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
        iconColor="#0f172a"
        onClose={onClose}
      />
      
      {/* Search Bar */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-subtle, #e2e8f0)', backgroundColor: 'var(--bg-surface, #ffffff)' }}>
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
            padding: '12px 16px',
            borderRadius: '12px',
            border: isAllSelected
              ? '1.5px solid #0f172a'
              : '1px solid var(--border-subtle, #e2e8f0)',
            backgroundColor: isAllSelected
              ? 'var(--bg-surface-subtle, #f8fafc)'
              : 'var(--bg-surface, #ffffff)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.15s ease',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: isAllSelected ? '#0f172a' : 'var(--bg-surface-subtle, #f1f5f9)',
              color: isAllSelected ? '#ffffff' : '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={18} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.92rem',
                fontWeight: 800,
                color: isAllSelected ? '#0f172a' : 'var(--text-primary, #0f172a)',
              }}
            >
              {isHindi ? 'सभी श्रेणियां (Show All)' : 'All Categories'}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary, #64748b)', marginTop: '2px' }}>
              {isHindi ? 'सभी लोकल दुकानों के प्रोडक्ट्स देखें' : 'Browse all items across all local stores'}
            </div>
          </div>

          {isAllSelected && (
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check size={12} strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Categories List */}
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
                padding: '12px 16px',
                borderRadius: '12px',
                border: isSelected
                  ? '1.5px solid #0f172a'
                  : '1px solid var(--border-subtle, #e2e8f0)',
                backgroundColor: isSelected
                  ? 'var(--bg-surface-subtle, #f8fafc)'
                  : 'var(--bg-surface, #ffffff)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: cat.color ? cat.color + '22' : 'var(--bg-surface-subtle, #f1f5f9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  flexShrink: 0,
                }}
              >
                {cat.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
                  {isHindi ? cat.nameHi : cat.nameEn}
                </div>
                {(cat.descriptionEn || cat.descriptionHi) && (
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary, #64748b)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isHindi ? cat.descriptionHi : cat.descriptionEn}
                  </div>
                )}
              </div>

              {isSelected && (
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={12} strokeWidth={3} />
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
