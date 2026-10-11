import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
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
import { BaseModal, ModalHeader, ModalBody, SearchInput, Button } from '../../components/ui';

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
  const [inspectedProduct, setInspectedProduct] = useState(null);
  const [reservationSuccess, setReservationSuccess] = useState(null);
  const [showShopDetailModal, setShowShopDetailModal] = useState(false);
  const [sortBy, setSortBy] = useState('relevant');

  useEffect(() => {
    if (slug) {
      loadShopAndProducts();

      // Memory-Safe Event-Driven Invalidation
      const unsub = cacheEvents.on(CACHE_EVENTS.STOREFRONT_MUTATED, (payload) => {
        if (!payload || !payload.slug || payload.slug === slug) {
          loadShopAndProducts();
        }
      });

      return () => unsub();
    }
  }, [slug]);

  const loadShopAndProducts = async () => {
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

    try {
      const [shopData, prodData] = await Promise.all([
        shopApi.getShopBySlug(slug),
        productApi.listByShopSlug(slug),
      ]);

      if (shopData) {
        setShop(shopData);
        localCache.set(CACHE_KEYS.STOREFRONT(slug), shopData, DEFAULT_TTL.STOREFRONT);
      }

      const list = Array.isArray(prodData?.products) ? prodData.products : (Array.isArray(prodData) ? prodData : []);
      if (list.length > 0 || !hasLocalData) {
        setProducts(list);
        localCache.set(CACHE_KEYS.STOREFRONT_PRODUCTS(slug), list, DEFAULT_TTL.PRODUCTS);
      }
    } catch (err) {
      console.error('Failed to load shop:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredProducts = useMemo(() => {
    const list = (Array.isArray(products) ? products : []).filter((p) => {
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
  }, [products, searchTerm, sortBy]);

  return (
    <AppLayout title={shop?.name || t('nav.explore')} showBack={true}>
      {/* In-Store Search & Sorting Bar */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
        <div style={{ flex: 1 }}>
          <SearchInput
            placeholder={t('nav.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
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

      {/* Products Grid */}
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

      {/* Shop Reviews Section */}
      {shop && <ShopReviewsSection shopSlug={shop.slug} shopName={shop.name} />}

      {/* Product Detail Modal */}
      {inspectedProduct && (
        <ProductDetailModal
          product={inspectedProduct}
          onClose={() => setInspectedProduct(null)}
          onReserve={handleReserveFromModal}
          isMerchant={false}
        />
      )}

      {/* Reservation Success Modal */}
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

      {/* Shop Detail Modal */}
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
