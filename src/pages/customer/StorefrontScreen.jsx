import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Store,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Package,
  Sparkles,
  ChevronRight,
  Filter,
  Share2,
  Info,
  PhoneCall,
  Compass,
  RefreshCw,
  Tag,
  Mic,
  MicOff,
  LayoutGrid,
} from 'lucide-react';
import { shopApi } from '../../api/shop.api';
import { productApi } from '../../api/product.api';
import { dealsApi } from '../../api/deals.api';
import { reservationApi } from '../../api/reservation.api';
import { useAuth } from '../../context/AuthContext';
import { useSaved } from '../../context/SavedContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation } from '../../context/LocationContext';
import { ProductCard } from '../../components/cards/ProductCard';
import { ProductDetailModal } from '../../components/common/ProductDetailModal';
import { ShopDetailModal } from '../../components/common/ShopDetailModal';
import { ShopReviewsSection } from '../../components/customer/ShopReviewsSection';
import { CuratedStoreAisles } from '../../components/customer/CuratedStoreAisles';
import { CuratedShelfDetailView } from '../../components/customer/CuratedShelfDetailView';
import { AppLayout } from '../../components/layout/AppLayout';
import { localCache, CACHE_KEYS, DEFAULT_TTL } from '../../utils/localCache';
import { cacheEvents, CACHE_EVENTS } from '../../utils/cacheEvents';
import { calculateDistanceKm, formatTravelTime, getDirectionsUrl } from '../../utils/distance';
import { isProductInCategory } from '../../utils/categoryMatcher';
import { getImageUrl } from '../../utils/imageUrl';
import { useRealtimeStorefront } from '../../hooks/useRealtimeStorefront';
import { BaseModal, ModalHeader, ModalBody, SearchInput, Button, LoadingSpinner, EmptyState, OverflowMenu } from '../../components/ui';
import { SearchSuggestionsDropdown } from '../../components/customer/SearchSuggestionsDropdown';
import { DidYouMeanBanner } from '../../components/customer/DidYouMeanBanner';
import { ZeroDeadEndSearchState } from '../../components/customer/ZeroDeadEndSearchState';
import {
  getStoredRecentSearches,
  persistRecentSearch,
  removeRecentSearch,
  clearAllRecentSearches,
} from '../../utils/searchHelpers';

const PAGE_LIMIT = 20;

// Custom debounce hook for fast reactivity
function useDebounce(value, delay = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Safe helper to extract an array from varied API response shapes
const extractArray = (res, key) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res[key])) return res[key];
  if (res.data && Array.isArray(res.data[key])) return res.data[key];
  if (res.data && Array.isArray(res.data)) return res.data;
  if (res.data && res.data.data && Array.isArray(res.data.data[key])) return res.data.data[key];
  return [];
};

