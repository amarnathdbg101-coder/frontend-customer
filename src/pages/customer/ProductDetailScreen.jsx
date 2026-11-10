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
import { ChevronRight, Package, MapPin, ArrowLeft, Search, ShoppingCart, X, Mic, MicOff, Loader2 } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useLocation as useGeoLocation } from '../../context/LocationContext';
import { productApi } from '../../api/product.api';
import { shopApi } from '../../api/shop.api';
import { reservationApi } from '../../api/reservation.api';
import { cacheEvents, CACHE_EVENTS } from '../../utils/cacheEvents';
import { getImageUrl, extractFirstImage } from '../../utils/imageUrl';
import { calculateDistanceKm } from '../../utils/distance';
import { useRealtimeStorefront } from '../../hooks/useRealtimeStorefront';
import { usePageSeo } from '../../hooks/usePageSeo';
import { LoadingSpinner, Button } from '../../components/ui';
import { ProductTrustDetailView } from '../../components/product/ProductTrustDetailView';
import { SearchSuggestionsDropdown } from '../../components/customer/SearchSuggestionsDropdown';
import { sessionState } from '../../utils/sessionState';
import {
  getStoredRecentSearches,
  persistRecentSearch,
  removeRecentSearch,
  clearAllRecentSearches,
} from '../../utils/searchHelpers';

// Safe helper to extract a single product object from varied API response shapes
const extractProductObject = (res) => {
  if (!res) return null;
  if (res.id || res.product_id || res.name) return res;
  if (res.product && (res.product.id || res.product.name)) return res.product;
  if (res.data && (res.data.id || res.data.name)) return res.data;
  if (res.data && res.data.product && (res.data.product.id || res.data.product.name)) return res.data.product;
  if (res.data && res.data.data && (res.data.data.id || res.data.data.name)) return res.data.data;
  if (res.data && res.data.data && res.data.data.product) return res.data.data.product;
  return null;
};

// Safe helper to extract an array from varied API response shapes
const extractArray = (res, key) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res[key] && Array.isArray(res[key])) return res[key];
  if (res.data) {
    if (Array.isArray(res.data)) return res.data;
    if (res.data[key] && Array.isArray(res.data[key])) return res.data[key];
    if (res.data.data) {
      if (Array.isArray(res.data.data)) return res.data.data;
      if (res.data.data[key] && Array.isArray(res.data.data[key])) return res.data.data[key];
    }
  }
  return [];
};

