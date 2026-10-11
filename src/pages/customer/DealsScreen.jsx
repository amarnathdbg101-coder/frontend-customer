import { localCache, CACHE_KEYS, DEFAULT_TTL } from '../../utils/localCache.js';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, MapPin, Store, Navigation, Sparkles, CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { dealsApi } from '../../api/deals.api';
import { AppLayout } from '../../components/layout/AppLayout';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { calculateDistanceKm, formatDistance, formatTravelTime, getDirectionsUrl } from '../../utils/distance';
import { getImageUrl } from '../../utils/imageUrl';

const CATEGORIES = ['All', 'Electronics', 'Kirana & Grocery', 'Pharmacy', 'Fashion', 'Home & Kitchen'];

// Fallback festival coupons and neighborhood deals if store deals are sparse
const DEFAULT_FESTIVAL_DEALS = [
  {
    id: 'deal-festive-20',
    title: 'Festival Special: Flat 20% OFF',
    titleHi: 'त्योहार विशेष: सीधे 20% की बचत',
    description: 'Save 20% on your entire counter pickup order at participating local stores.',
    descriptionHi: 'स्थानीय दुकानों पर काउंटर पिकअप ऑर्डर पर सीधे 20% की छूट पाएं।',
    discount_text: 'FLAT 20% OFF',
    code: 'FESTIVE20',
    shop_name: 'Gupta Kirana & General Store',
    shop_category: 'Kirana & Grocery',
    shop_slug: 'gupta-kirana',
    shop_latitude: 28.6139,
    shop_longitude: 77.2090,
  },
  {
    id: 'deal-bogo-free',
    title: 'Super Saver: Buy 1 Get 1 Free',
    titleHi: 'सुपर सेवर: एक खरीदें, एक मुफ्त पाएं',
    description: 'Buy 1 Get 1 Free on select daily groceries and household essentials.',
    descriptionHi: 'दैनिक किराना और घरेलू सामानों पर एक खरीदें, एक मुफ्त ऑफर।',
    discount_text: 'BUY 1 GET 1',
    code: 'BOGO50',
    shop_name: 'Sharma Supermarket',
    shop_category: 'Kirana & Grocery',
    shop_slug: 'sharma-supermarket',
    shop_latitude: 28.6145,
    shop_longitude: 77.2105,
  },
  {
    id: 'deal-flat-50',
    title: 'Weekend Saver: Flat ₹50 OFF',
    titleHi: 'सप्ताहांत बचत: सीधे ₹50 की छूट',
    description: 'Instant ₹50 discount on orders above ₹250. Valid for instant counter pickup.',
    descriptionHi: '₹250 से अधिक के ऑर्डर पर सीधे ₹50 की छूट। इंस्टेंट काउंटर पिकअप पर मान्य।',
    discount_text: 'FLAT ₹50 OFF',
    code: 'SAVE50',
    shop_name: 'Verma Provisions & Dairy',
    shop_category: 'Dairy & Provisions',
    shop_slug: 'verma-provisions',
    shop_latitude: 28.6120,
    shop_longitude: 77.2080,
  },
];