export const StorefrontScreen = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isProductSaved, toggleSaveProduct } = useSaved();
  const { t, isHindi } = useLanguage();
  const { coords } = useLocation();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [quickFilter, setQuickFilter] = useState('ALL');
  const [inspectedProduct, setInspectedProduct] = useState(null);
  const [reservationSuccess, setReservationSuccess] = useState(null);
  const [showShopDetailModal, setShowShopDetailModal] = useState(false);
  const [sortBy, setSortBy] = useState('relevant');
  const [serverSearchResults, setServerSearchResults] = useState(null);
  const [isSearchingServer, setIsSearchingServer] = useState(false);

  // Live Storefront Offers States
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [copiedPromo, setCopiedPromo] = useState('');

  // Infinite Scroll & Pagination States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalProductCount, setTotalProductCount] = useState(0);

  const debouncedSearch = useDebounce(searchTerm, 250);

  // Curated Aisles Discovery Mode vs All Products Grid Mode
  const [browseMode, setBrowseMode] = useState('aisles'); // 'aisles' | 'grid'
  const [activeShelf, setActiveShelf] = useState(null); // When user clicks "View All" on any shelf
  const [isListening, setIsListening] = useState(false);

  // Autocomplete Suggestions & Recent Searches States (Storefront Scoped)
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(getStoredRecentSearches);

  // Fast in-store autocomplete suggestions (supports single-character input, scoped to this store's catalog)
  useEffect(() => {
    const clean = searchTerm.trim();
    if (clean.length < 1) {
      setSearchSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    let active = true;
    setIsLoadingSuggestions(true);
    const timer = setTimeout(async () => {
      try {
        const list = await productApi.getSearchSuggestions(clean, shop?.id || '', 6);
        if (active) {
          setSearchSuggestions(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        if (active) setSearchSuggestions([]);
      } finally {
        if (active) setIsLoadingSuggestions(false);
      }
    }, 150);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchTerm, shop?.id]);

  // 1-Tap Voice Search for Storefront
  const handleVoiceSearch = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isHindi ? 'इस ब्राउज़र में वॉइस सर्च समर्थित नहीं है। कृपया टाइप करके खोजें।' : 'Voice search is not supported in this browser. Please type.');
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isHindi ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript || '';
        if (transcript) {
          setSearchTerm(transcript);
          setBrowseMode('grid');
        }
      };

      recognition.start();
    } catch (e) {
      console.warn('Voice search error:', e);
      setIsListening(false);
    }
  }, [isHindi, isListening]);

  // Fetch Live Day-Wise Offers for Storefront
  const fetchOffers = useCallback(async () => {
    if (!slug) return;
    try {
      setLoadingOffers(true);
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDay = days[new Date().getDay()];
      // 1. Try day-specific offers for today first
      let res = await dealsApi.getShopOffers(slug, currentDay);
      let list = extractArray(res, 'offers');

      // 2. If no offers specifically scheduled for today, fetch all active offers for this store
      if (!list || list.length === 0) {
        res = await dealsApi.getShopOffers(slug);
        list = extractArray(res, 'offers');
      }
      setOffers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('[StorefrontScreen] Failed to fetch offers:', err);
      // Resilient fallback without day filter
      try {
        const res = await dealsApi.getShopOffers(slug);
        const list = extractArray(res, 'offers');
        setOffers(Array.isArray(list) ? list : []);
      } catch (_) {}
    } finally {
      setLoadingOffers(false);
    }
  }, [slug]);

  // Live Storefront Real-Time Synchronization Engine (<15ms WebSocket push)
  useRealtimeStorefront(slug, {
    onProductMutated: (payload) => {
      const prodId = payload.id || payload.product_id;
      if (!prodId) return;
      setProducts((prev) => {
        const idx = prev.findIndex((p) => (p.id || p.product_id) === prodId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...payload };
          return next;
        }
        return [payload, ...prev];
      });
    },
    onStockChanged: (payload) => {
      const prodId = payload.product_id || payload.id;
      const newStock = Number(payload.stock ?? 0);
      if (!prodId) return;
      setProducts((prev) =>
        prev.map((p) =>
          (p.id || p.product_id) === prodId
            ? { ...p, stock_quantity: newStock, available_quantity: newStock }
            : p
        )
      );
    },
    onShopStatusChanged: (payload) => {
      setShop((prev) => (prev ? { ...prev, ...payload } : prev));
    },
    onOfferMutated: () => {
      fetchOffers();
    },
  });

  // 1. Initial Load & Dynamic Database Search/Filter for Storefront
  const loadShopAndProducts = useCallback(async () => {
    const cleanSearch = debouncedSearch.trim() || undefined;
    const isCatActive = selectedCategory !== 'ALL' && selectedCategory !== 'All';
    const categoryParam = isCatActive ? selectedCategory : undefined;
    const sortParam = sortBy !== 'relevant' ? sortBy : undefined;
    const minPrice = (quickFilter === 'UNDER_99' || quickFilter === 'UNDER_499') ? 0 : undefined;
    const maxPrice = quickFilter === 'UNDER_99' ? 99 : quickFilter === 'UNDER_499' ? 499 : undefined;

    const hasActiveFilters = cleanSearch || isCatActive || quickFilter !== 'ALL' || sortParam;

    const cachedShop = localCache.get(CACHE_KEYS.STOREFRONT(slug));
    const cachedProds = !hasActiveFilters ? localCache.get(CACHE_KEYS.STOREFRONT_PRODUCTS(slug)) : null;

    let hasLocalData = false;
    if (cachedShop) {
      setShop(cachedShop);
      hasLocalData = true;
    }
    if (cachedProds && Array.isArray(cachedProds) && cachedProds.length > 0) {
      setProducts(cachedProds);
      hasLocalData = true;
    }

    if (hasLocalData) {
      setLoading(false);
    } else {
      setLoading(true);
    }

    setPage(1);
    setHasMore(true);

    try {
      const [shopData, prodData] = await Promise.all([
        shopApi.getShopBySlug(slug),
        productApi.listByShopSlug(slug, {
          page: 1,
          limit: PAGE_LIMIT,
          search: cleanSearch,
          q: cleanSearch,
          category: categoryParam,
          sort_by: sortParam,
          min_price: minPrice,
          max_price: maxPrice,
        }),
      ]);

      const realShop = (shopData && shopData.data && (shopData.data.name || shopData.data.id))
        ? shopData.data
        : (shopData && (shopData.name || shopData.id) ? shopData : null);

      if (realShop) {
        setShop(realShop);
        localCache.set(CACHE_KEYS.STOREFRONT(slug), realShop, DEFAULT_TTL.STOREFRONT);
      }

      const rawProdList = extractArray(prodData, 'products');
      const totalPages = prodData?.total_pages || prodData?.data?.total_pages || 1;
      const totalCount = prodData?.total_count || prodData?.data?.total_count || rawProdList.length;

      setTotalProductCount(totalCount);

      if (rawProdList.length < PAGE_LIMIT || totalPages <= 1) {
        setHasMore(false);
      }

      const normalizedProds = rawProdList.map((p) => {
        const qty = Number(
          p.available_quantity ??
          p.stock_quantity ??
          p.inventory?.available_quantity ??
          p.inventory?.quantity ??
          p.stock ??
          0
        );
        return {
          ...p,
          id: p.id || p.product_id,
          stock_quantity: qty,
          available_quantity: qty,
        };
      });

      setProducts(normalizedProds);
      if (!hasActiveFilters) {
        localCache.set(CACHE_KEYS.STOREFRONT_PRODUCTS(slug), normalizedProds, DEFAULT_TTL.PRODUCTS);
      }
    } catch (err) {
      console.error('Failed to load shop storefront:', err);
    } finally {
      setLoading(false);
    }
  }, [slug, selectedCategory, quickFilter, sortBy, debouncedSearch]);

  useEffect(() => {
    if (slug) {
      loadShopAndProducts();
      fetchOffers();

      const unsub = cacheEvents.on(CACHE_EVENTS.STOREFRONT_MUTATED, (payload) => {
        if (!payload || !payload.slug || payload.slug === slug) {
          loadShopAndProducts();
        }
      });

      const unsubOffer = cacheEvents.on('OFFER_MUTATED', (payload) => {
        if (!payload || !payload.slug || payload.slug === slug) {
          fetchOffers();
        }
      });

      return () => {
        unsub();
        unsubOffer();
      };
    }
  }, [slug, loadShopAndProducts, fetchOffers]);

  // 2. Infinite Scroll: Fetch Next Page of Filtered Products for this Shop from Database
  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    const cleanSearch = debouncedSearch.trim() || undefined;
    const isCatActive = selectedCategory !== 'ALL' && selectedCategory !== 'All';
    const categoryParam = isCatActive ? selectedCategory : undefined;
    const sortParam = sortBy !== 'relevant' ? sortBy : undefined;
    const minPrice = (quickFilter === 'UNDER_99' || quickFilter === 'UNDER_499') ? 0 : undefined;
    const maxPrice = quickFilter === 'UNDER_99' ? 99 : quickFilter === 'UNDER_499' ? 499 : undefined;

    try {
      const res = await productApi.listByShopSlug(slug, {
        page: nextPage,
        limit: PAGE_LIMIT,
        search: cleanSearch,
        q: cleanSearch,
        category: categoryParam,
        sort_by: sortParam,
        min_price: minPrice,
        max_price: maxPrice,
      });

      const rawProdList = extractArray(res, 'products');
      const totalPages = res?.total_pages || res?.data?.total_pages || 1;
      const totalCount = res?.total_count || res?.data?.total_count || 0;

      if (totalCount > 0) {
        setTotalProductCount(totalCount);
      }

      if (rawProdList.length === 0 || nextPage >= totalPages || rawProdList.length < PAGE_LIMIT) {
        setHasMore(false);
      }

      if (rawProdList.length > 0) {
        const normalizedProds = rawProdList.map((p) => {
          const qty = Number(
            p.available_quantity ??
            p.stock_quantity ??
            p.inventory?.available_quantity ??
            p.inventory?.quantity ??
            p.stock ??
            0
          );
          return {
            ...p,
            id: p.id || p.product_id,
            stock_quantity: qty,
            available_quantity: qty,
          };
        });

        setProducts((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const newItems = normalizedProds.filter((item) => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Failed to load more shop products:', err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, loading, page, slug, selectedCategory, quickFilter, sortBy, debouncedSearch]);

  // Window scroll listener for automatic infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || loadingMore || loading) return;

      const scrollY = window.scrollY || window.pageYOffset;
      const visibleHeight = window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight;

      if (visibleHeight + scrollY >= totalHeight - 350) {
        loadMoreProducts();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, loading, loadMoreProducts]);

  // 3. Category Filter Chips (Dynamic clean extraction from products)
  const availableCategories = useMemo(() => {
    const cats = new Set();
    products.forEach((p) => {
      let c = p.category_name || p.attributes?.category_name || p.attributes?.category || p.category?.name;
      if (!c && typeof p.category === 'string') {
        c = p.category;
      }
      if (c && typeof c === 'string') {
        const trimmed = c.trim();
        // Skip raw 36-char hexadecimal UUID strings
        if (trimmed.length === 36 && trimmed.split('-').length === 5) {
          return;
        }
        if (trimmed.length > 0) {
          cats.add(trimmed);
        }
      }
    });
    return Array.from(cats);
  }, [products]);

  // 3b. Quick Price & Deal Filter Counts
  const quickFilterCounts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    let under99 = 0;
    let under499 = 0;
    let deals20 = 0;
    let bargain = 0;

    list.forEach((p) => {
      const isPublic = p.is_price_public !== false && 
                       p.isPricePublic !== false && 
                       p.attributes?.is_price_public !== false && 
                       p.attributes?.is_price_public !== 'false' && 
                       Number(p.price || 0) > 0 &&
                       !p.hide_price;
      const price = Number(p.price || 0);
      const mrp = Number(p.compare_price || p.mrp || 0);
      const pct = isPublic && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
      const allowBargain = p.allow_bargain === true || p.attributes?.allow_bargain === true;

      if (isPublic && price <= 99) under99++;
      if (isPublic && price <= 499) under499++;
      if (isPublic && pct >= 20) deals20++;
      if (!isPublic || allowBargain) bargain++;
    });

    return { under99, under499, deals20, bargain };
  }, [products]);

  // 3a. Hybrid Debounced Server Database Search & Filter (bypasses 20-item local limit & queries PostgreSQL)
  useEffect(() => {
    const cleanSearch = searchTerm.trim();
    const isCatActive = selectedCategory !== 'ALL' && selectedCategory !== 'All';
    const isFilterActive = quickFilter !== 'ALL';
    const isSortActive = sortBy !== 'relevant';

    if (!cleanSearch && !isCatActive && !isFilterActive && !isSortActive) {
      setServerSearchResults(null);
      setIsSearchingServer(false);
      return;
    }

    setIsSearchingServer(true);
    let active = true;

    const timer = setTimeout(async () => {
      try {
        const queryParams = {
          search: cleanSearch || undefined,
          q: cleanSearch || undefined,
          category: isCatActive ? selectedCategory : undefined,
          sort_by: isSortActive ? sortBy : undefined,
          min_price: (quickFilter === 'UNDER_99' || quickFilter === 'UNDER_499') ? 0 : undefined,
          max_price: quickFilter === 'UNDER_99' ? 99 : quickFilter === 'UNDER_499' ? 499 : undefined,
          page: 1,
          limit: 50,
        };

        const res = await productApi.listByShopSlug(slug, queryParams);
        if (!active) return;

        const rawList = extractArray(res, 'products');
        const normalized = rawList.map((p) => {
          const qty = Number(
            p.available_quantity ??
            p.stock_quantity ??
            p.inventory?.available_quantity ??
            p.inventory?.quantity ??
            p.stock ??
            0
          );
          return {
            ...p,
            id: p.id || p.product_id,
            stock: qty,
            stock_quantity: qty,
            available_quantity: qty,
            isOutOfStock: qty <= 0,
            isLowStock: qty > 0 && qty <= (p.low_stock_threshold || 10),
          };
        });
        setServerSearchResults(normalized);
        if (cleanSearch) {
          setRecentSearches(persistRecentSearch(cleanSearch));
        }
      } catch (err) {
        console.warn('Server database search & filter error:', err);
      } finally {
        if (active) setIsSearchingServer(false);
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchTerm, selectedCategory, quickFilter, sortBy, slug]);

  // 4. In-Store Product Search, Filtering and Sorting
  const filteredProducts = useMemo(() => {
    const cleanSearch = searchTerm.trim();
    const isSearching = Boolean(cleanSearch);
    const hasServerResults = Array.isArray(serverSearchResults);
    const hasActiveFilter = isSearching || selectedCategory !== 'ALL' || quickFilter !== 'ALL' || sortBy !== 'relevant';

    const baseSource = (hasActiveFilter && hasServerResults)
      ? serverSearchResults
      : (Array.isArray(products) ? products : []);

    const list = baseSource.filter((p) => {
      // Category Filter (Zero dead-end: keep category filter if it has matches, else preserve matching products)
      if (selectedCategory !== 'ALL' && selectedCategory !== 'All') {
        const hasCategoryMatches = baseSource.some((item) => isProductInCategory(item, selectedCategory));
        if (hasCategoryMatches && !isProductInCategory(p, selectedCategory)) return false;
      }

      // Quick Filter (Price & Deals)
      const isPublic = p.is_price_public !== false && 
                       p.isPricePublic !== false && 
                       p.attributes?.is_price_public !== false && 
                       p.attributes?.is_price_public !== 'false' && 
                       Number(p.price || 0) > 0 &&
                       !p.hide_price;
      const price = Number(p.price || 0);
      const mrp = Number(p.compare_price || p.mrp || 0);
      const pct = isPublic && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
      const allowBargain = p.allow_bargain === true || p.attributes?.allow_bargain === true;

      if (quickFilter === 'UNDER_99') {
        if (!isPublic || price > 99) return false;
      } else if (quickFilter === 'UNDER_499') {
        if (!isPublic || price > 499) return false;
      } else if (quickFilter === 'DEALS_20') {
        if (!isPublic || pct < 20) return false;
      } else if (quickFilter === 'BARGAIN') {
        if (isPublic && !allowBargain) return false;
      }

      // Search Filter: Only do substring check if server results are not loaded yet
      if (isSearching && !hasServerResults) {
        const q = cleanSearch.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchBrand = (p.attributes?.brand || p.brand || '').toLowerCase().includes(q);
        const matchCat = (p.category_name || p.category || '').toLowerCase().includes(q);
        return matchName || matchBrand || matchCat;
      }

      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'price_low') {
        return (Number(a.price) || 0) - (Number(b.price) || 0);
      }
      if (sortBy === 'price_high') {
        return (Number(b.price) || 0) - (Number(a.price) || 0);
      }
      if (sortBy === 'discount') {
        const mrpA = Number(a.compare_price || a.mrp || 0);
        const mrpB = Number(b.compare_price || b.mrp || 0);
        const priceA = Number(a.price || 0);
        const priceB = Number(b.price || 0);
        const pctA = mrpA > priceA && mrpA > 0 ? ((mrpA - priceA) / mrpA) * 100 : 0;
        const pctB = mrpB > priceB && mrpB > 0 ? ((mrpB - priceB) / mrpB) * 100 : 0;
        return pctB - pctA;
      }
      return 0;
    });
  }, [products, serverSearchResults, searchTerm, selectedCategory, quickFilter, sortBy]);

  // Calculate typo/spell correction suggestion
  const spellCorrection = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (q.length < 3) return null;

    const hasDirectMatch = filteredProducts.some((p) => (p.name || '').toLowerCase().includes(q));
    if (hasDirectMatch) return null;

    if (searchSuggestions.length > 0 && searchSuggestions[0].toLowerCase() !== q) {
      return searchSuggestions[0];
    }
    if (filteredProducts.length > 0 && filteredProducts[0].name.toLowerCase() !== q) {
      return filteredProducts[0].name;
    }
    return null;
  }, [searchTerm, filteredProducts, searchSuggestions]);

  // Reservation handler
  const handleReserveFromModal = async ({ product, quantity, hold_hours, notes }) => {
    if (!isAuthenticated) {
      alert(t('auth.login_required_reserve'));
      navigate('/login');
      return;
    }

    try {
      const res = await reservationApi.createReservation({
        product_id: product.id,
        shop_id: shop?.id || product.shop_id || product.shopId || product.shop?.id || '',
        quantity,
        hold_hours,
        notes,
      });
      cacheEvents.emit(CACHE_EVENTS.RESERVATIONS_MUTATED);
      setReservationSuccess(res);
      setInspectedProduct(null);
    } catch (err) {
      alert(err.message || t('common.error'));
    }
  };

  const isShopOpen = Boolean(shop?.is_currently_open ?? shop?.is_open ?? shop?.is_active ?? true);
  const distKm = shop?.latitude && shop?.longitude
    ? calculateDistanceKm(coords?.lat, coords?.lng, shop.latitude, shop.longitude)
    : null;
  const travelInfo = distKm !== null ? formatTravelTime(distKm, isHindi) : null;
  const storefrontMenuItems = useMemo(() => {
    if (!shop) return [];
    return [
      {
        id: 'share',
        label: isHindi ? 'दुकान लिंक शेयर करें' : 'Share Store Link',
        icon: <Share2 size={16} color="var(--color-primary, #2563eb)" />,
        onClick: () => {
          const url = window.location.href;
          if (navigator.share) {
            navigator.share({ title: shop.name, url }).catch(() => {});
          } else if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            alert(isHindi ? 'दुकान का लिंक कॉपी हो गया!' : 'Store link copied to clipboard!');
          }
        },
      },
      {
        id: 'info',
        label: isHindi ? 'दुकान की जानकारी व समय' : 'Store Info & Timings',
        icon: <Info size={16} color="#0284c7" />,
        onClick: () => setShowShopDetailModal(true),
      },
      ...(shop.phone
        ? [
            {
              id: 'call',
              label: isHindi ? 'दुकानदार को कॉल करें' : 'Call Store',
              icon: <PhoneCall size={16} color="#16a34a" />,
              onClick: () => {
                window.location.href = `tel:${shop.phone}`;
              },
            },
          ]
        : []),
      ...(shop.latitude && shop.longitude
        ? [
            {
              id: 'directions',
              label: isHindi ? 'गूगल मैप्स पर रास्ता देखें' : 'Get Directions (Maps)',
              icon: <Compass size={16} color="#ea580c" />,
              onClick: () => {
                const url = getDirectionsUrl(shop.latitude, shop.longitude, shop.name);
                window.open(url, '_blank', 'noopener,noreferrer');
              },
            },
          ]
        : []),
      { separator: true },
      {
        id: 'refresh',
        label: isHindi ? 'कैटलॉग रिफ्रेश करें' : 'Refresh Catalog',
        icon: <RefreshCw size={16} color="var(--text-secondary, #64748b)" />,
        onClick: () => {
          localCache.remove(CACHE_KEYS.STOREFRONT_PRODUCTS(slug));
          loadShopAndProducts();
        },
      },
    ];
  }, [shop, isHindi, slug, loadShopAndProducts]);

  return (
    <AppLayout
      title={shop?.name || t('nav.explore')}
      showBack={true}
      rightAction={
        shop ? (
          <OverflowMenu
            items={storefrontMenuItems}
            ariaLabel={isHindi ? 'दुकान विकल्प' : 'Store options'}
          />
        ) : null
      }
    >
      {/* 1. Sleek Shop Header Card */}
      {shop && (
        <div
          onClick={() => setShowShopDetailModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            backgroundColor: 'var(--bg-card, #ffffff)',
            borderRadius: '16px',
            border: '1.5px solid var(--border-subtle, #e2e8f0)',
            marginBottom: '12px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-primary-light, #eff6ff)',
                color: 'var(--color-primary, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Store size={22} />
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h2
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    margin: 0,
                    color: 'var(--text-primary, #1e293b)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {shop.name}
                </h2>
                <ShieldCheck size={16} color="var(--color-primary, #2563eb)" />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.74rem',
                  color: 'var(--text-secondary, #64748b)',
                  marginTop: '2px',
                }}
              >
                <span
                  style={{
                    color: isShopOpen ? '#16a34a' : '#dc2626',
                    fontWeight: 700,
                  }}
                >
                  {isShopOpen
                    ? (isHindi ? '● खुली है' : '● Open Now')
                    : (isHindi ? '● बंद है' : '● Closed')}
                </span>
                {shop.city && <span>• {shop.city}</span>}
                {travelInfo?.full && <span>• {travelInfo.full}</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--color-primary, #2563eb)',
                backgroundColor: 'var(--color-primary-light, #eff6ff)',
                padding: '4px 8px',
                borderRadius: '8px',
              }}
            >
              {totalProductCount || products.length} {isHindi ? 'सामान' : 'Items'}
            </span>
            <ChevronRight size={18} color="var(--text-secondary, #94a3b8)" />
          </div>
        </div>
      )}

      {/* 1b. Live Day-Wise Offers & Deals Banner Carousel (<15ms Real-Time Push) */}
      {offers && offers.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
              padding: '0 2px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  fontSize: '11px',
                }}
              >
                ⚡
              </span>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: 'var(--text-primary, #0f172a)',
                  letterSpacing: '-0.01em',
                }}
              >
                {isHindi ? 'दुकान के लाइव ऑफर्स व छूट' : 'Live Store Offers & Deals'}
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  padding: '2px 7px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#16a34a',
                    display: 'inline-block',
                  }}
                />
                LIVE
              </span>
            </div>

            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-secondary, #64748b)',
                fontWeight: 600,
              }}
            >
              {offers.length} {offers.length === 1 ? (isHindi ? 'ऑफर' : 'Offer') : (isHindi ? 'ऑफ़र' : 'Offers')}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              paddingBottom: '4px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {offers.map((offer) => {
              const isFlat = offer.discount_type === 'flat';
              const hasMinOrder = Number(offer.min_order_amount || 0) > 0;
              const hasPromo = Boolean(offer.promo_code);

              return (
                <div
                  key={offer.id}
                  style={{
                    flex: '0 0 min(280px, 82vw)',
                    scrollSnapAlign: 'start',
                    background: 'linear-gradient(135deg, var(--bg-card, #ffffff) 0%, var(--bg-surface-subtle, #f8fafc) 100%)',
                    borderRadius: '16px',
                    border: '1.5px solid var(--border-subtle, #e2e8f0)',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 50%, #db2777 100%)',
                    }}
                  />

                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px',
                        marginBottom: '8px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: '#ffffff',
                          backgroundColor: '#16a34a',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {offer.discount_text || (isFlat ? `₹${offer.discount_value} OFF` : `${offer.discount_value}% OFF`)}
                      </span>

                      {offer.banner_tag && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: '#2563eb',
                            backgroundColor: '#eff6ff',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid #bfdbfe',
                          }}
                        >
                          {offer.banner_tag}
                        </span>
                      )}

                      {offer.applicable_days && offer.applicable_days !== 'all' && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: '#7c3aed',
                            backgroundColor: '#f5f3ff',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid #ddd6fe',
                          }}
                        >
                          📅 {offer.applicable_days}
                        </span>
                      )}
                    </div>

                    <h4
                      style={{
                        fontSize: '0.92rem',
                        fontWeight: 800,
                        margin: '0 0 4px 0',
                        color: 'var(--text-primary, #0f172a)',
                        lineHeight: 1.3,
                      }}
                    >
                      {offer.title}
                    </h4>

                    {offer.description && (
                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary, #64748b)',
                          margin: '0 0 10px 0',
                          lineHeight: 1.35,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {offer.description}
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '8px',
                      paddingTop: '8px',
                      borderTop: '1px dashed var(--border-subtle, #e2e8f0)',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {hasMinOrder && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: 'var(--text-secondary, #64748b)',
                            backgroundColor: 'var(--bg-surface, #f1f5f9)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          Min ₹{Number(offer.min_order_amount).toFixed(0)}
                        </span>
                      )}

                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          color: '#0284c7',
                          backgroundColor: '#f0f9ff',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {offer.applicable_days === 'all' || !offer.applicable_days
                          ? (isHindi ? '📅 सभी दिन' : '📅 All Days')
                          : `📅 ${offer.applicable_days.split(',').join(', ')}`}
                      </span>
                    </div>

                    {hasPromo && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(offer.promo_code);
                            setCopiedPromo(offer.promo_code);
                            setTimeout(() => setCopiedPromo(''), 2000);
                          }
                        }}
                        style={{
                          padding: '4px 9px',
                          borderRadius: '6px',
                          border: '1px solid #93c5fd',
                          backgroundColor: copiedPromo === offer.promo_code ? '#16a34a' : '#eff6ff',
                          color: copiedPromo === offer.promo_code ? '#ffffff' : '#1d4ed8',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease',
                          flexShrink: 0,
                        }}
                        title={isHindi ? 'कूपन कोड कॉपी करें' : 'Copy Coupon Code'}
                      >
                        {copiedPromo === offer.promo_code ? (
                          <>✓ {isHindi ? 'कॉपी हो गया' : 'Copied'}</>
                        ) : (
                          <>
                            <Tag size={11} /> {offer.promo_code}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* If a curated shelf is open (via View All / See More), show dedicated collection view */}
      {activeShelf ? (
        <CuratedShelfDetailView
          shelf={activeShelf}
          onBack={() => setActiveShelf(null)}
          onProductClick={(p) => {
            const enriched = {
              ...p,
              shop_name: p.shop_name || shop?.name,
              shop_slug: p.shop_slug || shop?.slug,
              shop_address: p.shop_address || shop?.address,
              shop_city: p.shop_city || shop?.city,
              shop_phone: p.shop_phone || shop?.phone,
              shop_latitude: p.shop_latitude || shop?.latitude,
              shop_longitude: p.shop_longitude || shop?.longitude,
            };
            navigate(`/shop/${shop?.slug || p.shop_slug || 'store'}/product/${p.id}`, {
              state: { product: enriched, shop },
            });
          }}
          isProductSaved={isProductSaved}
          onToggleSave={toggleSaveProduct}
          shopName={shop?.name}
          shopSlug={shop?.slug}
          isHindi={isHindi}
        />
      ) : (
        <>
          {/* 2. In-Store Search & Sorting Bar */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <SearchInput
            placeholder={isHindi ? `${shop?.name || 'दुकान'} में सामान खोजें...` : `Search inside ${shop?.name || 'store'}...`}
            value={searchTerm}
            onFocus={() => setIsSuggestionsOpen(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsSuggestionsOpen(true);
              if (e.target.value.trim() !== '') setBrowseMode('grid');
            }}
            onSubmit={() => {
              setIsSuggestionsOpen(false);
              if (searchTerm.trim()) {
                setRecentSearches(persistRecentSearch(searchTerm.trim()));
              }
            }}
            onClear={() => {
              setSearchTerm('');
              setSearchSuggestions([]);
            }}
          />

          {/* In-Store Autocomplete Suggestions Dropdown */}
          <SearchSuggestionsDropdown
            isOpen={isSuggestionsOpen}
            onClose={() => setIsSuggestionsOpen(false)}
            query={searchTerm}
            suggestions={searchSuggestions}
            isLoading={isLoadingSuggestions}
            onSelectSuggestion={(term) => {
              setSearchTerm(term);
              setIsSuggestionsOpen(false);
              setBrowseMode('grid');
              setRecentSearches(persistRecentSearch(term));
            }}
            recentSearches={recentSearches}
            onSelectRecent={(term) => {
              setSearchTerm(term);
              setIsSuggestionsOpen(false);
              setBrowseMode('grid');
            }}
            onRemoveRecent={(term) => setRecentSearches(removeRecentSearch(term))}
            onClearAllRecent={() => setRecentSearches(clearAllRecentSearches())}
            isHindi={isHindi}
          />
        </div>

        {/* 1-Tap Voice Search Button */}
        <button
          type="button"
          onClick={handleVoiceSearch}
          title={isListening ? (isHindi ? 'सुन रहे हैं... रोकें' : 'Listening... click to stop') : (isHindi ? 'बोलकर खोजें' : 'Voice Search')}
          style={{
            height: '42px',
            width: '42px',
            borderRadius: '12px',
            border: isListening ? '2px solid #ef4444' : '1.5px solid var(--border-subtle, #e2e8f0)',
            backgroundColor: isListening ? '#fee2e2' : 'var(--bg-surface-subtle, #f8fafc)',
            color: isListening ? '#dc2626' : 'var(--color-primary, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.15s ease',
            boxShadow: isListening ? '0 0 10px rgba(239, 68, 68, 0.4)' : 'none',
          }}
          aria-label="Voice search"
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort products"
          style={{
            height: '42px',
            fontSize: '0.76rem',
            fontWeight: 800,
            padding: '0 10px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
            border: '1.5px solid var(--border-subtle, #e2e8f0)',
            color: 'var(--color-primary, #2563eb)',
            cursor: 'pointer',
            outline: 'none',
            flexShrink: 0,
          }}
        >
          <option value="relevant">⚡ {isHindi ? 'लोकप्रिय' : 'Relevant'}</option>
          <option value="price_low">💰 {isHindi ? 'कम कीमत' : 'Price: Low'}</option>
          <option value="price_high">💎 {isHindi ? 'अधिक कीमत' : 'Price: High'}</option>
          <option value="discount">🔥 {isHindi ? 'छूट % OFF' : 'Discount %'}</option>
        </select>
      </div>

      {/* 2b. View Mode Switcher: Themed Aisles vs All Products Grid */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
          padding: '0 2px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'var(--bg-surface-subtle, #f1f5f9)',
            borderRadius: '10px',
            padding: '3px',
            border: '1px solid var(--border-subtle, #e2e8f0)',
          }}
        >
          <button
            type="button"
            onClick={() => setBrowseMode('aisles')}
            style={{
              padding: '5px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: browseMode === 'aisles' ? 'var(--bg-card, #ffffff)' : 'transparent',
              color: browseMode === 'aisles' ? 'var(--color-primary, #2563eb)' : 'var(--text-secondary, #64748b)',
              fontWeight: 800,
              fontSize: '0.74rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: browseMode === 'aisles' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={13} />
            <span>{isHindi ? 'सुपरमार्केट शेल्व्स' : 'Themed Aisles'}</span>
          </button>
          <button
            type="button"
            onClick={() => setBrowseMode('grid')}
            style={{
              padding: '5px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: browseMode === 'grid' ? 'var(--bg-card, #ffffff)' : 'transparent',
              color: browseMode === 'grid' ? 'var(--color-primary, #2563eb)' : 'var(--text-secondary, #64748b)',
              fontWeight: 800,
              fontSize: '0.74rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: browseMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <LayoutGrid size={13} />
            <span>{isHindi ? 'कैटलॉग ग्रिड' : 'Full Grid'}</span>
          </button>
        </div>

        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #64748b)', fontWeight: 600 }}>
          {totalProductCount || products.length} {isHindi ? 'सामान' : 'items'}
        </span>
      </div>

      {/* 2b. Quick Price & Deal Filter Pills */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '6px',
          marginBottom: '6px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <button
          type="button"
          onClick={() => setQuickFilter('ALL')}
          style={{
            padding: '5px 10px',
            borderRadius: '16px',
            fontSize: '0.72rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            border: quickFilter === 'ALL'
              ? '1.5px solid var(--color-primary, #2563eb)'
              : '1px solid var(--border-subtle, #e2e8f0)',
            backgroundColor: quickFilter === 'ALL'
              ? 'var(--color-primary, #2563eb)'
              : 'var(--bg-card, #ffffff)',
            color: quickFilter === 'ALL' ? '#ffffff' : 'var(--text-secondary, #64748b)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {t('products.quick_filter_all', 'All')}
        </button>

        {quickFilterCounts.under99 > 0 && (
          <button
            type="button"
            onClick={() => setQuickFilter(quickFilter === 'UNDER_99' ? 'ALL' : 'UNDER_99')}
            style={{
              padding: '5px 10px',
              borderRadius: '16px',
              fontSize: '0.72rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              border: quickFilter === 'UNDER_99'
                ? '1.5px solid #10b981'
                : '1px solid var(--border-subtle, #e2e8f0)',
              backgroundColor: quickFilter === 'UNDER_99'
                ? '#10b981'
                : 'var(--bg-card, #ffffff)',
              color: quickFilter === 'UNDER_99' ? '#ffffff' : '#047857',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            🏷️ {t('products.quick_filter_under_99', 'Under ₹99')} ({quickFilterCounts.under99})
          </button>
        )}

        {quickFilterCounts.under499 > 0 && (
          <button
            type="button"
            onClick={() => setQuickFilter(quickFilter === 'UNDER_499' ? 'ALL' : 'UNDER_499')}
            style={{
              padding: '5px 10px',
              borderRadius: '16px',
              fontSize: '0.72rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              border: quickFilter === 'UNDER_499'
                ? '1.5px solid #0284c7'
                : '1px solid var(--border-subtle, #e2e8f0)',
              backgroundColor: quickFilter === 'UNDER_499'
                ? '#0284c7'
                : 'var(--bg-card, #ffffff)',
              color: quickFilter === 'UNDER_499' ? '#ffffff' : '#0369a1',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            🏷️ {t('products.quick_filter_under_499', 'Under ₹499')} ({quickFilterCounts.under499})
          </button>
        )}

        {quickFilterCounts.deals20 > 0 && (
          <button
            type="button"
            onClick={() => setQuickFilter(quickFilter === 'DEALS_20' ? 'ALL' : 'DEALS_20')}
            style={{
              padding: '5px 10px',
              borderRadius: '16px',
              fontSize: '0.72rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              border: quickFilter === 'DEALS_20'
                ? '1.5px solid #ef4444'
                : '1px solid var(--border-subtle, #e2e8f0)',
              backgroundColor: quickFilter === 'DEALS_20'
                ? '#ef4444'
                : 'var(--bg-card, #ffffff)',
              color: quickFilter === 'DEALS_20' ? '#ffffff' : '#dc2626',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            🔥 {t('products.quick_filter_deals_20', 'Deals (>20% Off)')} ({quickFilterCounts.deals20})
          </button>
        )}

        {quickFilterCounts.bargain > 0 && (
          <button
            type="button"
            onClick={() => setQuickFilter(quickFilter === 'BARGAIN' ? 'ALL' : 'BARGAIN')}
            style={{
              padding: '5px 10px',
              borderRadius: '16px',
              fontSize: '0.72rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              border: quickFilter === 'BARGAIN'
                ? '1.5px solid #8b5cf6'
                : '1px solid var(--border-subtle, #e2e8f0)',
              backgroundColor: quickFilter === 'BARGAIN'
                ? '#8b5cf6'
                : 'var(--bg-card, #ffffff)',
              color: quickFilter === 'BARGAIN' ? '#ffffff' : '#7c3aed',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            🔒 {t('products.quick_filter_bargain', 'Price on Request')} ({quickFilterCounts.bargain})
          </button>
        )}
      </div>

      {/* 2c. Active Filters Status Summary with 1-Tap Reset */}
      {(quickFilter !== 'ALL' || selectedCategory !== 'ALL' || searchTerm.trim() !== '') && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '5px 10px',
            marginBottom: '8px',
            backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
            border: '1px dashed var(--border-subtle, #cbd5e1)',
            borderRadius: '8px',
            fontSize: '0.72rem',
            color: 'var(--text-secondary, #64748b)',
          }}
        >
          <span>
            {t('products.showing_items_count', 'Showing {{count}} products').replace('{{count}}', filteredProducts.length)}
          </span>
          <button
            type="button"
            onClick={() => {
              setQuickFilter('ALL');
              setSelectedCategory('ALL');
              setSearchTerm('');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-primary, #2563eb)',
              fontWeight: 700,
              fontSize: '0.72rem',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ✕ {t('products.reset_filters', 'Reset all')}
          </button>
        </div>
      )}

      {/* 3. Dynamic Category Filter Chips */}
      {availableCategories.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '8px',
            marginBottom: '8px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.74rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              border: selectedCategory === 'ALL'
                ? '1.5px solid var(--color-primary, #2563eb)'
                : '1.5px solid var(--border-subtle, #e2e8f0)',
              backgroundColor: selectedCategory === 'ALL'
                ? 'var(--color-primary, #2563eb)'
                : 'var(--bg-card, #ffffff)',
              color: selectedCategory === 'ALL' ? '#ffffff' : 'var(--text-secondary, #64748b)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            ⚡ {isHindi ? 'सभी' : 'All'} ({products.length})
          </button>

          {availableCategories.map((cat) => {
            const count = products.filter((p) => isProductInCategory(p, cat)).length;

            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  border: isSelected
                    ? '1.5px solid var(--color-primary, #2563eb)'
                    : '1.5px solid var(--border-subtle, #e2e8f0)',
                  backgroundColor: isSelected
                    ? 'var(--color-primary, #2563eb)'
                    : 'var(--bg-card, #ffffff)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary, #64748b)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* 4. Products Grid */}
      {loading && products.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <LoadingSpinner fullScreen={false} message={isHindi ? 'दुकान का कैटलॉग लोड हो रहा है...' : 'Loading store catalog...'} />
        </div>
      ) : (isSearchingServer && filteredProducts.length === 0) ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <LoadingSpinner fullScreen={false} message={isHindi ? 'दुकान के पूरे कैटलॉग में खोज जारी है...' : 'Searching full store catalog...'} />
        </div>
      ) : filteredProducts.length === 0 ? (
        searchTerm.trim() ? (
          <ZeroDeadEndSearchState
            query={searchTerm}
            onSelectPopular={(term) => {
              setSearchTerm(term);
              setBrowseMode('grid');
              setRecentSearches(persistRecentSearch(term));
            }}
            onResetFilters={() => {
              setQuickFilter('ALL');
              setSelectedCategory('ALL');
              setSearchTerm('');
            }}
            isHindi={isHindi}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <EmptyState
              icon={Package}
              title={isHindi ? 'कोई सामान नहीं मिला' : 'No Products Found'}
              description={isHindi ? 'कृपया सर्च या कैटेगोरी बदलकर देखें' : 'Try searching another name or picking a different category'}
            />
            {(quickFilter !== 'ALL' || selectedCategory !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setQuickFilter('ALL');
                  setSelectedCategory('ALL');
                  setSearchTerm('');
                }}
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-primary, #2563eb)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
              >
                ✕ {t('products.reset_filters', 'Reset all')}
              </button>
            )}
          </div>
        )
      ) : (
        <>
          {/* Did You Mean Spell Correction Banner */}
          <DidYouMeanBanner
            originalQuery={searchTerm}
            suggestedQuery={spellCorrection}
            onApplySuggestion={(term) => {
              setSearchTerm(term);
              setBrowseMode('grid');
              setRecentSearches(persistRecentSearch(term));
            }}
            isHindi={isHindi}
          />

          {/* Curated Themed Aisles / Shelves (Inspired by Blinkit & Zepto) */}
          {browseMode === 'aisles' && searchTerm.trim() === '' && selectedCategory === 'ALL' && quickFilter === 'ALL' && (
            <CuratedStoreAisles
              products={products}
              onOpenShelf={(shelfData) => setActiveShelf(shelfData)}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setBrowseMode('grid');
              }}
              onSelectQuickFilter={(qf) => {
                setQuickFilter(qf);
                setBrowseMode('grid');
              }}
              onProductClick={(p) => {
                const enriched = {
                  ...p,
                  shop_name: p.shop_name || shop?.name,
                  shop_slug: p.shop_slug || shop?.slug,
                  shop_address: p.shop_address || shop?.address,
                  shop_city: p.shop_city || shop?.city,
                  shop_phone: p.shop_phone || shop?.phone,
                  shop_latitude: p.shop_latitude || shop?.latitude,
                  shop_longitude: p.shop_longitude || shop?.longitude,
                };
                navigate(`/shop/${shop?.slug || p.shop_slug || 'store'}/product/${p.id}`, {
                  state: { product: enriched, shop },
                });
              }}
              isProductSaved={isProductSaved}
              onToggleSave={toggleSaveProduct}
              shopName={shop?.name}
              shopSlug={shop?.slug}
              isHindi={isHindi}
            />
          )}

          {/* Section Divider Header for Full Grid in Aisles Mode */}
          {browseMode === 'aisles' && searchTerm.trim() === '' && selectedCategory === 'ALL' && quickFilter === 'ALL' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '18px 0 12px 0',
                paddingBottom: '8px',
                borderBottom: '1.5px solid var(--border-subtle, #e2e8f0)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={18} color="var(--color-primary, #2563eb)" />
                <h3
                  style={{
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    margin: 0,
                    color: 'var(--text-primary, #0f172a)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {isHindi ? 'दुकान का पूरा कैटलॉग' : 'All Store Products'}
                </h3>
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--bg-surface-subtle, #f1f5f9)',
                  color: 'var(--text-secondary, #64748b)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                {filteredProducts.length} {isHindi ? 'सामान' : 'items'}
              </span>
            </div>
          )}

          <div className="customer-product-grid">
            {filteredProducts.map((p) => {
              const handleOpenModal = () => {
                const enriched = {
                  ...p,
                  shop_name: p.shop_name || shop?.name,
                  shop_slug: p.shop_slug || shop?.slug,
                  shop_address: p.shop_address || shop?.address,
                  shop_city: p.shop_city || shop?.city,
                  shop_phone: p.shop_phone || shop?.phone,
                  shop_latitude: p.shop_latitude || shop?.latitude,
                  shop_longitude: p.shop_longitude || shop?.longitude,
                };
                navigate(`/shop/${shop?.slug || p.shop_slug || 'store'}/product/${p.id}`, {
                  state: { product: enriched, shop },
                });
              };

              return (
                <ProductCard
                  key={p.id}
                  product={p}
                  highlightQuery={searchTerm}
                  isSaved={isProductSaved(p.id)}
                  onToggleSave={toggleSaveProduct}
                  onClick={handleOpenModal}
                  shopName={shop?.name}
                  shopSlug={shop?.slug}
                />
              );
            })}
          </div>

          {/* 5. Infinite Scroll Loader & Pagination Controls */}
          {loadingMore && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 0',
                gap: '8px',
              }}
            >
              <LoadingSpinner fullScreen={false} size="small" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                {isHindi ? 'दुकान से और सामान लोड हो रहा है...' : 'Loading more products from this store...'}
              </span>
            </div>
          )}

          {!loadingMore && hasMore && filteredProducts.length >= PAGE_LIMIT && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <button
                type="button"
                onClick={loadMoreProducts}
                style={{
                  padding: '10px 24px',
                  borderRadius: '24px',
                  border: '1.5px solid var(--color-primary)',
                  backgroundColor: 'var(--color-primary-light, #eff6ff)',
                  color: 'var(--color-primary, #2563eb)',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {isHindi ? 'और सामान देखें (Load More)' : 'Load More Products'}
              </button>
            </div>
          )}

          {!hasMore && filteredProducts.length > 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '20px 0 8px 0',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-secondary, #94a3b8)',
              }}
            >
              {isHindi
                ? `इस दुकान के सभी ${products.length} सामान दिखाए जा चुके हैं ✨`
                : `You've reached the end of this store's catalog (${products.length} items) ✨`}
            </div>
          )}
        </>
      )}
    </>
  )}

      {/* 6. Shop Reviews Section */}
      {shop && <ShopReviewsSection shopSlug={shop.slug} shopName={shop.name} />}

      {/* 7. Product Detail Modal */}
      {inspectedProduct && (
        <ProductDetailModal
          product={inspectedProduct}
          onClose={() => setInspectedProduct(null)}
          onReserve={handleReserveFromModal}
          isMerchant={false}
        />
      )}

      {/* 8. Reservation Success Modal (6-Digit Counter PIN & Instant Directions) */}
      {reservationSuccess && (
        <BaseModal isOpen={Boolean(reservationSuccess)} onClose={() => setReservationSuccess(null)} maxWidth="440px">
          <ModalBody padding="24px" style={{ textAlign: 'center' }}>
            <CheckCircle size={52} color="var(--color-success, #10b981)" style={{ margin: '0 auto 10px auto' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
              {t('checkout.reservation_success_title')}
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0 0 14px 0', lineHeight: 1.45 }}>
              {t('checkout.pickup_instructions_counter', 'Show your 6-digit PIN at the counter to collect your item instantly.')}
            </p>

            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              {isHindi ? 'काउंटर पिकअप कोड' : 'COUNTER PICKUP PIN'}
            </div>
            <div
              style={{
                backgroundColor: 'var(--color-primary-light, rgba(20, 110, 180, 0.1))',
                color: 'var(--color-primary, #1e40af)',
                fontSize: '2.2rem',
                fontWeight: 900,
                letterSpacing: '4px',
                padding: '12px',
                borderRadius: 'var(--radius-md, 12px)',
                margin: '0 0 16px 0',
                fontFamily: 'monospace',
                border: '1.5px dashed var(--color-primary, #3b82f6)',
              }}
            >
              #{reservationSuccess.pickup_code || reservationSuccess.reservation_number || 'OK'}
            </div>

            {/* Product & Order Summary Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                borderRadius: '12px',
                padding: '10px 14px',
                margin: '0 0 16px 0',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-subtle, #e2e8f0)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {((reservationSuccess.product?.images && reservationSuccess.product.images[0]) || reservationSuccess.product?.image || reservationSuccess.product_image || (Array.isArray(reservationSuccess.product_images) && reservationSuccess.product_images[0])) ? (
                  <img
                    src={getImageUrl((reservationSuccess.product?.images && reservationSuccess.product.images[0]) || reservationSuccess.product?.image || reservationSuccess.product_image || reservationSuccess.product_images[0])}
                    alt={reservationSuccess.product?.name || reservationSuccess.product_name || 'Item'}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Package size={20} color="var(--text-muted)" />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {reservationSuccess.product?.name || reservationSuccess.product_name || (isHindi ? 'पिकअप सामान' : 'Reserved Item')}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                  <span>{isHindi ? 'मात्रा:' : 'Qty:'} <strong>{reservationSuccess.quantity || 1}</strong></span>
                  <span>•</span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>
                    ₹{Number(reservationSuccess.total_amount || (reservationSuccess.product?.price || reservationSuccess.product_price || 0) * (reservationSuccess.quantity || 1)).toFixed(0)}
                  </span>
                  <span>•</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shop?.name}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              <Button
                variant="primary"
                fullWidth={true}
                onClick={() => {
                  setReservationSuccess(null);
                  navigate('/reservations');
                }}
              >
                {t('checkout.view_my_pickups', 'View in My Pickups')}
              </Button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="secondary"
                  fullWidth={true}
                  onClick={() => {
                    const dirUrl = getDirectionsUrl(shop?.latitude, shop?.longitude, shop?.name, shop?.address);
                    window.open(dirUrl, '_blank', 'noopener,noreferrer');
                  }}
                >
                  📍 {t('checkout.get_directions', 'Directions')}
                </Button>

                <Button
                  variant="secondary"
                  fullWidth={true}
                  onClick={() => {
                    const code = reservationSuccess.pickup_code || reservationSuccess.reservation_number || '';
                    const dirUrl = getDirectionsUrl(shop?.latitude, shop?.longitude, shop?.name, shop?.address);
                    const shareText = `*ShopSilo Counter Pickup:*%0A🏪 Store: ${shop?.name || ''}%0A🔢 Pickup PIN: *#${code}*%0A📍 Store Directions: ${dirUrl}`;
                    window.open(`https://wa.me/?text=${shareText}`, '_blank');
                  }}
                >
                  💬 {t('checkout.share_pickup', 'Share PIN')}
                </Button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setReservationSuccess(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                padding: '6px',
                textDecoration: 'underline',
              }}
            >
              {t('common.close', 'Continue Shopping')}
            </button>
          </ModalBody>
        </BaseModal>
      )}

      {/* 9. Shop Detail Modal */}
      {showShopDetailModal && shop && (
        <ShopDetailModal
          shop={shop}
          coords={coords}
          onClose={() => setShowShopDetailModal(false)}
        />
      )}
    </AppLayout>
  );
};

export default StorefrontScreen;