export const ProductDetailScreen = () => {
  const { productId, slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isHindi } = useLanguage();
  const { coords } = useGeoLocation();
  const { cartCount, openCart } = useCart();

  // Optimistic initial product from navigation state if available
  const [product, setProduct] = useState(location.state?.product || null);
  const [shop, setShop] = useState(location.state?.shop || null);

  // Top Header Search, Autocomplete & Voice Search State (Home Dashboard Parity)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(getStoredRecentSearches);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(!location.state?.product);
  const [error, setError] = useState(null);

  // Dynamic SEO & OpenGraph Head Management
  usePageSeo({
    title: product?.name
      ? `${product.name} - ₹${product.price} at ${shop?.name || product.shop_name || 'Local Store'}`
      : 'Product Details',
    description: product
      ? `Buy ${product.name} for ₹${product.price} in ${shop?.name || product.shop_name || 'nearby store'}. Instant counter pickup, real-time stock, and verified local store prices.`
      : undefined,
    image: product ? getImageUrl(extractFirstImage(product.images || product.image || product.image_url)) : undefined,
    url: product?.id && (slug || shop?.slug) ? `/shop/${slug || shop?.slug}/product/${product.id}` : undefined,
    type: 'product',
    jsonLd: product
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          image: getImageUrl(extractFirstImage(product.images || product.image || product.image_url)),
          description: product.description || `In-stock at ${shop?.name || product.shop_name}`,
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'INR',
            availability: (product.available_quantity || product.stock_quantity) > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            seller: {
              '@type': 'Organization',
              name: shop?.name || product.shop_name,
            },
          },
        }
      : undefined,
  });

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

  // Fast Autocomplete Suggestions (150ms debounce - supports multi-character prefix matching)
  useEffect(() => {
    const clean = searchQuery.trim();
    if (clean.length < 1) {
      setSearchSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    let active = true;
    setIsLoadingSuggestions(true);
    const timer = setTimeout(async () => {
      try {
        if (typeof productApi.getSearchSuggestions === 'function') {
          const list = await productApi.getSearchSuggestions(clean, '', 6);
          if (active) {
            setSearchSuggestions(Array.isArray(list) ? list : []);
          }
        }
      } catch {
        if (active) setSearchSuggestions([]);
      } finally {
        if (active) setIsLoadingSuggestions(false);
      }
    }, 150);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleSearchSubmit = (term) => {
    const clean = (term ?? searchQuery).trim();
    if (!clean) return;
    setIsSuggestionsOpen(false);
    setRecentSearches(persistRecentSearch(clean));
    sessionState.saveScreenState('explore', {
      activeTab: 'products',
      selectedCategory: 'All',
      searchTerm: clean,
    });
    navigate('/explore?q=' + encodeURIComponent(clean));
  };

  const toggleVoiceSearch = () => {
    if (isVoiceListening) {
      setIsVoiceListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isHindi ? 'आपका ब्राउज़र वॉयस सर्च सपोर्ट नहीं करता' : 'Voice search is not supported in this browser.');
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
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript?.trim()) {
          const cleanTranscript = transcript.trim();
          setSearchQuery(cleanTranscript);
          handleSearchSubmit(cleanTranscript);
        }
      };
      recognition.start();
    } catch {
      setIsVoiceListening(false);
    }
  };

  // Always fetch fresh product & shop details from API (SWR pattern)
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!productId) return;
      try {
        if (!product) {
          setLoading(true);
        }

        let rawRes = null;
        try {
          rawRes = await productApi.getById(productId);
        } catch {
          try {
            rawRes = await productApi.getBySlug(productId);
          } catch {}
        }

        const prodData = extractProductObject(rawRes);

        if (!isMounted) return;

        if (prodData) {
          setProduct(prodData);
          setError(null);

          // Fetch shop details if shop is missing or outdated
          const targetSlug = slug || prodData.shop_slug || prodData.shop?.slug;
          const targetId = prodData.shop_id || prodData.shopId || prodData.shop?.id;

          if (!shop || (targetId && shop.id !== targetId)) {
            if (targetSlug && targetSlug !== 'store') {
              try {
                const shopData = await shopApi.getShopBySlug(targetSlug);
                if (isMounted && shopData) {
                  const extractedShop = shopData?.data?.shop || shopData?.data || shopData;
                  setShop(extractedShop);
                }
              } catch {
                if (targetId) {
                  try {
                    const shopData2 = await shopApi.getShopBySlug(targetId);
                    if (isMounted && shopData2) {
                      const extractedShop2 = shopData2?.data?.shop || shopData2?.data || shopData2;
                      setShop(extractedShop2);
                    }
                  } catch {}
                }
              }
            } else if (targetId) {
              try {
                const shopData2 = await shopApi.getShopBySlug(targetId);
                if (isMounted && shopData2) {
                  const extractedShop2 = shopData2?.data?.shop || shopData2?.data || shopData2;
                  setShop(extractedShop2);
                }
              } catch {}
            }
          }
        } else if (!product) {
          setError(isHindi ? 'यह सामान उपलब्ध नहीं है या हटा दिया गया है' : 'Product does not exist or has been removed');
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

  // Fetch similar products from the same store / catalog
  useEffect(() => {
    let isMounted = true;
    async function loadSimilar() {
      if (!product) return;
      try {
        const targetSlug = slug || product.shop_slug || shop?.slug;
        let rawList = [];
        if (targetSlug && targetSlug !== 'store') {
          try {
            const res = await productApi.listByShopSlug(targetSlug, { limit: 12 });
            rawList = extractArray(res, 'products');
          } catch (e) {
            console.warn('Failed to load shop products for similar, trying catalog fallback:', e);
          }
        }

        // If shop products are few (< 2) or call failed, fetch from category / catalog
        if (rawList.length <= 1) {
          try {
            const catId = product.category_id || product.category;
            const res = await productApi.listProducts({
              category_id: typeof catId === 'string' ? catId : undefined,
              limit: 12,
            });
            const catList = extractArray(res, 'products');
            if (catList.length > 0) {
              rawList = [...rawList, ...catList];
            }
          } catch (e) {
            console.warn('Catalog fallback error for similar products:', e);
          }
        }

        const currentId = String(product.id || productId);
        const seen = new Set();
        const filtered = rawList.filter((item) => {
          const itemId = String(item.id || item.product_id);
          if (itemId === currentId || seen.has(itemId)) return false;
          seen.add(itemId);
          return true;
        });

        if (isMounted) {
          setSimilarProducts(filtered.slice(0, 10));
        }
      } catch (err) {
        console.warn('Failed to load similar products:', err);
      }
    }

    loadSimilar();
    return () => { isMounted = false; };
  }, [product?.id, slug, shop?.slug, product?.shop_slug, product?.category_id]);

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
    <AppLayout
      title={product.name}
      showBack={true}
      customHeader={
        <header className="product-detail-flipkart-header">
          <div className="product-detail-header-inner">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/');
                }
              }}
              className="product-detail-back-btn"
              title={isHindi ? 'पीछे जाएं' : 'Back'}
              aria-label={isHindi ? 'पीछे जाएं' : 'Back'}
            >
              <ArrowLeft size={22} />
            </button>

            {/* Interactive Search Bar matching Home Dashboard */}
            <div
              className="product-detail-search-wrapper"
              role="search"
            >
              <form
                className="product-detail-search-bar"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearchSubmit();
                }}
              >
                {isLoadingSuggestions ? (
                  <Loader2 size={17} className="search-bar-icon animate-spin" color="var(--color-primary, #2563eb)" />
                ) : (
                  <Search size={17} className="search-bar-icon" />
                )}
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSuggestionsOpen(true);
                  }}
                  onFocus={() => setIsSuggestionsOpen(true)}
                  placeholder={isHindi ? 'सामान या दुकानें खोजें...' : 'Search for products'}
                  className="product-detail-search-input"
                  aria-label={isHindi ? 'सामान या दुकानें खोजें' : 'Search for products'}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchSuggestions([]);
                    }}
                    className="product-detail-search-clear-btn"
                    title={isHindi ? 'हटाएं' : 'Clear search'}
                    aria-label={isHindi ? 'हटाएं' : 'Clear search'}
                  >
                    <X size={15} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleVoiceSearch}
                  className="product-detail-search-mic-btn"
                  title={isHindi ? 'बोलकर खोजें' : 'Voice search'}
                  aria-label={isHindi ? 'बोलकर खोजें' : 'Voice search'}
                  style={isVoiceListening ? { color: '#dc2626', backgroundColor: '#fee2e2' } : {}}
                >
                  {isVoiceListening ? <MicOff size={15} /> : <Mic size={15} />}
                </button>
              </form>

              {/* Autocomplete & Recent Searches Dropdown */}
              <SearchSuggestionsDropdown
                isOpen={isSuggestionsOpen}
                onClose={() => setIsSuggestionsOpen(false)}
                query={searchQuery}
                suggestions={searchSuggestions}
                isLoading={isLoadingSuggestions}
                onSelectSuggestion={(term) => {
                  setSearchQuery(term);
                  handleSearchSubmit(term);
                }}
                recentSearches={recentSearches}
                onSelectRecent={(term) => {
                  setSearchQuery(term);
                  handleSearchSubmit(term);
                }}
                onRemoveRecent={(term) => {
                  setRecentSearches(removeRecentSearch(term));
                }}
                onClearAllRecent={() => {
                  setRecentSearches(clearAllRecentSearches());
                }}
                isHindi={isHindi}
                style={{
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  width: '100%',
                  zIndex: 100,
                }}
              />
            </div>

            {/* Cart Trigger Button with badge */}
            <button
              type="button"
              onClick={openCart}
              className="product-detail-cart-btn"
              title={isHindi ? 'कार्ट देखें' : 'Cart'}
              aria-label={isHindi ? 'कार्ट देखें' : 'Cart'}
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="product-detail-cart-badge">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </header>
      }
    >
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

        {/* Product Trust, Comparison and Reservation Experience */}
        <ProductTrustDetailView
          product={product}
          shop={shop}
          onReserve={handleReserve}
          initialReserveOpen={Boolean(location.state?.autoReserve)}
        />

        {/* Redesigned Useful Similar Products Carousel (Larger Cards, Crisp Images, Price & Distance) */}
        {similarProducts.length > 0 && (
          <div style={{ marginTop: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
                  {isHindi ? 'मिलते-जुलते सामान (Similar Products)' : 'Similar Products'}
                </h3>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted, #64748b)', marginTop: '2px' }}>
                  {isHindi ? 'समान श्रेणी और आस-पास की दुकानों के बेहतरीन विकल्प' : 'Handpicked recommendations based on your choice'}
                </div>
              </div>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--color-primary, #2563eb)', backgroundColor: 'var(--color-primary-light, #eff6ff)', padding: '3px 9px', borderRadius: '12px' }}>
                {similarProducts.length} {isHindi ? 'विकल्प' : 'Items'}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '14px',
                overflowX: 'auto',
                paddingBottom: '12px',
                paddingTop: '4px',
                paddingLeft: '2px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {similarProducts.map((item) => {
                const itemId = item.id || item.product_id;
                const itemPrice = Number(item.price || item.selling_price || 0);
                const firstImg = extractFirstImage(item.images || item.image || item.image_url);
                const sLat = item.shop_latitude || item.shop?.latitude || shop?.latitude;
                const sLng = item.shop_longitude || item.shop?.longitude || shop?.longitude;
                const sName = item.shop_name || item.shop?.name || storeName;

                const distKm = (sLat && sLng && coords?.lat && coords?.lng)
                  ? calculateDistanceKm(coords.lat, coords.lng, sLat, sLng)
                  : null;

                return (
                  <div
                    key={itemId}
                    onClick={() => {
                      navigate(`/shop/${storeSlug || item.shop_slug || 'store'}/product/${itemId}`, {
                        state: { product: item, shop },
                      });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      flex: '0 0 205px',
                      width: '205px',
                      backgroundColor: 'var(--bg-surface, #ffffff)',
                      border: '1.5px solid var(--border-subtle, #e2e8f0)',
                      borderRadius: '18px',
                      padding: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease-in-out',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      {/* 1. Large Crisp Image Stage (175px Height for Visual Discovery) */}
                      <div
                        style={{
                          width: '100%',
                          height: '175px',
                          backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                          borderRadius: '14px',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '10px',
                          border: '1px solid var(--border-subtle, #f1f5f9)',
                        }}
                      >
                        {firstImg ? (
                          <img
                            src={getImageUrl(firstImg)}
                            alt={item.name}
                            loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }}
                          />
                        ) : (
                          <Package size={40} color="#94a3b8" style={{ opacity: 0.35 }} />
                        )}
                      </div>

                      {/* 2. Product Name */}
                      <div
                        style={{
                          fontSize: '0.86rem',
                          fontWeight: 800,
                          color: 'var(--text-primary, #0f172a)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '2.5em',
                          lineHeight: 1.25,
                          marginBottom: '8px',
                        }}
                        title={item.name}
                      >
                        {item.name}
                      </div>
                    </div>

                    <div>
                      {/* 3. Price */}
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary, #0f172a)', marginBottom: '4px' }}>
                        ₹{itemPrice.toFixed(0)}
                      </div>

                      {/* 4. Distance */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          color: 'var(--text-secondary, #64748b)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <MapPin size={12} color="var(--color-primary, #2563eb)" style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {distKm !== null
                            ? `${distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)} km`} away`
                            : sName}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ProductDetailScreen;