export const DealsScreen = () => {
  const navigate = useNavigate();
  const { coords } = useLocation();
  const { isHindi, t } = useLanguage();
  const { appliedCoupon, applyCoupon, removeCoupon, openCart } = useCart();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [claimedToast, setClaimedToast] = useState(null);

  useEffect(() => {
    loadDeals();
  }, [selectedCategory]);

  const loadDeals = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      const data = await dealsApi.listDeals(params);
      const list = Array.isArray(data) ? data : (Array.isArray(data?.offers) ? data.offers : []);
      if (list.length > 0) {
        setDeals(list);
      } else {
        setDeals(DEFAULT_FESTIVAL_DEALS);
      }
    } catch (err) {
      console.warn('Deals API fallback:', err);
      setDeals(DEFAULT_FESTIVAL_DEALS);
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
      return { background: 'linear-gradient(135deg, #ec4899, #f43f5e)', color: '#fff' };
    }
    if (lower.includes('%') || lower.includes('flat') || lower.includes('off')) {
      return { background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' };
    }
    return { background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff' };
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
            boxShadow: '0 8px 20px rgba(6, 95, 70, 0.3)',
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
              padding: '4px 10px',
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
              border: selectedCategory === cat ? 'none' : '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: selectedCategory === cat ? 'var(--color-primary)' : 'var(--bg-surface)',
              color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
              boxShadow: selectedCategory === cat ? '0 2px 8px rgba(79, 70, 229, 0.3)' : 'none',
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
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <Tag size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            {isHindi ? 'अभी कोई सक्रिय ऑफर उपलब्ध नहीं है' : 'No Active Deals Nearby Right Now'}
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            {isHindi
              ? 'आस-पास की दुकानों के नए ऑफर्स यहाँ लाइव दिखेंगे। थोड़ी देर बाद पुनः देखें!'
              : 'Special deals posted by neighborhood merchants will appear here live.'}
          </p>
        </div>
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
                  padding: '18px',
                  borderRadius: 'var(--radius-lg)',
                  position: 'relative',
                  overflow: 'hidden',
                  border: isClaimed ? '2px solid #10b981' : '1.5px solid var(--border-subtle)',
                  boxShadow: isClaimed ? '0 6px 20px rgba(16, 185, 129, 0.15)' : 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                  backgroundColor: 'var(--bg-surface)',
                }}
              >
                <div>
                  {/* Offer Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span
                      style={{
                        ...getBadgeStyle(deal.discount_text),
                        fontSize: '0.78rem',
                        fontWeight: 900,
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        letterSpacing: '0.5px',
                      }}
                    >
                      <Sparkles size={14} /> {deal.discount_text || (isHindi ? 'विशेष ऑफर' : 'Special Deal')}
                    </span>

                    {travel && (
                      <span
                        style={{
                          fontSize: '0.74rem',
                          color: travel.mode === 'walk' ? '#047857' : '#1d4ed8',
                          backgroundColor: travel.mode === 'walk' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                          border: travel.mode === 'walk' ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(59, 130, 246, 0.25)',
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
                  <div style={{ fontWeight: 800, fontSize: '1.08rem', color: 'var(--text-primary)', marginBottom: '6px', lineHeight: 1.3 }}>
                    {isHindi && deal.titleHi ? deal.titleHi : deal.title}
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.45 }}>
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
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#065f46',
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={15} color="#10b981" />
                        {isHindi ? 'कूपन क्लेम हो गया!' : 'Coupon Claimed!'}
                      </span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#b91c1c',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: '2px 6px',
                        }}
                      >
                        {isHindi ? 'हटाएं' : 'Remove'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleClaimCoupon(deal)}
                      className="btn btn-primary btn-block"
                      style={{
                        padding: '10px 14px',
                        fontSize: '0.86rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                      }}
                    >
                      <Tag size={15} />
                      <span>{isHindi ? '🎟️ कूपन क्लेम करें' : '🎟️ Claim Coupon'}</span>
                    </button>
                  )}
                </div>

                {/* Participating Shop Info & Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                    gap: '10px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    onClick={() => deal.shop_slug && navigate(`/shop/${deal.shop_slug}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', minWidth: 0, flex: 1 }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--color-primary-light)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {deal.shop_logo_url ? (
                        <img loading="lazy" decoding="async"
                          src={getImageUrl(deal.shop_logo_url)}
                          alt={deal.shop_name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Store size={18} color="var(--color-primary)" />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {deal.shop_name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {deal.shop_category || (isHindi ? 'स्थानीय दुकान' : 'Local Store')}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {deal.shop_latitude && deal.shop_longitude && (
                      <a
                        href={getDirectionsUrl(deal.shop_latitude, deal.shop_longitude, deal.shop_name)}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: '#3b82f6',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'none',
                        }}
                      >
                        <Navigation size={12} /> {isHindi ? 'रास्ता' : 'Directions'}
                      </a>
                    )}
                    {deal.shop_slug && (
                      <button
                        onClick={() => navigate(`/shop/${deal.shop_slug}`)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '6px 12px', fontSize: '0.76rem', fontWeight: 700 }}
                      >
                        {isHindi ? 'दुकान देखें' : 'Visit Shop'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};
export default DealsScreen;
