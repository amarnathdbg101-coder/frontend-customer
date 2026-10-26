/**
 * Dedicated Full-Screen Product Details Page
 *
 * Route: /shop/:slug/product/:productId or /product/:productId
 * Features:
 * - 0ms instant optimistic navigation with background SWR sync
 * - Complete product specifications extraction & Enterprise Privacy Shield (Rule 15)
 * - Uses ProductStudioView for ShopSilo-matching high-vibe UI
 * - Real-time finger swipe + desktop mouse drag physics
 * - Animated expandable dot pagination pills
 * - Pricing Hero Card & Minimalist Specifications Chip Grid
 * - In-Store Pickup Hold options with counter verification PIN
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronRight, Package } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useLanguage } from '../../context/LanguageContext';
import { productApi } from '../../api/product.api';
import { shopApi } from '../../api/shop.api';
import { reservationApi } from '../../api/reservation.api';
import { cacheEvents, CACHE_EVENTS } from '../../utils/cacheEvents';
import { useRealtimeStorefront } from '../../hooks/useRealtimeStorefront';
import { LoadingSpinner, Button } from '../../components/ui';
import { ProductStudioView } from '../../components/product/ProductStudioView';

export const ProductDetailScreen = () => {
  const { productId, slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isHindi } = useLanguage();

  // Optimistic initial product from navigation state if available
  const [product, setProduct] = useState(location.state?.product || null);
  const [shop, setShop] = useState(location.state?.shop || null);
  const [loading, setLoading] = useState(!location.state?.product);
  const [error, setError] = useState(null);

  // Live Real-Time Product & Store Sync
  const activeSlug = slug || product?.shop_slug || product?.shop?.slug;
  useRealtimeStorefront(activeSlug, {
    onProductMutated: (payload) => {
      const updatedId = payload.id || payload.product_id;
      if (updatedId && (updatedId === productId || updatedId === product?.id)) {
        setProduct((prev) => (prev ? { ...prev, ...payload } : prev));
      }
    },
    onStockChanged: (payload) => {
      const updatedId = payload.product_id || payload.id;
      if (updatedId && (updatedId === productId || updatedId === product?.id)) {
        const newStock = Number(payload.stock ?? 0);
        setProduct((prev) =>
          prev
            ? {
                ...prev,
                stock_quantity: newStock,
                available_quantity: newStock,
                stock: newStock,
              }
            : prev
        );
      }
    },
    onShopStatusChanged: (payload) => {
      setShop((prev) => (prev ? { ...prev, ...payload } : prev));
    },
  });

  // Always fetch fresh product & shop details from API (SWR pattern)
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!productId) return;
      try {
        if (!product) {
          setLoading(true);
        }
        const prodData = await productApi.getById(productId);
        if (!isMounted) return;
        setProduct(prodData);

        // Fetch shop details if shop is missing or outdated
        const targetSlug = slug || prodData.shop_slug;
        const targetId = prodData.shop_id || prodData.shopId;

        if (!shop || (targetId && shop.id !== targetId)) {
          if (targetSlug && targetSlug !== 'store') {
            try {
              const shopData = await shopApi.getBySlug(targetSlug);
              if (isMounted && shopData) {
                setShop(shopData?.data || shopData);
              }
            } catch {
              if (targetId) {
                try {
                  const shopData2 = await shopApi.getBySlug(targetId);
                  if (isMounted && shopData2) {
                    setShop(shopData2?.data || shopData2);
                  }
                } catch {}
              }
            }
          } else if (targetId) {
            try {
              const shopData2 = await shopApi.getBySlug(targetId);
              if (isMounted && shopData2) {
                setShop(shopData2?.data || shopData2);
              }
            } catch {}
          }
        }
      } catch (err) {
        if (isMounted && !product) {
          setError(err.message || (isHindi ? 'सामान लोड करने में त्रुटि' : 'Failed to load product'));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [productId, slug]);

  const handleReserve = async ({ product: p, quantity, hold_hours, notes }) => {
    const res = await reservationApi.createReservation({
      product_id: p.id,
      shop_id: shop?.id || p.shop_id || p.shopId || '',
      quantity: Number(quantity),
      hold_hours: Number(hold_hours || 4),
      notes: notes || '',
    });
    cacheEvents.emit(CACHE_EVENTS.RESERVATIONS_MUTATED);
    return res;
  };

  if (loading && !product) {
    return (
      <AppLayout title={isHindi ? 'उत्पाद विवरण' : 'Product Details'} showBack={true}>
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
          <LoadingSpinner fullScreen={false} message={isHindi ? 'उत्पाद विवरण लोड हो रहा है...' : 'Loading product details...'} />
        </div>
      </AppLayout>
    );
  }

  if (error || !product) {
    return (
      <AppLayout title={isHindi ? 'उत्पाद विवरण' : 'Product Details'} showBack={true}>
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Package size={56} color="var(--text-muted)" style={{ margin: '0 auto 16px auto', opacity: 0.4 }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {isHindi ? 'उत्पाद उपलब्ध नहीं है' : 'Product Not Available'}
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            {error || (isHindi ? 'यह सामान उपलब्ध नहीं है या हटा दिया गया है' : 'This product does not exist or has been removed')}
          </p>
          <Button
            variant="primary"
            style={{ marginTop: '16px' }}
            onClick={() => navigate(shop?.slug ? `/shop/${shop.slug}` : '/')}
          >
            {shop?.slug ? (isHindi ? 'दुकान पर वापस जाएं' : 'Back to Store') : (isHindi ? 'दुकानें देखें' : 'Explore Stores')}
          </Button>
        </div>
      </AppLayout>
    );
  }

  const storeName = shop?.name || product?.shop_name || (isHindi ? 'दुकान' : 'Store');
  const storeSlug = shop?.slug || product?.shop_slug || '';
  const categoryName = typeof product?.category === 'object'
    ? (product.category?.name || product.category_name || '')
    : String(product?.category_name || product?.category || '');

  return (
    <AppLayout title={product.name} showBack={true}>
      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '16px 16px 80px 16px' }}>
        {/* Top Breadcrumb Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            color: 'var(--text-muted, #94a3b8)',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}
        >
          <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            {isHindi ? 'होम' : 'Home'}
          </Link>
          <ChevronRight size={13} />
          {storeSlug ? (
            <Link to={`/shop/${storeSlug}`} style={{ color: 'var(--color-primary, #4f46e5)', textDecoration: 'none', fontWeight: 700 }}>
              {storeName}
            </Link>
          ) : (
            <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{storeName}</span>
          )}
          {categoryName && (
            <>
              <ChevronRight size={13} />
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{categoryName}</span>
            </>
          )}
          <ChevronRight size={13} />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{product.name}</span>
        </div>

        {/* Clean Product Studio Showcase */}
        <ProductStudioView
          product={product}
          shop={shop}
          isModal={false}
          onReserve={handleReserve}
          isMerchant={false}
        />
      </div>
    </AppLayout>
  );
};

export default ProductDetailScreen;
