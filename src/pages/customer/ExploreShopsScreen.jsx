import { localCache, CACHE_KEYS, DEFAULT_TTL } from '../../utils/localCache.js';
import { cacheEvents, CACHE_EVENTS } from '../../utils/cacheEvents.js';
import { sessionState } from '../../utils/sessionState.js';
import { useScreenState } from '../../hooks/useScreenState.js';
/**
 * Customer Explore & Marketplace Screen
 * Clean, modern, responsive layout with location discovery, search, promo carousel, 
 * category system, and responsive shop & product feeds.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Store,
  ChevronDown,
  MapPin,
  X,
  Package,
  Navigation,
  Loader2,
  Compass,
  RefreshCw,
  RotateCcw,
  Mic,
  MicOff,
} from 'lucide-react';
import { shopApi } from '../../api/shop.api';
import { productApi } from '../../api/product.api';
import { reservationApi } from '../../api/reservation.api';
import { AppLayout } from '../../components/layout/AppLayout';
import { HomeHeader } from '../../components/layout/HomeHeader';
import { SearchHeroSection } from '../../components/customer/SearchHeroSection';
import { HowShopSiloWorksSection } from '../../components/customer/HowShopSiloWorksSection';
import { SearchResultHeader } from '../../components/customer/SearchResultHeader';
import { useLocation } from '../../context/LocationContext';
import { useSaved } from '../../context/SavedContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useDebounce } from '../../hooks/useDebounce';
import { ProductCard } from '../../components/cards/ProductCard';
import { ShopCard } from '../../components/cards/ShopCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonProductGrid, SkeletonShopGrid } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { OverflowMenu } from '../../components/ui/OverflowMenu';
import { ProductDetailModal } from '../../components/common/ProductDetailModal';
import { ShopDetailModal } from '../../components/common/ShopDetailModal';
import { CategoryExplorerModal } from '../../components/customer/CategoryExplorerModal';
import { SmartSearchModal } from '../../components/customer/SmartSearchModal';
import { SearchSuggestionsDropdown } from '../../components/customer/SearchSuggestionsDropdown';
import { CategoryBar } from '../../components/customer/CategoryBar';
import { CuratedStoreAisles } from '../../components/customer/CuratedStoreAisles';
import { CuratedShelfDetailView } from '../../components/customer/CuratedShelfDetailView';
import { DidYouMeanBanner } from '../../components/customer/DidYouMeanBanner';
import { ZeroDeadEndSearchState } from '../../components/customer/ZeroDeadEndSearchState';
import { calculateDistanceKm } from '../../utils/distance';
import { isProductInCategory, isShopInCategory } from '../../utils/categoryMatcher';
import {
  getStoredRecentSearches,
  persistRecentSearch,
  removeRecentSearch,
  clearAllRecentSearches,
} from '../../utils/searchHelpers';

const PAGE_LIMIT = 20;

const RADIUS_OPTIONS = [
  { label: '1 km', value: 1 },
  { label: '3 km', value: 3 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: 'All', value: 999 },
];

function extractArray(response, fieldName) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response[fieldName])) return response[fieldName];
  if (Array.isArray(response.data)) return response.data;
  if (response.data && Array.isArray(response.data[fieldName])) return response.data[fieldName];
  if (Array.isArray(response.results)) return response.results;
  if (Array.isArray(response.items)) return response.items;
  return [];
}

export const ExploreShopsScreen = () => {
  const navigate = useNavigate();
  const { coords, locationName, radiusKm, setRadiusKm, detectLocation, setManualLocation, isDetecting } = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const { isProductSaved, toggleSaveProduct, isShopSaved, toggleSaveShop } = useSaved();
  const { isHindi, t } = useLanguage();
  const { openCart, cartCount } = useCart();

  // Restore explore screen state (tab, category, search) from session
  const savedExploreState = sessionState.getScreenState('explore', {
    activeTab: 'products',
    selectedCategory: 'All',
    searchTerm: '',
  });

  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(savedExploreState.searchTerm || '');
  const [selectedCategory, setSelectedCategory] = useState(savedExploreState.selectedCategory || 'All');
  const [activeTab, setActiveTab] = useState(savedExploreState.activeTab || 'products');
  const [activeShelf, setActiveShelf] = useState(null); // When user clicks View All / See More on any shelf
  const [sortBy, setSortBy] = useState('relevant');
  const [quickFilter, setQuickFilter] = useState('ALL');
  const [minRating, setMinRating] = useState(0);
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalProductCount, setTotalProductCount] = useState(0);

  // Dual-Tier Hybrid Database Search States
  const [serverSearchResults, setServerSearchResults] = useState(null);
  const [serverShopResults, setServerShopResults] = useState(null);
  const [isSearchingServer, setIsSearchingServer] = useState(false);

  // Automatic scroll position restoration
  useScreenState('explore', {
    restoreScroll: true,
    isDataReady: !loading && (products.length > 0 || shops.length > 0),
  });

  // Keep screen state synced in session
  useEffect(() => {
    sessionState.saveScreenState('explore', {
      activeTab,
      selectedCategory,
      searchTerm,
    });
  }, [activeTab, selectedCategory, searchTerm]);

  // Modals state
  const [inspectedProduct, setInspectedProduct] = useState(null);
  const [inspectedShop, setInspectedShop] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSmartSearchOpen, setIsSmartSearchOpen] = useState(false);

  // Autocomplete Suggestions & Voice Search States
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(getStoredRecentSearches);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 250);

  // 1-Tap Voice Search for Explore Screen
  const handleVoiceSearch = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isHindi ? 'इस ब्राउज़र में वॉइस इनपुट समर्थित नहीं है। कृपया टाइप करके खोजें।' : 'Voice input is not supported in this browser. Please type to search.');
      return;
    }

    if (isVoiceListening) {
      setIsVoiceListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isHindi ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsVoiceListening(true);
      recognition.onend = () => setIsVoiceListening(false);
      recognition.onerror = () => setIsVoiceListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript || '';
        if (transcript) {
          setSearchTerm(transcript);
          setIsSuggestionsOpen(false);
        }
      };

      recognition.start();
    } catch (e) {
      console.warn('Explore voice search error:', e);
      setIsVoiceListening(false);
    }
  }, [isHindi, isVoiceListening]);

  // Fast Autocomplete Suggestions (150ms debounce - supports single-character queries)
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
        const list = await productApi.getSearchSuggestions(clean, '', 6);
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
  }, [searchTerm]);

  // 1. Fetch Shops & Products (SWR 0ms Cache First)
  const loadMarketplaceData = useCallback(async (searchOverride) => {
    const isCatActive = selectedCategory && selectedCategory !== 'All';
    const cacheCoordKey = coords?.lat ? `${CACHE_KEYS.SHOPS}_${coords.lat.toFixed(2)}_${coords.lng.toFixed(2)}` : CACHE_KEYS.SHOPS;
    const cacheProdKey = isCatActive ? `${CACHE_KEYS.PRODUCTS}_${selectedCategory}` : CACHE_KEYS.PRODUCTS;
    const cachedShops = localCache.get(cacheCoordKey);
    const cachedProds = localCache.get(cacheProdKey);

    let hasLocal = false;
    if (cachedShops && Array.isArray(cachedShops) && cachedShops.length > 0) {
      setShops(cachedShops);
      hasLocal = true;
    }
    if (cachedProds && Array.isArray(cachedProds) && cachedProds.length > 0) {
      setProducts(cachedProds);
      hasLocal = true;
    }

    if (hasLocal) {
      setLoading(false); // 0ms Instant Render!
    } else {
      setLoading(true);
    }

    setPage(1);
    setHasMore(true);

    try {
      const categoryParam = isCatActive ? selectedCategory : undefined;
      const cleanSearch = (searchOverride ?? searchTerm).trim() || undefined;
      const sortParam = sortBy !== 'relevant' ? sortBy : undefined;

      const params = {
        lat: coords?.lat,
        lng: coords?.lng,
        radius_km: radiusKm === 999 ? undefined : radiusKm,
        category: categoryParam,
        search: cleanSearch,
        q: cleanSearch,
        sort_by: sortParam,
      };

      const [shopsRes, prodsRes] = await Promise.allSettled([
        shopApi.listPublicShops(params).catch(() => shopApi.listPublicShops({})),
        (coords?.lat && coords?.lng)
          ? productApi.findNearbyProducts({
              lat: coords.lat,
              lng: coords.lng,
              radius_km: radiusKm === 999 ? 20 : radiusKm,
              category: categoryParam,
              search: cleanSearch,
              q: cleanSearch,
              sort_by: sortParam,
              page: 1,
              limit: PAGE_LIMIT,
            }).catch(() => productApi.listProducts({ page: 1, limit: PAGE_LIMIT, category: categoryParam, search: cleanSearch, q: cleanSearch, sort_by: sortParam }))
          : productApi.listProducts({ page: 1, limit: PAGE_LIMIT, category: categoryParam, search: cleanSearch, q: cleanSearch, sort_by: sortParam }),
      ]);

      let shopList = shopsRes.status === 'fulfilled' ? extractArray(shopsRes.value, 'shops') : [];
      if (shopList.length === 0 && params.radius_km) {
        try {
          const fallbackShops = await shopApi.listPublicShops({});
          shopList = extractArray(fallbackShops, 'shops');
        } catch (e) {
          console.warn('Fallback shops fetch error:', e);
        }
      }

      const prodData = prodsRes.status === 'fulfilled' ? prodsRes.value : null;
      let rawProdList = extractArray(prodData, 'products');
      if (rawProdList.length === 0) {
        try {
          const fallbackProds = await productApi.listProducts({ page: 1, limit: PAGE_LIMIT });
          rawProdList = extractArray(fallbackProds, 'products');
        } catch (e) {
          console.warn('Fallback products fetch error:', e);
        }
      }

      const totalCount = prodData?.total_count || prodData?.data?.total_count || rawProdList.length;
      const totalPages = prodData?.total_pages || prodData?.data?.total_pages || Math.ceil(totalCount / PAGE_LIMIT);
      setTotalProductCount(totalCount);
      if (rawProdList.length < PAGE_LIMIT || totalPages <= 1) {
        setHasMore(false);
      } else {
        setHasMore(true);
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

      if (shopList.length > 0) {
        setShops(shopList);
        localCache.set(cacheCoordKey, shopList, DEFAULT_TTL.SHOPS);
      }
      if (normalizedProds.length > 0) {
        setProducts(normalizedProds);
        localCache.set(cacheProdKey, normalizedProds, DEFAULT_TTL.PRODUCTS);
      }
    } catch (err) {
      console.error('Failed to load marketplace data:', err);
    } finally {
      setLoading(false);
    }
  }, [coords?.lat, coords?.lng, radiusKm, selectedCategory]);

  useEffect(() => {
    loadMarketplaceData();

    // Memory-Safe Event-Driven Cache Invalidation Subscription
    const unsubShops = cacheEvents.on(CACHE_EVENTS.SHOPS_MUTATED, () => loadMarketplaceData());
    const unsubProds = cacheEvents.on(CACHE_EVENTS.PRODUCTS_MUTATED, () => loadMarketplaceData());

    return () => {
      unsubShops();
      unsubProds();
    };
  }, [loadMarketplaceData]);

  // 1a. Dual-Tier Hybrid Database Search (bypasses 20-item local limit & queries PostgreSQL database)
  useEffect(() => {
    const clean = searchTerm.trim();
    if (!clean) {
      setServerSearchResults(null);
      setServerShopResults(null);
      setIsSearchingServer(false);
      return;
    }

    setIsSearchingServer(true);
    let active = true;

    const timer = setTimeout(async () => {
      try {
        const isCatActive = selectedCategory && selectedCategory !== 'All';
        const categoryParam = isCatActive ? selectedCategory : undefined;
        const searchParams = {
          search: clean,
          q: clean,
          category: categoryParam,
          lat: coords?.lat,
          lng: coords?.lng,
          radius_km: radiusKm === 999 ? undefined : radiusKm,
          page: 1,
          limit: 50,
        };

        const [prodRes, shopRes] = await Promise.allSettled([
          (coords?.lat && coords?.lng)
            ? productApi.findNearbyProducts({
                ...searchParams,
                radius_km: radiusKm === 999 ? 20 : radiusKm,
              }).catch(() => productApi.listProducts({ search: clean, q: clean, category: categoryParam, page: 1, limit: 50 }))
            : productApi.listProducts({ search: clean, q: clean, category: categoryParam, page: 1, limit: 50 }),
          shopApi.listPublicShops(searchParams).catch(() => shopApi.listPublicShops({ search: clean, q: clean, page: 1, limit: 30 })),
        ]);

        if (!active) return;

        let rawProds = prodRes.status === 'fulfilled' ? extractArray(prodRes.value, 'products') : [];
        if (rawProds.length === 0 && (coords?.lat && coords?.lng)) {
          try {
            const fallbackProds = await productApi.listProducts({ search: clean, q: clean, category: categoryParam, page: 1, limit: 50 });
            if (active) rawProds = extractArray(fallbackProds, 'products');
          } catch (e) {
            console.warn('Fallback products search error:', e);
          }
        }

        // If category filter was active and produced 0 results, fallback to search across ALL categories so customer never hits a dead end
        if (rawProds.length === 0 && categoryParam) {
          try {
            const globalProds = await productApi.listProducts({ search: clean, q: clean, page: 1, limit: 50 });
            if (active) rawProds = extractArray(globalProds, 'products');
          } catch (e) {
            console.warn('Global products fallback search error:', e);
          }
        }

        let rawShops = shopRes.status === 'fulfilled' ? extractArray(shopRes.value, 'shops') : [];
        if (rawShops.length === 0 && (coords?.lat && coords?.lng)) {
          try {
            const fallbackShops = await shopApi.listPublicShops({ search: clean, q: clean, page: 1, limit: 30 });
            if (active) rawShops = extractArray(fallbackShops, 'shops');
          } catch (e) {
            console.warn('Fallback shops search error:', e);
          }
        }

        if (!active) return;

        const normalizedProds = rawProds.map((p) => {
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

        const normalizedShops = rawShops.map((s) => ({
          ...s,
          id: s.id || s.shop_id,
        }));

        setServerSearchResults(normalizedProds);
        setServerShopResults(normalizedShops);
        // Persist to recent searches
        setRecentSearches(persistRecentSearch(clean));
      } catch (err) {
        console.warn('Server database search error, keeping instant local results:', err);
      } finally {
        if (active) setIsSearchingServer(false);
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchTerm, selectedCategory, coords?.lat, coords?.lng, radiusKm]);

  // 1b. Infinite Scroll Pagination: Fetch next page of products on scroll
  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      let rawProdList = [];
      let totalPages = 1;
      let totalCount = 0;

      const categoryParam = (selectedCategory && selectedCategory !== 'All') ? selectedCategory : undefined;
      const cleanSearch = searchTerm.trim() || undefined;
      const sortParam = sortBy !== 'relevant' ? sortBy : undefined;

      if (coords?.lat && coords?.lng) {
        const res = await productApi.findNearbyProducts({
          lat: coords.lat,
          lng: coords.lng,
          radius_km: radiusKm === 999 ? 20 : radiusKm,
          category: categoryParam,
          search: cleanSearch,
          q: cleanSearch,
          sort_by: sortParam,
          page: nextPage,
          limit: PAGE_LIMIT,
        });
        rawProdList = extractArray(res, 'products');
        totalPages = res?.total_pages || res?.data?.total_pages || 1;
        totalCount = res?.total_count || res?.data?.total_count || 0;
      } else {
        const res = await productApi.listProducts({
          page: nextPage,
          limit: PAGE_LIMIT,
          category: categoryParam,
          search: cleanSearch,
          q: cleanSearch,
          sort_by: sortParam,
        });
        rawProdList = extractArray(res, 'products');
        totalPages = res?.total_pages || res?.data?.total_pages || 1;
        totalCount = res?.total_count || res?.data?.total_count || 0;
      }

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
          const updated = [...prev, ...newItems];
          localCache.set(CACHE_KEYS.PRODUCTS, updated, DEFAULT_TTL.PRODUCTS);
          return updated;
        });
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Failed to load more products:', err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, loading, page, coords?.lat, coords?.lng, radiusKm, selectedCategory]);

  // Automatic Infinite Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (activeTab !== 'products') return;
      if (!hasMore || loadingMore || loading) return;

      const scrollY = window.scrollY || window.pageYOffset;
      const visibleHeight = window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight;

      // Trigger next batch when user reaches within 350px of bottom
      if (visibleHeight + scrollY >= totalHeight - 350) {
        loadMoreProducts();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, hasMore, loadingMore, loading, loadMoreProducts]);

  // 2. Filter & Sort Products (Location-Aware + Fast Smart Search)
  const filteredProducts = useMemo(() => {
    const isSearching = Boolean(debouncedSearch.trim());
    const hasServerResults = Array.isArray(serverSearchResults);

    let baseSource;
    if (isSearching && hasServerResults) {
      // Products in serverSearchResults are already matched & ranked by PostgreSQL pg_trgm fuzzy search
      baseSource = serverSearchResults;
    } else {
      baseSource = Array.isArray(products) ? products : [];
    }

    const list = baseSource.filter((p) => {
      // Proximity Distance Filter (Pre-filters out-of-range products)
      const lat = p.shop_latitude || p.latitude;
      const lng = p.shop_longitude || p.longitude;
      const distKm = calculateDistanceKm(coords?.lat, coords?.lng, lat, lng);
      p._distKm = distKm;

      if (distKm != null && radiusKm > 0 && distKm > radiusKm && !debouncedSearch.trim()) {
        return false;
      }

      // Only perform client-side substring check if server results are not active yet
      if (isSearching && !hasServerResults) {
        const query = debouncedSearch.toLowerCase();
        const matchesName = (p.name || '').toLowerCase().includes(query);
        const matchesBrand = (p.attributes?.brand || p.brand || '').toLowerCase().includes(query);
        const matchesShop = (p.shop_name || '').toLowerCase().includes(query);
        const matchesDesc = (p.description || '').toLowerCase().includes(query);
        if (!matchesName && !matchesBrand && !matchesShop && !matchesDesc) return false;
      }

      if (selectedCategory && selectedCategory !== 'All') {
        const hasCategoryMatches = baseSource.some((item) => isProductInCategory(item, selectedCategory));
        if (hasCategoryMatches && !isProductInCategory(p, selectedCategory)) return false;
      }

      // Quick Filter (Budget)
      const price = Number(p.price || 0);
      if (quickFilter === 'UNDER_99' && price > 99) return false;
      if (quickFilter === 'UNDER_499' && price > 499) return false;

      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'nearest') {
        return (a._distKm ?? 999) - (b._distKm ?? 999);
      }
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
  }, [products, serverSearchResults, debouncedSearch, selectedCategory, coords, radiusKm, sortBy]);

  // 3. Filter & Sort Shops
  const filteredShops = useMemo(() => {
    const isSearching = Boolean(debouncedSearch.trim());
    const hasServerResults = Array.isArray(serverShopResults);

    let baseSource;
    if (isSearching && hasServerResults) {
      baseSource = serverShopResults;
    } else {
      baseSource = Array.isArray(shops) ? shops : [];
    }

    const list = baseSource.filter((s) => {
      const distKm = calculateDistanceKm(coords?.lat, coords?.lng, s.latitude, s.longitude);
      s._distKm = distKm;

      if (distKm != null && radiusKm > 0 && distKm > radiusKm && !debouncedSearch.trim()) {
        return false;
      }

      // Only perform client-side substring check if server results are not active yet
      if (isSearching && !hasServerResults) {
        const query = debouncedSearch.toLowerCase();
        const matchesName = (s.name || '').toLowerCase().includes(query);
        const matchesAddr = (s.address || '').toLowerCase().includes(query);
        const matchesCity = (s.city || '').toLowerCase().includes(query);
        const matchesCat = (s.category || '').toLowerCase().includes(query);
        if (!matchesName && !matchesAddr && !matchesCity && !matchesCat) return false;
      }

      if (showOpenOnly && s.is_open === false && s.isCurrentlyOpen === false) {
        return false;
      }

      if (selectedCategory && selectedCategory !== 'All') {
        if (!isShopInCategory(s, selectedCategory)) return false;
      }

      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'nearest') {
        return (a._distKm ?? 999) - (b._distKm ?? 999);
      }
      return 0;
    });
  }, [shops, serverShopResults, debouncedSearch, selectedCategory, coords, radiusKm, sortBy, showOpenOnly]);

  // Calculate typo/spell correction suggestion
  const spellCorrection = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (q.length < 3) return null;

    // If direct substring matches exist, no need for correction banner
    const hasDirectMatch = filteredProducts.some((p) => (p.name || '').toLowerCase().includes(q));
    if (hasDirectMatch) return null;

    // Check top suggestion
    if (searchSuggestions.length > 0 && searchSuggestions[0].toLowerCase() !== q) {
      return searchSuggestions[0];
    }
    // Check top returned product from fuzzy search
    if (filteredProducts.length > 0 && filteredProducts[0].name.toLowerCase() !== q) {
      return filteredProducts[0].name;
    }
    return null;
  }, [searchTerm, filteredProducts, searchSuggestions]);

  const handleReserveFromModal = useCallback(async ({ product, quantity, hold_hours, notes }) => {
    try {
      const res = await reservationApi.createReservation({
        product_id: product.id,
        shop_id: product.shop_id || product.shopId || product.shop?.id || '',
        quantity,
        hold_hours,
        notes,
      });
      cacheEvents.emit(CACHE_EVENTS.RESERVATIONS_MUTATED);
      alert(`${isHindi ? 'सामान रिज़र्व हो गया!' : 'Item Reserved!'} ${isHindi ? 'पिकअप OTP' : 'Pickup OTP'}: ${res.pickup_code || res.reservation_number || 'OK'}`);
      setInspectedProduct(null);
    } catch (err) {
      alert(err.message || (isHindi ? 'रिज़र्वेशन में त्रुटि' : 'Reservation Error'));
    }
  }, [isHindi]);

  const handleSelectShopTab = () => {
    setActiveTab('shops');
    const el = document.getElementById('marketplace-feed-header');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectProductsTab = () => {
    setActiveTab('products');
    const el = document.getElementById('marketplace-feed-header');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const exploreMenuItems = useMemo(() => {
    return [
      {
        id: 'toggle_open_only',
        label: showOpenOnly
          ? (isHindi ? 'सभी दुकानें दिखाएं' : 'Show All Stores')
          : (isHindi ? 'सिर्फ खुली दुकानें दिखाएं' : 'Show Open Stores Only'),
        icon: <span>{showOpenOnly ? '🏪' : '🟢'}</span>,
        badge: showOpenOnly ? (isHindi ? 'सक्रिय' : 'ON') : null,
        onClick: () => setShowOpenOnly((prev) => !prev),
      },
      { separator: true },
      {
        id: 'radius_3',
        label: isHindi ? 'दायरा: 3 किमी' : 'Radius: 3 km',
        icon: <Compass size={16} color="var(--color-primary, #4f46e5)" />,
        badge: radiusKm === 3 ? '✓' : null,
        onClick: () => setRadiusKm(3),
      },
      {
        id: 'radius_5',
        label: isHindi ? 'दायरा: 5 किमी' : 'Radius: 5 km',
        icon: <Compass size={16} color="var(--color-primary, #4f46e5)" />,
        badge: radiusKm === 5 ? '✓' : null,
        onClick: () => setRadiusKm(5),
      },
      {
        id: 'radius_10',
        label: isHindi ? 'दायरा: 10 किमी' : 'Radius: 10 km',
        icon: <Compass size={16} color="var(--color-primary, #4f46e5)" />,
        badge: radiusKm === 10 ? '✓' : null,
        onClick: () => setRadiusKm(10),
      },
      {
        id: 'radius_all',
        label: isHindi ? 'दायरा: सभी (दूरी सीमा नहीं)' : 'Radius: All (No limit)',
        icon: <Compass size={16} color="var(--color-primary, #4f46e5)" />,
        badge: radiusKm === 999 ? '✓' : null,
        onClick: () => setRadiusKm(999),
      },
      { separator: true },
      {
        id: 'refresh',
        label: isHindi ? 'फ़ीड रिफ्रेश करें' : 'Refresh Marketplace',
        icon: <RefreshCw size={16} color="var(--text-secondary, #64748b)" />,
        onClick: () => {
          loadMarketplaceData();
        },
      },
      {
        id: 'reset',
        label: isHindi ? 'सभी फ़िल्टर हटाएं' : 'Reset All Filters',
        icon: <RotateCcw size={16} color="var(--color-danger, #ef4444)" />,
        danger: true,
        onClick: () => {
          setSearchTerm('');
          setSelectedCategory('All');
          setShowOpenOnly(false);
          setSortBy('relevant');
          setRadiusKm(5);
        },
      },
    ];
  }, [showOpenOnly, radiusKm, isHindi, loadMarketplaceData]);

  return (
    <AppLayout
      hideDesktopNav={true}
      customHeader={
        <HomeHeader
          locationName={locationName}
          isDetecting={isDetecting}
          onOpenLocationModal={() => setShowLocationModal(true)}
          rightAction={
            <OverflowMenu
              items={exploreMenuItems}
              ariaLabel={isHindi ? 'मार्केटप्लेस विकल्प' : 'Marketplace options'}
            />
          }
        />
      }
    >
      {/* 1. ABOVE-THE-FOLD SEARCH-FIRST HERO SECTION */}
      <SearchHeroSection
        searchTerm={searchTerm}
        onSearchChange={(term) => {
          setSearchTerm(term);
          setIsSuggestionsOpen(true);
        }}
        onSearchSubmit={(term) => {
          setIsSuggestionsOpen(false);
          if (term?.trim()) {
            setRecentSearches(persistRecentSearch(term.trim()));
          }
        }}
        onClearSearch={() => {
          setSearchTerm('');
          setServerSearchResults(null);
          setServerShopResults(null);
          setSearchSuggestions([]);
          loadMarketplaceData('');
        }}
        isSearchingServer={isSearchingServer}
        isSuggestionsOpen={isSuggestionsOpen}
        onOpenSuggestions={() => setIsSuggestionsOpen(true)}
        onCloseSuggestions={() => setIsSuggestionsOpen(false)}
        searchSuggestions={searchSuggestions}
        isLoadingSuggestions={isLoadingSuggestions}
        onSelectSuggestion={(term) => {
          setSearchTerm(term);
          setIsSuggestionsOpen(false);
          setRecentSearches(persistRecentSearch(term));
        }}
        recentSearches={recentSearches}
        onSelectRecent={(term) => {
          setSearchTerm(term);
          setIsSuggestionsOpen(false);
        }}
        onRemoveRecent={(term) => setRecentSearches(removeRecentSearch(term))}
        onClearAllRecent={() => setRecentSearches(clearAllRecentSearches())}
        isVoiceListening={isVoiceListening}
        onToggleVoiceSearch={handleVoiceSearch}
        onOpenSmartSearch={() => setIsSmartSearchOpen(true)}
        isHindi={isHindi}
      />

      {/* 1.5. COMPACT "HOW SHOPSILO WORKS" 3-STEP FLOW GUIDE */}
      <HowShopSiloWorksSection />

      {/* 1.8. REDESIGNED SEARCH RESULTS HEADER & FILTER PILLS BAR */}
      <SearchResultHeader
        searchTerm={searchTerm}
        filteredProducts={filteredProducts}
        filteredShops={filteredShops}
        radiusKm={radiusKm}
        setRadiusKm={setRadiusKm}
        quickFilter={quickFilter}
        setQuickFilter={setQuickFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showOpenOnly={showOpenOnly}
        setShowOpenOnly={setShowOpenOnly}
        onOpenCompare={() => setIsSmartSearchOpen(true)}
        isHindi={isHindi}
      />

      {/* 2. BELOW-THE-FOLD: CLEAN FEED HEADER & SORT CONTROLS */}
      <div id="marketplace-feed" style={{ marginTop: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={18} color="var(--color-primary, #4f46e5)" />
            <h2
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                margin: 0,
                color: 'var(--text-primary, #0f172a)',
                letterSpacing: '-0.01em',
              }}
            >
              {searchTerm ? (isHindi ? 'खोज परिणाम' : 'Search Results') : (isHindi ? 'पास में उपलब्ध सामान' : 'Nearby Products')}
            </h2>
            <span
              style={{
                fontSize: '0.74rem',
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

          {searchTerm && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 700 }}>
                {isHindi ? 'क्रमबद्ध:' : 'Sort:'}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  padding: '5px 10px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                  border: '1px solid var(--border-subtle, #e2e8f0)',
                  color: 'var(--text-primary, #0f172a)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="relevant">{isHindi ? 'लोकप्रिय (Relevant)' : 'Relevant'}</option>
                <option value="nearest">{isHindi ? 'समीप (Nearest First)' : 'Nearest First'}</option>
                <option value="price_low">{isHindi ? 'कीमत: कम से अधिक' : 'Price: Low to High'}</option>
                <option value="price_high">{isHindi ? 'कीमत: अधिक से कम' : 'Price: High to Low'}</option>
                <option value="discount">{isHindi ? 'अधिकतम छूट (% OFF)' : 'Highest Discount (% OFF)'}</option>
              </select>
            </div>
          )}
        </div>

        {/* If user searched and shops were found, show shop matches cleanly */}
        {searchTerm && filteredShops.length > 0 && (
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Store size={16} color="var(--color-primary, #4f46e5)" />
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
                {isHindi ? 'मिलती-जुलती दुकानें' : 'Matching Stores'} ({filteredShops.length})
              </h3>
            </div>
            <div className="customer-shop-grid">
              {filteredShops.slice(0, 4).map((s) => (
                <ShopCard
                  key={s.id}
                  shop={s}
                  coords={coords}
                  isSaved={isShopSaved(s.id)}
                  onToggleSave={toggleSaveShop}
                  onClick={() => setInspectedShop(s)}
                  onNavigate={navigate}
                />
              ))}
            </div>
          </div>
        )}

      {/* 7. RESPONSIVE FEED CONTENT */}
      <div style={{ marginBottom: '40px' }}>
        {loading ? (
          activeTab === 'shops' ? <SkeletonShopGrid count={4} /> : <SkeletonProductGrid count={6} />
        ) : activeTab === 'shops' ? (
          (isSearchingServer && filteredShops.length === 0) ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <LoadingSpinner fullScreen={false} message={isHindi ? 'डेटाबेस में दुकानें खोजी जा रही हैं...' : 'Searching database for shops...'} />
            </div>
          ) : filteredShops.length === 0 ? (
            <EmptyState
              icon={Store}
              title={isHindi ? 'कोई दुकान नहीं मिली' : 'No Shops Found'}
              description={isHindi ? 'कृपया सर्च या रेडियस फ़िल्टर बदलें' : 'Try adjusting your search or radius'}
            />
          ) : (
            <div className="customer-shop-grid">
              {filteredShops.map((s) => (
                <ShopCard
                  key={s.id}
                  shop={s}
                  coords={coords}
                  isSaved={isShopSaved(s.id)}
                  onToggleSave={toggleSaveShop}
                  onClick={() => setInspectedShop(s)}
                  onNavigate={navigate}
                />
              ))}
            </div>
          )
        ) : (isSearchingServer && filteredProducts.length === 0) ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <LoadingSpinner fullScreen={false} message={isHindi ? 'डेटाबेस में सामान खोजा जा रहा है...' : 'Searching database for products...'} />
          </div>
        ) : filteredProducts.length === 0 ? (
          searchTerm.trim() ? (
            <ZeroDeadEndSearchState
              query={searchTerm}
              onSelectPopular={(term) => {
                setSearchTerm(term);
                setRecentSearches(persistRecentSearch(term));
              }}
              onResetFilters={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              isHindi={isHindi}
            />
          ) : (
            <EmptyState
              icon={Package}
              title={isHindi ? 'कोई सामान नहीं मिला' : 'No Products Found'}
              description={isHindi ? 'कृपया दूसरा नाम या कैटेगोरी चुनें' : 'Try picking another category or search'}
            />
          )
        ) : (
          <>
            {/* 1. DID YOU MEAN SPELL CORRECTION BANNER */}
            <DidYouMeanBanner
              originalQuery={searchTerm}
              suggestedQuery={spellCorrection}
              onApplySuggestion={(term) => {
                setSearchTerm(term);
                setRecentSearches(persistRecentSearch(term));
              }}
              isHindi={isHindi}
            />

            {activeShelf ? (
              <CuratedShelfDetailView
                shelf={activeShelf}
                onBack={() => setActiveShelf(null)}
                onProductClick={(p) => navigate(`/shop/${p.shop_slug || 'store'}/product/${p.id}`, { state: { product: p } })}
                isProductSaved={isProductSaved}
                onToggleSave={toggleSaveProduct}
                isHindi={isHindi}
              />
            ) : (
              <>
                <div className="customer-product-grid">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  highlightQuery={searchTerm}
                  isSaved={isProductSaved(p.id)}
                  onToggleSave={toggleSaveProduct}
                  onClick={() => navigate(`/shop/${p.shop_slug || 'store'}/product/${p.id}`, { state: { product: p } })}
                />
              ))}
            </div>

            {/* Seamless Infinite Scroll Loading Animation */}
            {loadingMore && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '30px 0',
                  color: 'var(--color-primary, #2563eb)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                }}
              >
                <LoadingSpinner size="sm" />
                <span>{isHindi ? 'और सामान लोड हो रहा है...' : 'Loading more products...'}</span>
              </div>
            )}

            {/* Manual fallback load more button */}
            {!loadingMore && hasMore && filteredProducts.length >= PAGE_LIMIT && (
              <div style={{ textAlign: 'center', margin: '28px 0 12px' }}>
                <Button
                  variant="outline"
                  onClick={loadMoreProducts}
                  style={{
                    borderRadius: '24px',
                    padding: '10px 32px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  {isHindi ? 'और सामान देखें ⬇' : 'Load More Products ⬇'}
                </Button>
              </div>
            )}

            {/* End of results indication */}
            {!hasMore && filteredProducts.length > 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '28px 0 12px',
                  color: 'var(--text-tertiary, #94a3b8)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                }}
              >
                {isHindi ? '✓ सभी नजदीकी उपलब्ध सामान देख लिए गए हैं' : "✓ All available products nearby loaded"}
              </div>
            )}
          </>
        )}
      </>
    )}
  </div>
