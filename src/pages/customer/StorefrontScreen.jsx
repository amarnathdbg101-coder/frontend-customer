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
} from 'lucide-react';
import { shopApi } from '../../api/shop.api';
import { productApi } from '../../api/product.api';
import { reservationApi } from '../../api/reservation.api';
import { useAuth } from '../../context/AuthContext';
import { useSaved } from '../../context/SavedContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation } from '../../context/LocationContext';
import { ProductCard } from '../../components/cards/ProductCard';
import { ProductDetailModal } from '../../components/common/ProductDetailModal';
import { ShopDetailModal } from '../../components/common/ShopDetailModal';
import { ShopReviewsSection } from '../../components/customer/ShopReviewsSection';
import { AppLayout } from '../../components/layout/AppLayout';
import { localCache, CACHE_KEYS, DEFAULT_TTL } from '../../utils/localCache';
import { cacheEvents, CACHE_EVENTS } from '../../utils/cacheEvents';
import { calculateDistanceKm, formatTravelTime, getDirectionsUrl } from '../../utils/distance';
import { isProductInCategory } from '../../utils/categoryMatcher';
import { BaseModal, ModalHeader, ModalBody, SearchInput, Button, LoadingSpinner, EmptyState } from '../../components/ui';

const PAGE_LIMIT = 20;

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

  // Infinite Scroll & Pagination States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalProductCount, setTotalProductCount] = useState(0);

  const debouncedSearch = useDebounce(searchTerm, 250);

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

      if (shopData) {
        setShop(shopData);
        localCache.set(CACHE_KEYS.STOREFRONT(slug), shopData, DEFAULT_TTL.STOREFRONT);
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

      const unsub = cacheEvents.on(CACHE_EVENTS.STOREFRONT_MUTATED, (payload) => {
        if (!payload || !payload.slug || payload.slug === slug) {
          loadShopAndProducts();
        }
      });

      return () => unsub();
    }
  }, [slug, loadShopAndProducts]);

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
      } catch (err) {
        console.warn('Server database search & filter error:', err);
      } finally {
        setIsSearchingServer(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, quickFilter, sortBy, slug]);

  // 4. In-Store Product Search, Filtering and Sorting
  const filteredProducts = useMemo(() => {
    const hasActiveFilter = searchTerm.trim() || selectedCategory !== 'ALL' || quickFilter !== 'ALL' || sortBy !== 'relevant';
    const baseSource = (hasActiveFilter && Array.isArray(serverSearchResults))
      ? serverSearchResults
      : (Array.isArray(products) ? products : []);

    const list = baseSource.filter((p) => {
      // Category Filter
      if (selectedCategory !== 'ALL' && selectedCategory !== 'All') {
        if (!isProductInCategory(p, selectedCategory)) return false;
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

      // Search Filter
      if (!searchTerm.trim()) return true;
      const q = searchTerm.trim().toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchBrand = (p.attributes?.brand || p.brand || '').toLowerCase().includes(q);
      const matchCat = (p.category_name || p.category || '').toLowerCase().includes(q);
      return matchName || matchBrand || matchCat;
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
        const pctA = mrpA > a.price ? ((mrpA - a.price) / mrpA) * 100 : 0;
        const pctB = mrpB > b.price ? ((mrpB - b.price) / mrpB) * 100 : 0;
        return pctB - pctA;
      }
      return 0;
    });
  }, [products, searchTerm, selectedCategory, quickFilter, sortBy]);

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

  return (
    <AppLayout title={shop?.name || t('nav.explore')} showBack={true}>
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

      {/* 2. In-Store Search & Sorting Bar */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ flex: 1 }}>
          <SearchInput
            placeholder={isHindi ? `${shop?.name || 'दुकान'} में सामान खोजें...` : `Search inside ${shop?.name || 'store'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
          />
        </div>

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
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <EmptyState
            icon={Package}
            title={isHindi ? 'कोई सामान नहीं मिला' : 'No Products Found'}
            description={isHindi ? 'कृपया सर्च या कैटेगोरी बदलकर देखें' : 'Try searching another name or picking a different category'}
          />
          {(quickFilter !== 'ALL' || selectedCategory !== 'ALL' || searchTerm.trim() !== '') && (
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
      ) : (
        <>
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
