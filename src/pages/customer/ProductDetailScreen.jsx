/**
 * Dedicated Full-Screen Product Details Page
 *
 * Route: /shop/:slug/product/:productId or /product/:productId
 * Features:
 * - 0ms instant optimistic navigation with background SWR sync
 * - Complete product specifications extraction (pipe/colon description parsing + JSONB attributes)
 * - Strict Enterprise Privacy Shield (Rule 15): zero leakage of cost price, floor price, SKU, supplier
 * - Verified Local Store showcase with live distance, directions, phone call, & WhatsApp
 * - High-res gallery zoom (up to 10 images) & touch gestures
 * - In-Store Pickup Hold options (2h, 4h, 8h, 24h) with 6-digit counter verification PIN
 * - WhatsApp price negotiation for private bargain items (is_price_public = false)
 * - Pure Hindi & English bilingual localization
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Heart,
  ShoppingCart,
  Store,
  MapPin,
  Phone,
  MessageCircle,
  Package,
  Layers,
  CheckCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Maximize2,
  X,
  ExternalLink,
  Tag,
  Check,
} from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSaved } from '../../context/SavedContext';
import { useLocation as useGeoLocation } from '../../context/LocationContext';
import { productApi } from '../../api/product.api';
import { shopApi } from '../../api/shop.api';
import { reservationApi } from '../../api/reservation.api';
import { getImageUrl, extractAllImages } from '../../utils/imageUrl';
import { formatCurrency } from '../../utils/format';
import { getCategoryEmoji } from '../../utils/categoryMeta';
import { getDirectionsUrl, calculateDistanceKm, formatTravelTime } from '../../utils/distance';
import { shareProduct } from '../../utils/productShare';
import { parseProductDetails } from '../../utils/productDetailsHelper';
import { cacheEvents, CACHE_EVENTS } from '../../utils/cacheEvents';
import { useRealtimeStorefront } from '../../hooks/useRealtimeStorefront';
import { BaseModal, ModalBody, Button, Badge, LoadingSpinner } from '../../components/ui';

export const ProductDetailScreen = () => {
  const { productId, slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { isHindi, t } = useLanguage();
  const { isProductSaved, toggleSaveProduct } = useSaved();
  const { coords } = useGeoLocation();

  // Optimistic initial product from navigation state if available
  const [product, setProduct] = useState(location.state?.product || null);
  const [shop, setShop] = useState(location.state?.shop || null);
  const [loading, setLoading] = useState(!location.state?.product);
  const [error, setError] = useState(null);

  // Gallery state
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Cart & Reserve state
  const [cartQty, setCartQty] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [holdHours, setHoldHours] = useState(4);
  const [reserving, setReserving] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(null);

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

  const p = product;
  const isSaved = p?.id ? isProductSaved(p.id) : false;

  // Extract all gallery images (supports up to 10 photos)
  const images = useMemo(() => {
    if (!p) return [];
    return extractAllImages(p.images || p.image || p.image_url);
  }, [p]);

  const activeImage = images[selectedImageIdx] || images[0];

  // Stock, Pricing and Bargain Status
  const currentStock = Number(
    p?.available_quantity ??
    p?.stock_quantity ??
    p?.inventory?.available_quantity ??
    p?.inventory?.quantity ??
    p?.stock ??
    0
  );
  const inStock = currentStock > 0;

  const price = Number(p?.price || 0);
  const comparePrice = Number(p?.compare_price || p?.mrp || 0);
  const hasDiscount = comparePrice > price && price > 0;
  const savings = hasDiscount ? comparePrice - price : 0;
  const discountPct = hasDiscount ? Math.round((savings / comparePrice) * 100) : 0;

  const isPricePublic = p?.is_price_public !== false &&
                        p?.isPricePublic !== false &&
                        p?.attributes?.is_price_public !== false &&
                        p?.attributes?.is_price_public !== 'false' &&
                        !p?.hide_price &&
                        price > 0;

  // Complete Specifications Parsing & Privacy Shield (Rule 15)
  const details = useMemo(() => {
    return parseProductDetails(p, isHindi);
  }, [p, isHindi]);

  const categoryName = details.categoryName || (isHindi ? 'सामान्य' : 'General');
  const brandName = details.brand || p?.brand || '';
  const unitLabel = details.unit || p?.unit || '';
  const weightLabel = details.weightLabel || '';
  const cleanDescription = details.cleanDescription || p?.description || '';
  const specifications = details.specifications || [];
  const tags = details.tags || [];

  // Store information helpers (with API join + fallback)
  const storeName = shop?.name || p?.shop_name || (isHindi ? 'स्थानीय दुकान' : 'Local Store');
  const storeSlug = shop?.slug || p?.shop_slug || '';
  const storePhone = shop?.phone || p?.shop_phone || '';
  const storeAddress = shop?.address || p?.shop_address || '';
  const storeCity = shop?.city || p?.shop_city || '';
  const storeLat = shop?.latitude || p?.shop_latitude;
  const storeLng = shop?.longitude || p?.shop_longitude;
  const distanceKm = storeLat && storeLng ? calculateDistanceKm(coords?.lat, coords?.lng, storeLat, storeLng) : null;
  const travelInfo = distanceKm !== null ? formatTravelTime(distanceKm, isHindi) : null;
  const travelTime = travelInfo?.timeStr || null;

  // Handlers
  const handleAddToCart = () => {
    if (!p) return;
    addItem(p, cartQty);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleReservePickup = async () => {
    if (!isAuthenticated) {
      alert(isHindi ? 'पिकअप बुक करने के लिए कृपया लॉगिन करें' : 'Please sign in to reserve items for store pickup');
      navigate('/login');
      return;
    }

    try {
      setReserving(true);
      const res = await reservationApi.createReservation({
        product_id: p.id,
        shop_id: shop?.id || p.shop_id || p.shopId || '',
        quantity: Number(cartQty),
        hold_hours: Number(holdHours),
        notes: '',
      });
      cacheEvents.emit(CACHE_EVENTS.RESERVATIONS_MUTATED);
      setReservationSuccess(res);
          } catch (err) {
        const msg = (err?.message || '').toLowerCase();
        if (msg.includes('user not found') || msg.includes('unauthorized') || msg.includes('session expired') || msg.includes('reservations_user_id_fkey')) {
          alert(isHindi ? 'सत्र समाप्त हो गया है। कृपया पिकअप बुक करने के लिए दोबारा लॉग इन करें।' : 'Your session has expired. Please sign in again to reserve items.');
          logout();
          navigate('/login');
        } else if (msg.includes('stock') || msg.includes('insufficient')) {
          alert(isHindi ? 'यह उत्पाद वर्तमान में स्टॉक में उपलब्ध नहीं है।' : 'This product currently does not have sufficient available stock.');
        } else {
          alert(err.message || (isHindi ? 'पिकअप बुक करने में त्रुटि' : 'Failed to reserve'));
        }
      } finally {
      setReserving(false);
    }
  };

  const handleShare = async () => {
    if (!p) return;
    const res = await shareProduct({
      product: p,
      shopName: storeName,
      shopSlug: storeSlug,
      isHindi,
    });
    if (res?.success) {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  if (loading && !p) {
    return (
      <AppLayout title={isHindi ? 'उत्पाद विवरण' : 'Product Details'} showBack={true}>
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
          <LoadingSpinner fullScreen={false} message={isHindi ? 'उत्पाद विवरण लोड हो रहा है...' : 'Loading product details...'} />
        </div>
      </AppLayout>
    );
  }

  if (error || !p) {
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
          <Button variant="primary" style={{ marginTop: '16px' }} onClick={() => navigate(storeSlug ? `/shop/${storeSlug}` : '/')}>
            {storeSlug ? (isHindi ? 'दुकान पर वापस जाएं' : 'Back to Store') : (isHindi ? 'दुकानें देखें' : 'Explore Stores')}
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={p.name} showBack={true}>
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '12px 14px 80px 14px' }}>
        {/* --- Top Navigation Breadcrumb & Actions Bar --- */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              {isHindi ? 'होम' : 'Home'}
            </Link>
            <ChevronRight size={13} color="var(--text-muted)" />
            {storeSlug ? (
              <Link to={`/shop/${storeSlug}`} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 700 }}>
                {storeName}
              </Link>
            ) : (
              <span>{storeName}</span>
            )}
            {categoryName && (
              <>
                <ChevronRight size={13} color="var(--text-muted)" />
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{categoryName}</span>
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleShare}
              style={{
                background: 'var(--bg-surface, #ffffff)',
                border: '1.5px solid var(--border-subtle, #e2e8f0)',
                borderRadius: '10px',
                padding: '6px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: copiedShare ? '#16a34a' : 'var(--text-primary)',
                cursor: 'pointer',
              }}
              title={isHindi ? 'व्हाट्सएप पर शेयर करें' : 'Share on WhatsApp'}
            >
              {copiedShare ? <Check size={14} color="#16a34a" strokeWidth={2.5} /> : <Share2 size={14} color="#16a34a" />}
              <span>{copiedShare ? (isHindi ? 'शेयर किया गया!' : 'Shared!') : (isHindi ? 'शेयर करें' : 'Share')}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleSaveProduct(p)}
              style={{
                background: 'var(--bg-surface, #ffffff)',
                border: '1.5px solid var(--border-subtle, #e2e8f0)',
                borderRadius: '10px',
                padding: '6px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: isSaved ? '#ef4444' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
              title={isSaved ? 'Saved' : 'Save'}
            >
              <Heart size={14} fill={isSaved ? '#ef4444' : 'none'} color={isSaved ? '#ef4444' : 'currentColor'} />
              <span>{isSaved ? (isHindi ? 'सहेजा गया' : 'Saved') : (isHindi ? 'सहेजें' : 'Save')}</span>
            </button>
          </div>
        </div>

        {/* --- Main 2-Column Responsive Layout --- */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* ================= LEFT COLUMN: HERO GALLERY & STORE CARD ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Main Showcase Stage */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1 / 1',
                backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                borderRadius: '20px',
                border: '1.5px solid var(--border-subtle, #e2e8f0)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
              }}
            >
              {activeImage ? (
                <img
                  src={getImageUrl(activeImage)}
                  alt={p.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    padding: '16px',
                    cursor: 'zoom-in',
                    transition: 'transform 0.2s ease',
                  }}
                  onClick={() => setIsZoomOpen(true)}
                />
              ) : (
                <Package size={64} color="var(--text-muted)" style={{ opacity: 0.3 }} />
              )}

              {/* Discount Badge on Top-Left */}
              {hasDiscount && discountPct > 0 && isPricePublic && (
                <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}>
                  <Badge variant="danger" size="md">
                    {discountPct}% OFF
                  </Badge>
                </div>
              )}

              {/* Zoom Trigger on Top-Right */}
              {activeImage && (
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(true)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    zIndex: 2,
                  }}
                  title="Fullscreen zoom"
                >
                  <Maximize2 size={16} color="var(--text-primary)" />
                </button>
              )}

              {/* In-Stock / Out-of-Stock Badge on Bottom-Left */}
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', zIndex: 2 }}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    backgroundColor: inStock ? '#10b981' : '#ef4444',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}
                >
                  {inStock
                    ? `✓ ${isHindi ? 'स्टॉक में उपलब्ध' : 'In Stock'} (${currentStock})`
                    : `✕ ${isHindi ? 'स्टॉक समाप्त' : 'Out of Stock'}`}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip (Multi-Image Support up to 10 photos) */}
            {images.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                  scrollbarWidth: 'none',
                }}
              >
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '12px',
                      border: selectedImageIdx === idx ? '2px solid var(--color-primary, #2563eb)' : '1.5px solid var(--border-subtle, #e2e8f0)',
                      backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                      padding: '4px',
                      cursor: 'pointer',
                      flexShrink: 0,
                      overflow: 'hidden',
                      transition: 'transform 0.15s ease',
                      transform: selectedImageIdx === idx ? 'scale(1.05)' : 'none',
                    }}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`Thumb ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Verified Local Store Card */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface, #ffffff)',
                border: '1.5px solid var(--border-subtle, #e2e8f0)',
                borderRadius: '18px',
                padding: '16px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(79, 70, 229, 0.1)',
                      color: 'var(--color-primary, #4f46e5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Store size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                      {storeName}
                    </div>
                    {(storeAddress || storeCity) && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', flexWrap: 'wrap' }}>
                        <MapPin size={12} />
                        <span>{[storeAddress, storeCity].filter(Boolean).join(', ')}</span>
                        {distanceKm !== null && <span>• <strong>{distanceKm.toFixed(1)} km</strong> {travelTime ? ` (${travelTime})` : ''}</span>}
                      </div>
                    )}
                  </div>
                </div>

                <span
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#059669',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '12px',
                    flexShrink: 0,
                  }}
                >
                  ✓ Verified Store
                </span>
              </div>

              {/* Direct Store Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    const dirUrl = getDirectionsUrl(storeLat, storeLng, storeName, storeAddress);
                    window.open(dirUrl, '_blank', 'noopener,noreferrer');
                  }}
                  style={{
                    flex: 1,
                    minWidth: '110px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <MapPin size={13} color="var(--color-primary)" />
                  <span>{isHindi ? 'रास्ता देखें' : 'Directions'}</span>
                </button>

                {storePhone && (
                  <button
                    type="button"
                    onClick={() => window.open(`tel:${storePhone}`)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Phone size={13} />
                    <span>{isHindi ? 'कॉल' : 'Call'}</span>
                  </button>
                )}

                {storeSlug && (
                  <button
                    type="button"
                    onClick={() => navigate(`/shop/${storeSlug}`)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-primary)',
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                      color: 'var(--color-primary)',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <ExternalLink size={13} />
                    <span>{isHindi ? 'दुकान देखें' : 'Visit Store'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quality & Trust Highlights Card */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface, #ffffff)',
                border: '1.5px solid var(--border-subtle, #e2e8f0)',
                borderRadius: '18px',
                padding: '16px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#047857' }}>
                <ShieldCheck size={16} color="#10b981" />
                <span>{isHindi ? '100% असली स्थानीय दुकान से' : '100% Genuine from Local Merchant'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <Clock size={16} color="var(--color-primary)" />
                <span>{isHindi ? 'काउंटर पर 30 मिनट में तैयार' : 'Ready for 30-min Counter Pickup'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <CheckCircle size={16} color="#059669" />
                <span>{isHindi ? 'दुकान पर देखकर व संतुष्ट होकर लें' : 'Inspect before taking at store counter'}</span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: PRODUCT DETAILS & ACTIONS ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Title, Category & Brand Block */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1rem' }}>
                  {getCategoryEmoji(categoryName)}
                </span>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: 'var(--color-primary, #2563eb)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {categoryName}
                </span>

                {brandName && (
                  <>
                    <span style={{ color: 'var(--text-muted)' }}>•</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {brandName}
                    </span>
                  </>
                )}

                {unitLabel && (
                  <>
                    <span style={{ color: 'var(--text-muted)' }}>•</span>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {unitLabel}
                    </span>
                  </>
                )}
              </div>

              <h1
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 900,
                  color: 'var(--text-primary, #0f172a)',
                  lineHeight: 1.3,
                  margin: '0 0 10px 0',
                }}
              >
                {p.name}
              </h1>

              {/* Feature Tags Row */}
              {tags.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--bg-surface-subtle, #f1f5f9)',
                        color: 'var(--text-secondary, #475569)',
                        border: '1px solid var(--border-subtle, #e2e8f0)',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Ready for Pickup highlight */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: '#047857',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                }}
              >
                <Clock size={13} />
                <span>{isHindi ? '30 मिनट में काउंटर पिकअप के लिए उपलब्ध' : 'Ready for 30-min Counter Pickup'}</span>
              </div>
            </div>

            {/* Price Showcase Card */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface, #ffffff)',
                border: '1.5px solid var(--border-subtle, #e2e8f0)',
                borderRadius: '18px',
                padding: '16px 20px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
              }}
            >
              {isPricePublic ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '2rem',
                        fontWeight: 900,
                        color: 'var(--color-primary, #2563eb)',
                        letterSpacing: '-0.5px',
                      }}
                    >
                      {formatCurrency(price)}
                    </span>

                    {hasDiscount && (
                      <span
                        style={{
                          fontSize: '1.05rem',
                          color: 'var(--text-muted, #94a3b8)',
                          textDecoration: 'line-through',
                          fontWeight: 600,
                        }}
                      >
                        {formatCurrency(comparePrice)}
                      </span>
                    )}

                    {hasDiscount && discountPct > 0 && (
                      <Badge variant="danger" size="md">
                        {discountPct}% OFF
                      </Badge>
                    )}
                  </div>

                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {isHindi ? 'सभी कर सहित (Inclusive of all taxes)' : 'Inclusive of all taxes'}
                    {hasDiscount && savings > 0 && (
                      <strong style={{ color: '#16a34a', marginLeft: '6px' }}>
                        • {isHindi ? `आपकी बचत ₹${savings}` : `You Save ₹${savings}`}
                      </strong>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge variant="bargain" size="md">
                      {isHindi ? '🔒 मोलभाव करें / रेट पूछें' : '🔒 Price on Request'}
                    </Badge>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {isHindi
                      ? 'दुकानदार इस सामान पर मोलभाव की सुविधा देते हैं। सीधे WhatsApp पर बात करके बेस्ट रेट पाएं।'
                      : 'Merchant allows price negotiation on this item. Inquire directly on WhatsApp for best price.'}
                  </p>
                </div>
              )}

              {/* Quantity Stepper & Action Buttons */}
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                {isPricePublic ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        {isHindi ? 'मात्रा (Quantity)' : 'Quantity'}:
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          disabled={cartQty <= 1}
                          onClick={() => setCartQty((q) => Math.max(1, q - 1))}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: 'var(--bg-surface-subtle)',
                            cursor: cartQty <= 1 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', minWidth: '24px', textAlign: 'center' }}>
                          {cartQty}
                        </span>
                        <button
                          type="button"
                          disabled={inStock && cartQty >= currentStock}
                          onClick={() => setCartQty((q) => (inStock ? Math.min(currentStock, q + 1) : q + 1))}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: 'var(--bg-surface-subtle)',
                            cursor: inStock && cartQty >= currentStock ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Hold Time Selector for Pickup */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        {isHindi ? 'पिकअप समय होल्ड:' : 'Pickup Hold Time:'}
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[2, 4, 8, 24].map((hr) => (
                          <button
                            key={hr}
                            type="button"
                            onClick={() => setHoldHours(hr)}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '8px',
                              border: holdHours === hr ? '1.5px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                              backgroundColor: holdHours === hr ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-surface-subtle)',
                              color: holdHours === hr ? 'var(--color-primary)' : 'var(--text-secondary)',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            {hr}h
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Button
                        variant="secondary"
                        fullWidth
                        icon={ShoppingCart}
                        onClick={handleAddToCart}
                        disabled={!inStock}
                      >
                        {addedToast ? (isHindi ? 'जोड़ा गया!' : 'Added!') : (isHindi ? 'कार्ट में जोड़ें' : 'Add to Cart')}
                      </Button>

                      <Button
                        variant="primary"
                        fullWidth
                        icon={Clock}
                        onClick={handleReservePickup}
                        disabled={!inStock || reserving}
                        loading={reserving}
                      >
                        {isHindi ? 'पिकअप बुक करें' : 'Reserve Pickup'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        const storeStr = storeName ? `🏪 Store: ${storeName}%0A` : '';
                        const msg = `Namaste, I want to inquire about the best price for *${p.name}*.${storeStr ? '%0A' + storeStr : ''}`;
                        const phone = (storePhone || '').replace(/[^0-9]/g, '');
                        window.open(phone ? `https://wa.me/91${phone}?text=${msg}` : `https://wa.me/?text=${msg}`, '_blank');
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        backgroundColor: '#25d366',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.92rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
                      }}
                    >
                      <MessageCircle size={18} />
                      <span>{isHindi ? 'व्हाट्सएप पर रेट पूछें / मोलभाव करें' : 'Ask Best Price on WhatsApp'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Complete Specifications Grid (Customer Privacy Shield) */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface, #ffffff)',
                border: '1.5px solid var(--border-subtle, #e2e8f0)',
                borderRadius: '18px',
                padding: '18px 20px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Layers size={18} color="var(--color-primary, #2563eb)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {isHindi ? 'उत्पाद विनिर्देश व विवरण (Product Specifications)' : 'Product Specifications'}
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                {categoryName && (
                  <div style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-surface-subtle)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      {isHindi ? 'श्रेणी' : 'Category'}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {categoryName}
                    </div>
                  </div>
                )}

                {brandName && (
                  <div style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-surface-subtle)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      {isHindi ? 'ब्रांड' : 'Brand'}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {brandName}
                    </div>
                  </div>
                )}

                {unitLabel && (
                  <div style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-surface-subtle)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      {isHindi ? 'मात्रा / पैकेज' : 'Package Size'}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {unitLabel}
                    </div>
                  </div>
                )}

                {weightLabel && (
                  <div style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-surface-subtle)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      {isHindi ? 'कुल वजन' : 'Net Weight'}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {weightLabel}
                    </div>
                  </div>
                )}

                {specifications.map((spec) => (
                  <div key={spec.key} style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: 'var(--bg-surface-subtle)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      {spec.label}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Description */}
            {cleanDescription && (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface, #ffffff)',
                  border: '1.5px solid var(--border-subtle, #e2e8f0)',
                  borderRadius: '18px',
                  padding: '18px 20px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--text-primary)' }}>
                  {isHindi ? 'सामान का विवरण (Description)' : 'Product Description'}
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-line' }}>
                  {cleanDescription}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* --- Mobile Sticky Bottom Bar --- */}
        <div
          className="mobile-only"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-surface, #ffffff)',
            borderTop: '1.5px solid var(--border-subtle, #e2e8f0)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            zIndex: 95,
            boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              {isPricePublic ? (isHindi ? 'कुल मूल्य' : 'TOTAL PRICE') : (isHindi ? 'दर' : 'RATE')}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary, #2563eb)' }}>
              {isPricePublic ? formatCurrency(price * cartQty) : (isHindi ? 'मोलभाव करें' : 'Ask Price')}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {isPricePublic ? (
              <>
                <Button variant="secondary" icon={ShoppingCart} onClick={handleAddToCart} disabled={!inStock}>
                  {addedToast ? (isHindi ? 'जोड़ा गया!' : 'Added!') : (isHindi ? 'जोड़ें' : 'Add')}
                </Button>
                <Button variant="primary" icon={Clock} onClick={handleReservePickup} disabled={!inStock || reserving}>
                  {isHindi ? 'पिकअप' : 'Reserve'}
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                icon={MessageCircle}
                onClick={() => {
                  const phone = (storePhone || '').replace(/[^0-9]/g, '');
                  window.open(phone ? `https://wa.me/91${phone}?text=Rate%20inquiry%20for%20${encodeURIComponent(p.name)}` : `https://wa.me/?text=Rate%20inquiry%20for%20${encodeURIComponent(p.name)}`, '_blank');
                }}
              >
                {isHindi ? 'रेट पूछें' : 'Ask Price'}
              </Button>
            )}
          </div>
        </div>

        {/* --- Fullscreen Lightbox Zoom Modal --- */}
        {isZoomOpen && activeImage && (
          <div
            onClick={() => setIsZoomOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.94)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              backdropFilter: 'blur(8px)',
            }}
          >
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '50%',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ffffff',
              }}
              title={t('common.close')}
            >
              <X size={20} />
            </button>
            <img
              src={getImageUrl(activeImage)}
              alt={p.name}
              style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* --- Reservation Success Celebration Modal (6-Digit Counter PIN) --- */}
        {reservationSuccess && (
          <BaseModal isOpen={Boolean(reservationSuccess)} onClose={() => setReservationSuccess(null)} maxWidth="440px">
            <ModalBody padding="24px" style={{ textAlign: 'center' }}>
              <CheckCircle size={52} color="#10b981" style={{ margin: '0 auto 10px auto' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                {isHindi ? 'पिकअप ऑर्डर बुक हो गया!' : 'Pickup Order Booked!'}
              </h2>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0 0 14px 0', lineHeight: 1.45 }}>
                {isHindi
                  ? 'दुकान के काउंटर पर यह 6-अंकों का पिन दिखाकर अपना सामान तुरंत प्राप्त करें।'
                  : 'Show your 6-digit PIN at the counter to collect your item instantly.'}
              </p>

              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                {isHindi ? 'काउंटर पिकअप कोड' : 'COUNTER PICKUP PIN'}
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  color: 'var(--color-primary, #1e40af)',
                  fontSize: '2.2rem',
                  fontWeight: 900,
                  letterSpacing: '4px',
                  padding: '12px',
                  borderRadius: '12px',
                  margin: '0 0 14px 0',
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
                  {(p?.images && p.images[0]) || p?.image ? (
                    <img
                      src={getImageUrl((p.images && p.images[0]) || p.image)}
                      alt={p.name}
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
                    {p.name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                    <span>{isHindi ? 'मात्रा:' : 'Qty:'} <strong>{cartQty}</strong></span>
                    <span>•</span>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>
                      ₹{((p.price || 0) * cartQty).toFixed(0)}
                    </span>
                    <span>•</span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{storeName}</span>
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
                  {isHindi ? 'माई पिकअप में देखें' : 'View in My Pickups'}
                </Button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant="secondary"
                    fullWidth={true}
                    onClick={() => {
                      const dirUrl = getDirectionsUrl(storeLat, storeLng, storeName, storeAddress);
                      window.open(dirUrl, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    📍 {isHindi ? 'रास्ता देखें' : 'Directions'}
                  </Button>

                  <Button
                    variant="secondary"
                    fullWidth={true}
                    onClick={() => {
                      const code = reservationSuccess.pickup_code || reservationSuccess.reservation_number || '';
                      const dirUrl = getDirectionsUrl(storeLat, storeLng, storeName, storeAddress);
                      const shareText = `*ShopSilo Counter Pickup:*%0A🏪 Store: ${storeName}%0A🔢 Pickup PIN: *#${code}*%0A📍 Store Directions: ${dirUrl}`;
                      window.open(`https://wa.me/?text=${shareText}`, '_blank');
                    }}
                  >
                    💬 {isHindi ? 'पिन शेयर करें' : 'Share PIN'}
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
                {isHindi ? 'खरीदारी जारी रखें' : 'Continue Browsing'}
              </button>
            </ModalBody>
          </BaseModal>
        )}
      </div>
    </AppLayout>
  );
};

export default ProductDetailScreen;
