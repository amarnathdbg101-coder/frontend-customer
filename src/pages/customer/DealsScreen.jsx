import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, MapPin, Store, Navigation, Sparkles } from 'lucide-react';
import { dealsApi } from '../../api/deals.api';
import { AppLayout } from '../../components/layout/AppLayout';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { calculateDistanceKm, formatDistance } from '../../utils/distance';
import { getImageUrl } from '../../utils/imageUrl';

const CATEGORIES = ['All', 'Electronics', 'Kirana & Grocery', 'Pharmacy', 'Fashion', 'Home & Kitchen'];

export const DealsScreen = () => {
  const navigate = useNavigate();
  const { coords } = useLocation();
  const { isHindi, t } = useLanguage();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

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
      setDeals(list);
    } catch (err) {
      console.error('Failed to load deals:', err);
      setDeals([]);
    } finally {
      setLoading(false);
    }
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
      title={isHindi ? 'लाइव बचत व ऑफर्स' : 'Deals & Flash Offers'}
      subtitle={isHindi ? 'अपने आस-पास की दुकानों के विशेष डिस्काउंट' : 'Exclusive discounts from nearby stores'}
    >
      <title>{isHindi ? 'लाइव डील्स — शॉपसिलो' : 'Live Deals — ShopSilo'}</title>

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
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: selectedCategory === cat ? 'var(--color-primary)' : 'var(--bg-surface)',
              color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
              border: selectedCategory === cat ? 'none' : '1px solid var(--border-subtle)',
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
        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
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

            return (
              <div
                key={deal.id}
                className="card"
                style={{
                  margin: 0,
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1.5px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <div>
                  {/* Offer Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span
                      style={{
                        ...getBadgeStyle(deal.discount_text),
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Sparkles size={13} /> {deal.discount_text || (isHindi ? 'विशेष ऑफर' : 'Special Deal')}
                    </span>

                    {distKm != null && (
                      <span
                        style={{
                          fontSize: '0.74rem',
                          color: 'var(--text-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontWeight: 600,
                        }}
                      >
                        <MapPin size={12} color="var(--color-primary)" /> {formatDistance(distKm)}
                      </span>
                    )}
                  </div>

                  {/* Offer Title & Description */}
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '6px', lineHeight: 1.3 }}>
                    {deal.title}
                  </div>
                  {deal.description && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.45 }}>
                      {deal.description}
                    </p>
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
                    onClick={() => navigate(`/shop/${deal.shop_slug}`)}
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
                        href={`https://maps.google.com/?q=${deal.shop_latitude},${deal.shop_longitude}`}
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
                    <button
                      onClick={() => navigate(`/shop/${deal.shop_slug}`)}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '6px 12px', fontSize: '0.76rem', fontWeight: 700 }}
                    >
                      {isHindi ? 'दुकान देखें' : 'Visit Shop'}
                    </button>
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
