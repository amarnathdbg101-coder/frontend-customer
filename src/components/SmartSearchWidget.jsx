import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, Sparkles, X, History, ArrowRight, Barcode, Lock, CheckCircle, Tag } from "lucide-react";
import { apiClient } from "../api/client";
import { productApi } from "../api/product.api";

const HINGLISH_SUGGESTIONS = [
  { label: "दूध (Doodh)", query: "doodh" },
  { label: "तेल (Tel)", query: "tel" },
  { label: "चीनी (Cheeni)", query: "cheeni" },
  { label: "आटा (Aata)", query: "aata" },
  { label: "चावल (Chawal)", query: "rice" },
  { label: "मसाला (Masala)", query: "masala" },
  { label: "साबुन (Soap)", query: "soap" },
];

export function SmartSearchWidget({ onSelectProduct, onClose, shopId, shopName, isHindi = false }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [keywordSuggestions, setKeywordSuggestions] = useState([]);
  const [barcodeProduct, setBarcodeProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("shopme_recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // Ignore JSON parse errors
      }
    }
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const executeSearch = useCallback(async (text) => {
    const clean = text.trim();
    if (!clean) {
      setSuggestions([]);
      setKeywordSuggestions([]);
      setBarcodeProduct(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // 1. Barcode Fast-Path: 8 to 14 numeric digits
    const isBarcode = /^\d{8,14}$/.test(clean);
    if (isBarcode) {
      try {
        const found = await productApi.scanInStoreBarcode(shopId || "", clean);
        if (found) {
          setBarcodeProduct(found);
          setSuggestions([found]);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Barcode fast-path lookup error:", err);
      }
    } else {
      setBarcodeProduct(null);
    }

    // 2. Fast In-Memory Autocomplete Suggestions & Products Query
    try {
      const [wordsRes, prodsRes] = await Promise.allSettled([
        productApi.getSearchSuggestions(clean, shopId || "", 5),
        apiClient.get("/products", {
          params: {
            search: clean,
            q: clean,
            shop_id: shopId || undefined,
            limit: 8,
          },
        }),
      ]);

      const words = wordsRes.status === "fulfilled" && Array.isArray(wordsRes.value) ? wordsRes.value : [];
      setKeywordSuggestions(words);

      let prods = [];
      if (prodsRes.status === "fulfilled") {
        const data = prodsRes.value.data?.data?.products || prodsRes.value.data?.products || prodsRes.value.data?.data || prodsRes.value.data || [];
        prods = Array.isArray(data) ? data : [];
      }
      setSuggestions(prods);
    } catch (err) {
      console.warn("Smart search query error:", err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [shopId]);

  const handleSearchChange = (text) => {
    setQuery(text);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (text.trim().length === 0) {
      setSuggestions([]);
      setKeywordSuggestions([]);
      setBarcodeProduct(null);
      setIsLoading(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSearch(text);
    }, 200);
  };

  const handleSelect = (product) => {
    const title = product.name || product.title || "";
    if (title) {
      const updated = [title, ...recentSearches.filter((s) => s !== title)].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem("shopme_recent_searches", JSON.stringify(updated));
    }
    onSelectProduct(product);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-16 px-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search size={20} className="text-purple-600 flex-shrink-0" />
          <input
            type="text"
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none text-base font-medium"
            placeholder={
              shopId
                ? isHindi
                  ? `${shopName || "दुकान"} में सामान, बारकोड या Hinglish में खोजें...`
                  : `Search inside ${shopName || "store"} (type name, SKU, or barcode)...`
                : isHindi
                ? "सामान, ब्रांड, बारकोड या Hinglish में खोजें (जैसे: doodh, tel)..."
                : "Search groceries, brand, barcode or Hinglish (e.g. doodh, tel)..."
            }
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                setBarcodeProduct(null);
              }}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-sm font-bold text-purple-600 hover:text-purple-700 hover:underline flex-shrink-0"
          >
            {isHindi ? "बंद करें" : "Cancel"}
          </button>
        </div>

        {/* In-Store Isolation Status Banner */}
        {shopId ? (
          <div className="bg-blue-50 dark:bg-blue-950/40 px-4 py-2 flex items-center gap-2 border-b border-blue-100 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-bold">
            <Lock size={13} className="text-blue-600" />
            <span>
              {isHindi ? `दुकान लॉक: ${shopName || "यह स्टोर"} (केवल इसी दुकान का सामान दिखाई देगा)` : `In-Store Isolated Search: ${shopName || "This Store"} (Locked)`}
            </span>
          </div>
        ) : (
          <div className="bg-purple-50 dark:bg-purple-950/30 px-4 py-2 flex items-center justify-between border-b border-purple-100 dark:border-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold">
            <div className="flex items-center gap-2">
              <Sparkles size={13} />
              <span>AI Semantic &amp; Hinglish Trigram Search Active</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-80">
              <Barcode size={13} />
              <span>Barcode Direct Match</span>
            </div>
          </div>
        )}

        {/* Results / History Container */}
        <div className="max-h-96 overflow-y-auto p-4 flex flex-col gap-3">
          {/* Direct Barcode Match Banner */}
          {barcodeProduct && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    Instant Barcode Hit ({query})
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {barcodeProduct.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleSelect(barcodeProduct)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-sm"
              >
                {isHindi ? "चुनें" : "Select"}
              </button>
            </div>
          )}

          {/* Hinglish Keyword Fast Chips (when query is empty) */}
          {query.trim().length === 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-2">
                <Tag size={13} />
                <span>{isHindi ? "अक्सर खोजे जाने वाले सामान (HINGLISH DICTIONARY)" : "POPULAR SEARCHES (HINGLISH AUTO-EXPANSION)"}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {HINGLISH_SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(item.query);
                      executeSearch(item.query);
                    }}
                    className="bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800 transition"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Autocomplete Keyword Suggestions Chips (when typing) */}
          {query.trim().length > 0 && keywordSuggestions.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400">{isHindi ? "सुझाव:" : "Suggestions:"}</span>
              {keywordSuggestions.map((kw, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(kw);
                    executeSearch(kw);
                  }}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 text-slate-700 dark:text-slate-300 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition"
                >
                  {kw}
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {query.trim().length === 0 && recentSearches.length > 0 && (
            <div className="mt-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-2">
                <History size={13} />
                <span>{isHindi ? "हालिया खोजें" : "RECENT SEARCHES"}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(term);
                      executeSearch(term);
                    }}
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
              {isHindi ? "डेटाबेस में सामान खोजा जा रहा है..." : "Searching local store catalogs (<0.5ms Go cache)..."}
            </div>
          )}

          {/* Product Suggestions List */}
          {!isLoading &&
            suggestions.map((prod) => (
              <div
                key={prod.id}
                onClick={() => handleSelect(prod)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden font-bold text-purple-600 flex-shrink-0 border border-slate-200 dark:border-slate-700">
                    {prod.images?.[0] || prod.image_url || prod.image ? (
                      <img
                        loading="lazy"
                        decoding="async"
                        src={prod.images?.[0] || prod.image_url || prod.image}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span>🛍️</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {prod.name || prod.title}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">
                      {prod.shop_name ? `${prod.shop_name} • ` : ""}
                      {prod.sku ? `SKU: ${prod.sku} • ` : ""}
                      {prod.category || "General"}
                    </p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3 flex-shrink-0">
                  <div>
                    <span className="text-sm font-black text-emerald-600 block">
                      ₹{prod.price}
                    </span>
                    {prod.compare_price > prod.price && (
                      <span className="text-xs text-slate-400 line-through block">
                        ₹{prod.compare_price}
                      </span>
                    )}
                  </div>
                  <ArrowRight size={16} className="text-slate-400" />
                </div>
              </div>
            ))}

          {!isLoading && query.trim().length > 1 && suggestions.length === 0 && (
            <div className="py-10 text-center text-sm font-semibold text-slate-400">
              {isHindi
                ? `"${query}" के लिए कोई सामान नहीं मिला। कृपया दूसरा नाम या श्रेणी आज़माएं।`
                : `No products found matching "${query}". Try searching by category, brand, or Hinglish term.`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SmartSearchWidget;
