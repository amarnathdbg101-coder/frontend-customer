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
import { calculateDistanceKm, formatTravelTime } from '../../utils/distance';
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
  const [inspectedProduct, setInspectedProduct] = useState(null);
  const [reservationSuccess, setReservationSuccess] = useState(null);
  const [showShopDetailModal, setShowShopDetailModal] = useState(false);
  const [sortBy, setSortBy] = useState('relevant');

  // Infinite Scroll & Pagination States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalProductCount, setTotalProductCount] = useState(0);

  // 1. Initial Load: Shop Metadata & First 20 Products
  const loadShopAndProducts = useCallback(async () => {
    const cachedShop = localCache.get(CACHE_KEYS.STOREFRONT(slug));
    const cachedProds = localCache.get(CACHE_KEYS.STOREFRONT_PRODUCTS(slug));

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
        productApi.listByShopSlug(slug, { page: 1, limit: PAGE_LIMIT }),
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

      if (normalizedProds.length > 0 || !hasLocalData) {
        setProducts(normalizedProds);
        localCache.set(CACHE_KEYS.STOREFRONT_PRODUCTS(slug), normalizedProds, DEFAULT_TTL.PRODUCTS);
      }
    } catch (err) {
      console.error('Failed to load shop storefront:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

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

  // 2. Infinite Scroll: Fetch Next Page of Products for this Shop
  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const res = await productApi.listByShopSlug(slug, {
        page: nextPage,
        limit: PAGE_LIMIT,
        q: searchTerm.trim() || undefined,
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
          const updated = [...prev, ...newItems];
          localCache.set(CACHE_KEYS.STOREFRONT_PRODUCTS(slug), updated, DEFAULT_TTL.PRODUCTS);
          return updated;
        });
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Failed to load more shop products:', err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, loading, page, slug, searchTerm]);

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

  // 3. Category Filter Chips (Dynamic extraction from products)
  const availableCategories = useMemo(() => {
    const cats = new Set();
    products.forEach((p) => {
      const c = p.category_name || p.category || (p.category_id ? 'General' : null);
      if (c && typeof c === 'string') cats.add(c.trim());
    });
    return Array.from(cats);
  }, [products]);

  // 4. In-Store Product Search, Filtering and Sorting
  const filteredProducts = useMemo(() => {
    const list = (Array.isArray(products) ? products : []).filter((p) => {
      // Category Filter
      if (selectedCategory !== 'ALL') {
        const cat = (p.category_name || p.category || '').toLowerCase();
        if (cat !== selectedCategory.toLowerCase()) return false;
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
  }, [products, searchTerm, selectedCategory, sortBy]);

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
                {travelInfo && <span>• {travelInfo}</span>}
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
            const count = products.filter((p) => {
              const c = p.category_name || p.category || '';
              return c.toLowerCase() === cat.toLowerCase();
            }).length;

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
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title={isHindi ? 'कोई सामान नहीं मिला' : 'No Products Found'}
          description={isHindi ? 'कृपया सर्च या कैटेगोरी बदलकर देखें' : 'Try searching another name or picking a different category'}
        />
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
                setInspectedProduct(enriched);
              };

              return (
                <ProductCard
                  key={p.id}
                  product={p}
                  isSaved={isProductSaved(p.id)}
                  onToggleSave={toggleSaveProduct}
                  onClick={handleOpenModal}
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

      {/* 8. Reservation Success Modal */}
      {reservationSuccess && (
        <BaseModal isOpen={Boolean(reservationSuccess)} onClose={() => setReservationSuccess(null)} maxWidth="420px">
          <ModalBody padding="24px" style={{ textAlign: 'center' }}>
            <CheckCircle size={48} color="var(--color-success)" style={{ margin: '0 auto 8px auto' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
              {t('checkout.reservation_success_title')}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              {t('checkout.reservation_success_desc')}
            </p>

            <div
              style={{
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                fontSize: '1.8rem',
                fontWeight: 900,
                letterSpacing: '4px',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                margin: '0 0 16px 0',
              }}
            >
              {reservationSuccess.pickup_code || reservationSuccess.reservation_number || 'OK'}
            </div>

            <Button
              variant="secondary"
              fullWidth={true}
              onClick={() => setReservationSuccess(null)}
            >
              {t('common.confirm')}
            </Button>
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
