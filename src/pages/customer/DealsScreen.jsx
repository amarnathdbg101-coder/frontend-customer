import { localCache, CACHE_KEYS, DEFAULT_TTL } from '../../utils/localCache.js';
import { cacheEvents, CACHE_EVENTS } from '../../utils/cacheEvents.js';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, MapPin, Store, Navigation, Sparkles, CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { dealsApi } from '../../api/deals.api';
import { AppLayout } from '../../components/layout/AppLayout';
import { EmptyState, Card, Badge, Button } from '../../components/ui';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { sessionState } from '../../utils/sessionState.js';
import { useScreenState } from '../../hooks/useScreenState.js';
import { calculateDistanceKm, formatDistance, formatTravelTime, getDirectionsUrl } from '../../utils/distance';
import { getImageUrl } from '../../utils/imageUrl';

const CATEGORIES = ['All', 'Electronics', 'Kirana & Grocery', 'Pharmacy', 'Fashion', 'Home & Kitchen'];

export const DealsScreen = () => {
  const navigate = useNavigate();
  const { coords } = useLocation();
  const { isHindi, t } = useLanguage();
  const { appliedCoupon, applyCoupon, removeCoupon, openCart } = useCart();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const savedDealsState = sessionState.getScreenState('deals', { selectedCategory: 'All' });
  const [selectedCategory, setSelectedCategory] = useState(savedDealsState.selectedCategory || 'All');

  useScreenState('deals', { restoreScroll: true, isDataReady: !loading });

  useEffect(() => {
    sessionState.saveScreenState('deals', { selectedCategory });
  }, [selectedCategory]);
  const [claimedToast, setClaimedToast] = useState(null);

  useEffect(() => {
    loadDeals();

    const unsubscribe = cacheEvents.on(CACHE_EVENTS.DEALS_MUTATED, () => {
      loadDeals();
    });

    return () => unsubscribe();
  }, [selectedCategory]);

  const loadDeals = async () => {
    const cacheKey = selectedCategory === 'All' ? CACHE_KEYS.DEALS : `${CACHE_KEYS.DEALS}_${selectedCategory}`;
    const cached = localCache.get(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      setDeals(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const params = {};
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      const data = await dealsApi.listDeals(params);
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.offers)) {
        list = data.offers;
      }

      setDeals(list);
      if (list.length > 0) {
        localCache.set(cacheKey, list, DEFAULT_TTL.DEALS);
      } else {
        localCache.remove(cacheKey);
      }
    } catch (err) {
      console.warn('Deals API error:', err);
      if (!cached || cached.length === 0) {
        setDeals([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClaimCoupon = (deal) => {
    applyCoupon({
      code: deal.code || deal.discount_text || 'PROMO',
      title: isHindi && deal.titleHi ? deal.titleHi : deal.title,
      discount_text: deal.discount_text,
      shop_id: deal.shop_id,
      shop_name: deal.shop_name,
    });
    setClaimedToast(deal.discount_text || deal.title);
    setTimeout(() => setClaimedToast(null), 3500);
  };

  const getBadgeStyle = (text = '') => {
    const lower = text.toLowerCase();
    if (lower.includes('bogo') || lower.includes('buy 1 get 1') || lower.includes('buy x')) {
      return { backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' };
    }
    if (lower.includes('%') || lower.includes('flat') || lower.includes('off')) {
      return { backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac' };
    }
    return { backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1' };
  };

  return (
    <AppLayout
      title={isHindi ? 'लाइव बचत व ऑफर्स' : 'Deals & Festival Coupons'}
      subtitle={isHindi ? 'अपने आस-पास की दुकानों के विशेष डिस्काउंट कूपन' : 'Exclusive discounts & coupons from nearby stores'}
    >
      <title>{isHindi ? 'लाइव डील्स — शॉपसिलो' : 'Live Deals — ShopSilo'}</title>

      {/* Claimed Toast Banner */}
      {claimedToast && (
        <div
          style={{
            position: 'sticky',
            top: '70px',
            zIndex: 40,
            backgroundColor: '#065f46',
            color: '#ffffff',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 20px rgba(6, 95, 70, 0.2)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: 800 }}>
            <CheckCircle size={18} color="#34d399" />
            <span>
              {isHindi
                ? `कूपन "${claimedToast}" क्लेम हो गया! चेकआउट पर स्वतः लागू होगा।`
                : `Coupon "${claimedToast}" claimed! Auto-applies at checkout.`}
            </span>
          </div>
          <button
            type="button"
            onClick={openCart}
            style={{
              backgroundColor: '#34d399',
              color: '#064e3b',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ShoppingBag size={14} />
            <span>{isHindi ? 'कार्ट देखें' : 'View Cart'}</span>
          </button>
        </div>
      )}

      {/* Category Pills */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '16px',
          scrollbarWidth: 'none',
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: selectedCategory === cat ? 'none' : '1px solid var(--border-subtle, #e2e8f0)',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              backgroundColor: selectedCategory === cat ? '#0f172a' : 'var(--bg-surface, #ffffff)',
              color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary, #475569)',
              boxShadow: selectedCategory === cat ? '0 2px 6px rgba(15, 23, 42, 0.15)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {cat === 'All' ? (isHindi ? 'सभी डील्स' : 'All Deals') : cat}
          </button>
        ))}
      </div>

      {/* Deals Feed */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {isHindi ? 'आस-पास के लाइव ऑफर्स खोजे जा रहे हैं...' : 'Discovering live discounts near you...'}
        </div>
      ) : deals.length === 0 ? (
        <EmptyState
          icon={Tag}
          title={isHindi ? 'अभी कोई सक्रिय ऑफर उपलब्ध नहीं है' : 'No Active Deals Nearby Right Now'}
          description={isHindi
            ? 'आस-पास की दुकानों के नए ऑफर्स यहाँ लाइव दिखेंगे। थोड़ी देर बाद पुनः देखें!'
            : 'Special deals posted by neighborhood merchants will appear here live.'}
        />
      ) : (
        <div className="deals-grid">
          {deals.map((deal) => {
            const distKm = calculateDistanceKm(
              coords?.lat,
              coords?.lng,
              deal.shop_latitude,
              deal.shop_longitude
            );
            const travel = formatTravelTime(distKm, isHindi);
            const isClaimed = appliedCoupon && (
              appliedCoupon.code === (deal.code || deal.discount_text) ||
              appliedCoupon.title === deal.title ||
              appliedCoupon.discount_text === deal.discount_text
            );

            return (
              <div
                key={deal.id}
                className="card"
                style={{
                  margin: 0,
                  padding: '16px',
                  borderRadius: '14px',
                  position: 'relative',
                  overflow: 'hidden',
                  border: isClaimed ? '2px solid #16a34a' : '1px solid var(--border-subtle, #e2e8f0)',
                  boxShadow: isClaimed ? '0 4px 16px rgba(22, 163, 74, 0.12)' : 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                  backgroundColor: 'var(--bg-surface, #ffffff)',
                }}
              >
                <div>
                  {/* Offer Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span
                      style={{
                        ...getBadgeStyle(deal.discount_text),
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <Sparkles size={13} /> {deal.discount_text || (isHindi ? 'विशेष ऑफर' : 'Special Deal')}
                    </span>

                    {travel && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: travel.mode === 'walk' ? '#15803d' : '#1d4ed8',
                          backgroundColor: travel.mode === 'walk' ? '#dcfce7' : '#eff6ff',
                          border: travel.mode === 'walk' ? '1px solid #86efac' : '1px solid #bfdbfe',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 700,
                        }}
                      >
                        <span>{travel.icon}</span>
                        <span>{travel.timeStr}</span>
                      </span>
                    )}
                  </div>

                  {/* Offer Title & Description */}
                  <div style={{ fontWeight: 800, fontSize: '1.02rem', color: 'var(--text-primary, #0f172a)', marginBottom: '6px', lineHeight: 1.3 }}>
                    {isHindi && deal.titleHi ? deal.titleHi : deal.title}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary, #475569)', marginBottom: '16px', lineHeight: 1.45 }}>
                    {isHindi && deal.descriptionHi ? deal.descriptionHi : deal.description}
                  </p>
                </div>

                {/* 1-Tap Claim Coupon Button */}
                <div style={{ marginBottom: '14px' }}>
                  {isClaimed ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        backgroundColor: '#dcfce7',
                        border: '1px solid #86efac',
                        color: '#15803d',
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={15} color="#16a34a" />
                        {isHindi ? 'कूपन क्लेम हो गया!' : 'Coupon Claimed!'}
                      </span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#dc2626',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        {isHindi ? 'हटाएं' : 'Remove'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleClaimCoupon(deal)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '10px',
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 800,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.15)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <Tag size={15} />
                      <span>{isHindi ? 'कूपन क्लेम करें (1-Tap Claim)' : 'Claim Coupon Code'}</span>
                    </button>
                  )}
                </div>

                {/* Shop Footer Line */}
                {deal.shop_name && (
                  <div
                    style={{
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-subtle, #e2e8f0)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary, #475569)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                      <Store size={14} color="#0f172a" />
                      <span>{deal.shop_name}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {deal.shop_latitude && deal.shop_longitude && (
                        <a
                          href={getDirectionsUrl(deal.shop_latitude, deal.shop_longitude, deal.shop_name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#2563eb',
                            textDecoration: 'none',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <Navigation size={12} />
                          <span>{isHindi ? 'रास्ता' : 'Maps'}</span>
                        </a>
                      )}

                      {deal.shop_slug && (
                        <button
                          type="button"
                          onClick={() => navigate(`/shop/${deal.shop_slug}`)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#0f172a',
                            fontWeight: 800,
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: '0.78rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                          }}
                        >
                          <span>{isHindi ? 'दुकान' : 'Store'}</span>
                          <ArrowRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default DealsScreen;
