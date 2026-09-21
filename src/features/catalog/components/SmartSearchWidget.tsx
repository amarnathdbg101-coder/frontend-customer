import React, { useState, useEffect } from 'react';
import { Search, Sparkles, X, History, ArrowRight } from 'lucide-react';
import { catalogService } from '../services/catalog.service';
import { STORAGE_KEYS } from '../../../config/constants';
import { storage } from '../../../shared/utils/storage';
import { formatCurrency } from '../../../shared/utils/formatters';
import { Product } from '../../../types';

interface SmartSearchWidgetProps {
  onSelectProduct: (product: Product) => void;
  onClose: () => void;
}

export function SmartSearchWidget({ onSelectProduct, onClose }: SmartSearchWidgetProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const saved = storage.get<string[]>(STORAGE_KEYS.RECENT_SEARCHES);
    if (saved && Array.isArray(saved)) {
      setRecentSearches(saved);
    }
  }, []);

  const handleSearchChange = async (text: string) => {
    setQuery(text);
    if (text.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const list = await catalogService.getProducts({ search: text, limit: 8 });
      setSuggestions(list || []);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (product: Product) => {
    const productName = product.name || (product as any).title || '';
    const updated = [productName, ...recentSearches.filter((s) => s !== productName)].slice(0, 6);
    setRecentSearches(updated);
    storage.set(STORAGE_KEYS.RECENT_SEARCHES, updated);
    onSelectProduct(product);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-16 px-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search size={20} className="text-purple-600" />
          <input
            type="text"
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none text-base font-medium"
            placeholder="Search groceries, shirts, SKU or ask AI..."
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={18} className="text-slate-400" />
            </button>
          )}
          <button onClick={onClose} className="text-sm font-bold text-purple-600 hover:underline">
            Cancel
          </button>
        </div>

        {/* AI Smart Feature Banner */}
        <div className="bg-purple-50 dark:bg-purple-950/30 px-4 py-2.5 flex items-center gap-2 border-b border-purple-100 dark:border-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold">
          <Sparkles size={14} />
          <span>AI Semantic Search &amp; Barcode Quick Match Active</span>
        </div>

        {/* Results / History Container */}
        <div className="max-h-96 overflow-y-auto p-4 flex flex-col gap-2">
          {/* Recent Searches */}
          {query.trim().length === 0 && recentSearches.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-2">
                <History size={13} />
                <span>RECENT SEARCHES</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearchChange(term)}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="py-8 text-center text-xs font-semibold text-slate-400 animate-pulse">
              Searching local store catalogs...
            </div>
          )}

          {/* Suggestions List */}
          {!isLoading &&
            suggestions.map((prod) => (
              <div
                key={prod.id}
                onClick={() => handleSelect(prod)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden font-bold text-purple-600">
                    {prod.images?.[0] || (prod as any).image_url ? (
                      <img
                        loading="lazy"
                        decoding="async"
                        src={prod.images?.[0] || (prod as any).image_url}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>🛍️</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {prod.name || (prod as any).title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      SKU: {prod.sku || 'N/A'} • Category: {prod.category || 'General'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="text-sm font-black text-emerald-600">
                    {formatCurrency(prod.price)}
                  </span>
                  <ArrowRight size={16} className="text-slate-400" />
                </div>
              </div>
            ))}

          {!isLoading && query.trim().length > 1 && suggestions.length === 0 && (
            <div className="py-12 text-center text-sm font-semibold text-slate-400">
              No products found matching "{query}". Try searching by brand or category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
