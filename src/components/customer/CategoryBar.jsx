import React, { useState, useEffect } from 'react';
import { Layers, Check, X } from 'lucide-react';
import { apiClient } from '../../api/client';

const getCategoryIcon = (name) => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('rice') || lower.includes('grain') || lower.includes('wheat')) return '🌾';
  if (lower.includes('pulse') || lower.includes('dal') || lower.includes('lentil')) return '🥣';
  if (lower.includes('flour') || lower.includes('atta') || lower.includes('besan')) return '🥡';
  if (lower.includes('oil') || lower.includes('ghee')) return '🫒';
  if (lower.includes('masala') || lower.includes('spice')) return '🌶️';
  if (lower.includes('sugar') || lower.includes('salt') || lower.includes('sweet')) return '🧂';
  if (lower.includes('biscuit') || lower.includes('cookie') || lower.includes('snack') || lower.includes('namkeen') || lower.includes('chip')) return '🍪';
  if (lower.includes('tea') || lower.includes('coffee')) return '☕';
  if (lower.includes('drink') || lower.includes('juice') || lower.includes('beverage')) return '🥤';
  if (lower.includes('milk') || lower.includes('curd') || lower.includes('dairy') || lower.includes('paneer') || lower.includes('butter') || lower.includes('cheese')) return '🥛';
  if (lower.includes('bread') || lower.includes('bakery') || lower.includes('bun') || lower.includes('cake')) return '🍞';
  if (lower.includes('egg')) return '🥚';
  if (lower.includes('fruit')) return '🍎';
  if (lower.includes('vegetable') || lower.includes('sabji')) return '🥦';
  if (lower.includes('meat') || lower.includes('chicken') || lower.includes('fish') || lower.includes('seafood')) return '🍗';
  if (lower.includes('soap') || lower.includes('bath') || lower.includes('clean') || lower.includes('laundry')) return '🧼';
  if (lower.includes('skin') || lower.includes('hair') || lower.includes('shampoo') || lower.includes('oral') || lower.includes('paste')) return '🧴';
  if (lower.includes('baby')) return '👶';
  if (lower.includes('puja') || lower.includes('religious')) return '🪔';
  if (lower.includes('stationery') || lower.includes('book') || lower.includes('pen')) return '📚';
  if (lower.includes('toy') || lower.includes('game')) return '🧸';
  if (lower.includes('cloth') || lower.includes('fashion') || lower.includes('wear') || lower.includes('footwear')) return '👕';
  if (lower.includes('electronic') || lower.includes('mobile') || lower.includes('hardware') || lower.includes('electrical')) return '⚡';
  if (lower.includes('pharmacy') || lower.includes('medicine') || lower.includes('vitamin') || lower.includes('supplement')) return '💊';
  if (lower.includes('grocery') || lower.includes('kirana') || lower.includes('general')) return '🛒';
  return '🏷️';
};

export function CategoryBar({ selectedCategoryId, onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/categories');
      const raw = res.data?.data || res.data || [];
      setCategories(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.warn('[CategoryBar] Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeCategory = categories.find(
    (c) => c.id === selectedCategoryId || c.slug === selectedCategoryId || c.name === selectedCategoryId
  );

  return (
    <div className="mb-4">
      {/* Horizontal Scrollable Category Pills */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        role="toolbar"
        aria-label="Category filter"
      >
        {/* All Pill */}
        <button
          type="button"
          onClick={() => onSelectCategory(undefined)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-bold whitespace-nowrap transition shadow-sm ${
            !selectedCategoryId
              ? 'bg-purple-600 text-white border-purple-600 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-purple-400'
          }`}
        >
          <Layers size={14} />
          <span>All</span>
        </button>

        {/* Dynamic Category Pills */}
        {!loading && categories.map((cat) => {
          const catKey = cat.id || cat.slug || cat.name;
          const isSelected = selectedCategoryId === catKey || selectedCategoryId === cat.id || selectedCategoryId === cat.slug || selectedCategoryId === cat.name;
          const icon = getCategoryIcon(cat.name);

          return (
            <button
              key={catKey}
              type="button"
              onClick={() => onSelectCategory(isSelected ? undefined : catKey)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-bold whitespace-nowrap transition shadow-sm ${
                isSelected
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-purple-400'
              }`}
            >
              <span className="text-sm">{icon}</span>
              <span>{cat.name}</span>
              {isSelected && <Check size={12} strokeWidth={3} className="ml-0.5" />}
            </button>
          );
        })}
      </div>

      {/* Active Filter Banner */}
      {activeCategory && (
        <div className="mt-2 flex items-center justify-between bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>
            Showing: <strong className="text-purple-700 dark:text-purple-300 font-extrabold">{activeCategory.name}</strong>
          </span>
          <button
            type="button"
            onClick={() => onSelectCategory(undefined)}
            className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/60 hover:bg-purple-200 text-purple-700 dark:text-purple-200 px-2.5 py-1 rounded-lg text-xs font-bold transition"
          >
            <X size={12} />
            <span>Clear Filter</span>
          </button>
        </div>
      )}
    </div>
  );
}