</div>

      {/* PRODUCT DETAIL MODAL */}
      {inspectedProduct && (
        <ProductDetailModal
          product={inspectedProduct}
          onClose={() => setInspectedProduct(null)}
          onReserve={handleReserveFromModal}
        />
      )}

      {/* SHOP DETAIL MODAL */}
      {inspectedShop && (
        <ShopDetailModal
          shop={inspectedShop}
          coords={coords}
          onClose={() => setInspectedShop(null)}
        />
      )}

      {/* CATEGORY EXPLORER MODAL */}
      <CategoryExplorerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        selectedCategoryId={selectedCategory}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId || 'All');
          setIsCategoryModalOpen(false);
        }}
      />

      {/* HYPERLOCAL MULTI-SHOP SEARCH MODAL ("सामान कहाँ मिलेगा?") */}
      <SmartSearchModal
        isOpen={isSmartSearchOpen}
        onClose={() => setIsSmartSearchOpen(false)}
        initialQuery={searchTerm}
      />

      {/* LOCATION PICKER MODAL */}
      {showLocationModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowLocationModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface, #ffffff)',
              color: 'var(--text-primary)',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-subtle, #e5e7eb)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  {isHindi ? '📍 अपनी लोकेशन चुनें' : '📍 Select Your Location'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {isHindi ? 'सटीक दुकान दूरी और डिलीवरी समय देखने के लिए' : 'To see exact store distance and travel times'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: 'var(--text-muted)',
                  padding: '4px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Live GPS Button */}
            <button
              type="button"
              onClick={() => {
                detectLocation();
                setShowLocationModal(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                border: '1px solid rgba(79, 70, 229, 0.3)',
                borderRadius: '12px',
                color: 'var(--color-primary, #4f46e5)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                marginBottom: '18px',
                transition: 'all 0.15s ease',
              }}
            >
              <Navigation size={16} />
              <span>{isHindi ? '🎯 लाइव GPS लोकेशन इस्तेमाल करें' : '🎯 Use Live GPS Location'}</span>
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default ExploreShopsScreen;
