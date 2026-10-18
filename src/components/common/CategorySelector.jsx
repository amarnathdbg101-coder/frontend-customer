import React, { useState, useEffect, useCallback } from 'react';
import { Search, Check, Layers, ChevronDown } from 'lucide-react';
import { apiClient } from '../../api/client';
import { BaseModal, ModalHeader, ModalBody } from '../ui';

export function CategorySelector({ selectedCategoryId, onSelectCategory, placeholder = "Filter by category..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/categories');
      const raw = res.data?.data || res.data || [];
      setCategories(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.warn('[CategorySelector] Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId || c.slug === selectedCategoryId);
  const filteredCategories = categories.filter((c) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.slug || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium shadow-sm hover:border-purple-500 transition"
      >
        <div className="flex items-center gap-2.5 truncate">
          <Layers size={16} className="text-purple-600 flex-shrink-0" />
          <span className="truncate">{selectedCategory ? selectedCategory.name : placeholder}</span>
        </div>
        <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
      </button>

      <BaseModal isOpen={isOpen} onClose={() => setIsOpen(false)} maxWidth="512px">
        <ModalHeader title="Filter by Category" onClose={() => setIsOpen(false)} />
        <ModalBody padding="0">

            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 gap-2">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  className="flex-1 bg-transparent text-sm outline-none text-slate-900 dark:text-white placeholder-slate-400"
                  placeholder="Search categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto p-4 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onSelectCategory(undefined);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm font-semibold transition ${
                  !selectedCategoryId ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span>All Categories</span>
                {!selectedCategoryId && <Check size={16} />}
              </button>

              {loading ? (
                <div className="py-12 text-center text-xs font-semibold text-slate-400">Loading categories...</div>
              ) : filteredCategories.length === 0 ? (
                <div className="py-12 text-center text-xs font-semibold text-slate-400">No categories found matching "{search}".</div>
              ) : (
                filteredCategories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id || selectedCategoryId === cat.slug;
                  return (
                    <button
                      key={cat.id || cat.slug}
                      type="button"
                      onClick={() => {
                        onSelectCategory(cat.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm font-semibold transition ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {isSelected && <Check size={16} />}
                    </button>
                  );
                })
              )}
            </div>
        </ModalBody>
      </BaseModal>
    </div>
  );
}
