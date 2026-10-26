import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Store, Phone, Navigation, MapPin, ArrowRight } from 'lucide-react';
import { useSaved } from '../../context/SavedContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { reservationApi } from '../../api/reservation.api';
import { cacheEvents, CACHE_EVENTS } from '../../utils/cacheEvents.js';
import { AppLayout } from '../../components/layout/AppLayout';
import { ProductCard } from '../../components/cards/ProductCard';
import { ProductDetailModal } from '../../components/common/ProductDetailModal';
import { getImageUrl } from '../../utils/imageUrl';
import { EmptyState, Card, Button } from '../../components/ui';

export const SavedScreen = () => {
  const navigate = useNavigate();
  const { savedProducts, savedShops, isProductSaved, toggleSaveProduct, toggleSaveShop } = useSaved();
  const { isAuthenticated } = useAuth();
  const { t, isHindi } = useLanguage();

  const [activeTab, setActiveTab] = useState('products');
  const [inspectedProduct, setInspectedProduct] = useState(null);

  return (
    <AppLayout
      title={isHindi ? 'पसंदीदा सामान व दुकानें' : 'Saved & Wishlist'}
      subtitle={isHindi ? 'आपके द्वारा सहेजे गए उत्पाद व पसंदीदा दुकानें' : 'Your bookmarked local items & favorite stores'}
    >
      <title>{t('nav.saved')} — ShopSilo</title>

      {/* Segmented Tab Switcher */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '16px',
          backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
          padding: '4px',
          borderRadius: '14px',
          border: '1px solid var(--border-subtle, #e2e8f0)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          style={{
            flex: 1,
            padding: '9px 12px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: activeTab === 'products' ? 'var(--bg-surface, #ffffff)' : 'transparent',
            color: activeTab === 'products' ? 'var(--text-primary, #0f172a)' : 'var(--text-secondary, #64748b)',
            fontWeight: 800,
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: activeTab === 'products' ? '0 2px 6px rgba(0, 0, 0, 0.05)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <span>{isHindi ? 'सहेजे गए सामान' : 'Saved Products'}</span>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              backgroundColor: activeTab === 'products' ? '#f1f5f9' : 'rgba(0,0,0,0.04)',
              color: activeTab === 'products' ? '#0f172a' : '#64748b',
              padding: '1px 6px',
              borderRadius: '6px',
            }}
          >
            {savedProducts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shops')}
          style={{
            flex: 1,
            padding: '9px 12px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: activeTab === 'shops' ? 'var(--bg-surface, #ffffff)' : 'transparent',
            color: activeTab === 'shops' ? 'var(--text-primary, #0f172a)' : 'var(--text-secondary, #64748b)',
            fontWeight: 800,
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: activeTab === 'shops' ? '0 2px 6px rgba(0, 0, 0, 0.05)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <span>{isHindi ? 'पसंदीदा दुकानें' : 'Favorite Shops'}</span>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              backgroundColor: activeTab === 'shops' ? '#f1f5f9' : 'rgba(0,0,0,0.04)',
              color: activeTab === 'shops' ? '#0f172a' : '#64748b',
              padding: '1px 6px',
              borderRadius: '6px',
            }}
          >
            {savedShops.length}
          </span>
        </button>
      </div>

      {activeTab === 'products' ? (
        savedProducts.length === 0 ? (
          <EmptyState
            icon={Heart}
            title={t('saved.empty_title')}
            description={t('saved.empty_desc')}
            action={
              <Button variant="primary" onClick={() => navigate('/')}>
                {t('nav.explore')}
              </Button>
            }
          />
        ) : (
          <div className="customer-product-grid">
            {savedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isSaved={isProductSaved(p.id)}
                onToggleSave={toggleSaveProduct}
                onClick={() => {
                  const targetSlug = p.shop_slug || 'store';
                  navigate('/shop/' + targetSlug + '/product/' + p.id, { state: { product: p } });
                }}
              />
            ))}
          </div>
        )
      ) : savedShops.length === 0 ? (
        <EmptyState
          icon={Store}
          title={t('saved.no_saved_shops')}
          description={t('saved.subtitle')}
          action={
            <Button variant="primary" onClick={() => navigate('/')}>
              {t('nav.explore')}
            </Button>
          }
        />
      ) : (
        <div className="saved-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {savedShops.map((s) => (
            <Card
              key={s.id}
              padding="16px"
              style={{
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                borderRadius: '14px',
                backgroundColor: 'var(--bg-surface, #ffffff)',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid var(--border-subtle, #e2e8f0)',
                      }}
                    >
                      {s.logo_url ? (
                        <img
                          loading="lazy"
                          decoding="async"
                          src={getImageUrl(s.logo_url)}
                          alt={s.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Store size={22} color="#0f172a" />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.name}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary, #475569)' }}>
                        {s.category || (isHindi ? 'जनरल स्टोर' : 'General Store')}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #94a3b8)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <MapPin size={11} color="#0f172a" /> {s.address || s.city || (isHindi ? 'स्थानीय क्षेत्र' : 'Local Area')}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSaveShop(s)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ef4444',
                      padding: '4px',
                      flexShrink: 0,
                    }}
                    title={t('saved.remove_saved')}
                  >
                    <Heart size={20} fill="#ef4444" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle, #e2e8f0)' }}>
                {s.phone && (
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f1f5f9',
                      color: '#0f172a',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                    onClick={() => window.open(`tel:${s.phone}`)}
                  >
                    <Phone size={13} />
                    <span>{t('common.call_shop')}</span>
                  </button>
                )}
                <button
                  type="button"
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/shop/${s.slug}`)}
                >
                  <span>{isHindi ? 'दुकान देखें' : 'Visit Store'}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default SavedScreen;
