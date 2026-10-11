import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Store, Phone, Navigation, MapPin } from 'lucide-react';
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('products')}
          className={`tab-pill ${activeTab === 'products' ? 'active' : ''}`}
          style={{ flex: 1 }}
        >
          {isHindi ? 'सहेजे गए सामान' : 'Saved Products'} ({savedProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('shops')}
          className={`tab-pill ${activeTab === 'shops' ? 'active' : ''}`}
          style={{ flex: 1 }}
        >
          {isHindi ? 'पसंदीदा दुकानें' : 'Favorite Shops'} ({savedShops.length})
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
                onClick={() => setInspectedProduct(p)}
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
        <div className="saved-grid">
          {savedShops.map((s) => (
            <Card
              key={s.id}
              padding="16px"
              style={{
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
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
                        backgroundColor: 'var(--color-primary-light)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid var(--border-subtle)',
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
                        <Store size={22} color="var(--color-primary)" />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.name}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                        {s.category || (isHindi ? 'जनरल स्टोर' : 'General Store')}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <MapPin size={11} /> {s.address || s.city || (isHindi ? 'स्थानीय क्षेत्र' : 'Local Area')}
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
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                {s.phone && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Phone}
                    style={{ flex: 1 }}
                    onClick={() => window.open(`tel:${s.phone}`)}
                  >
                    {t('common.call_shop')}
                  </Button>
                )}
                {s.latitude && s.longitude && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Navigation}
                    style={{ flex: 1 }}
                    onClick={() => window.open(`https://maps.google.com/?q=${s.latitude},${s.longitude}`, '_blank')}
                  >
                    {t('common.directions')}
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  style={{ flex: 1.2 }}
                  onClick={() => navigate(`/shop/${s.slug}`)}
                >
                  {t('products.visit_storefront')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {inspectedProduct && (
        <ProductDetailModal
          product={inspectedProduct}
          onClose={() => setInspectedProduct(null)}
          onReserve={async ({ product, quantity, hold_hours, notes }) => {
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
              alert(`${t('checkout.reservation_success_title')} ${t('checkout.pickup_otp')}: ${res.pickup_code || res.reservation_number || 'OK'}`);
              setInspectedProduct(null);
            } catch (err) {
              alert(err.message || t('common.error'));
            }
          }}
          isMerchant={false}
        />
      )}
    </AppLayout>
  );
};
export default SavedScreen;
