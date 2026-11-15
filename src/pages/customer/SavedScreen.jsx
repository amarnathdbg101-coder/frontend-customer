import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Store, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useSaved } from '../../context/SavedContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { ProductCard } from '../../components/cards/ProductCard';
import { getImageUrl } from '../../utils/imageUrl';
import { EmptyState, Card } from '../../components/ui';

export const SavedScreen = () => {
  const navigate = useNavigate();
  const { savedProducts, savedShops, isProductSaved, toggleSaveProduct, toggleSaveShop } = useSaved();
  const { t, isHindi } = useLanguage();

  const [activeTab, setActiveTab] = useState('products');

  return (
    <AppLayout
      title={isHindi ? 'पसंदीदा सामान व दुकानें' : 'Saved & Wishlist'}
      subtitle={isHindi ? 'आपके द्वारा सहेजे गए उत्पाद व पसंदीदा दुकानें' : 'Your bookmarked local items & favorite stores'}
    >
      <title>{t('nav.saved')} — ShopSilo</title>

      {/* Segmented Tab Switcher */}
      <div
        role="tablist"
        aria-label={isHindi ? 'सहेजी गई सूचियां' : 'Saved lists'}
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '20px',
          backgroundColor: '#f1f5f9',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'products'}
          onClick={() => setActiveTab('products')}
          style={{
            flex: 1,
            padding: '9px 14px',
            borderRadius: '9px',
            border: 'none',
            backgroundColor: activeTab === 'products' ? '#ffffff' : 'transparent',
            color: activeTab === 'products' ? '#0f172a' : '#64748b',
            fontWeight: activeTab === 'products' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: activeTab === 'products' ? '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)' : 'none',
            transition: 'all 0.18s ease-in-out',
          }}
        >
          <span>{isHindi ? 'सहेजे गए सामान' : 'Saved Products'}</span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              backgroundColor: activeTab === 'products' ? '#0f172a' : '#e2e8f0',
              color: activeTab === 'products' ? '#ffffff' : '#475569',
              padding: '2px 7px',
              borderRadius: '9999px',
              minWidth: '20px',
              textAlign: 'center',
              lineHeight: 1.3,
              transition: 'all 0.18s ease-in-out',
            }}
          >
            {savedProducts.length}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'shops'}
          onClick={() => setActiveTab('shops')}
          style={{
            flex: 1,
            padding: '9px 14px',
            borderRadius: '9px',
            border: 'none',
            backgroundColor: activeTab === 'shops' ? '#ffffff' : 'transparent',
            color: activeTab === 'shops' ? '#0f172a' : '#64748b',
            fontWeight: activeTab === 'shops' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: activeTab === 'shops' ? '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)' : 'none',
            transition: 'all 0.18s ease-in-out',
          }}
        >
          <span>{isHindi ? 'पसंदीदा दुकानें' : 'Favorite Shops'}</span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              backgroundColor: activeTab === 'shops' ? '#0f172a' : '#e2e8f0',
              color: activeTab === 'shops' ? '#ffffff' : '#475569',
              padding: '2px 7px',
              borderRadius: '9999px',
              minWidth: '20px',
              textAlign: 'center',
              lineHeight: 1.3,
              transition: 'all 0.18s ease-in-out',
            }}
          >
            {savedShops.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'products' ? (
        savedProducts.length === 0 ? (
          <EmptyState
            icon={Heart}
            title={isHindi ? 'कोई सामान सहेजा नहीं गया है' : 'No saved products yet'}
            description={
              isHindi
                ? 'उत्पादों पर दिल (Heart) आइकन दबाकर उन्हें अपनी विशलिस्ट में जोड़ें।'
                : 'Browse neighborhood stores and tap the heart icon on any product to save it here.'
            }
            action={
              <button
                type="button"
                onClick={() => navigate('/')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  padding: '9px 18px',
                  borderRadius: '9px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(15, 23, 42, 0.12)',
                }}
              >
                <span>{isHindi ? 'सामान खोजें' : 'Explore Products'}</span>
                <ArrowRight size={14} />
              </button>
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
          title={isHindi ? 'कोई दुकान सहेजी नहीं गई है' : 'No favorite shops saved'}
          description={
            isHindi
              ? 'अपनी पसंदीदा स्थानीय दुकानों को बुकमार्क करें ताकि आप उनके नए ऑफर्स आसानी से देख सकें।'
              : 'Bookmark your favorite neighborhood stores to quickly check their latest inventory & offers.'
          }
          action={
            <button
              type="button"
              onClick={() => navigate('/shops')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                padding: '9px 18px',
                borderRadius: '9px',
                fontSize: '0.84rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(15, 23, 42, 0.12)',
              }}
            >
              <span>{isHindi ? 'दुकानें देखें' : 'Explore Stores'}</span>
              <ArrowRight size={14} />
            </button>
          }
        />
      ) : (
        <div
          className="saved-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '16px',
          }}
        >
          {savedShops.map((s) => (
            <Card
              key={s.id}
              padding="18px"
              style={{
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        backgroundColor: '#f8fafc',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid #e2e8f0',
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
                        <Store size={22} color="#475569" />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.96rem',
                          color: '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {s.name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: '#64748b',
                          marginTop: '2px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {s.category || (isHindi ? 'जनरल स्टोर' : 'General Store')}
                      </div>
                      <div
                        style={{
                          fontSize: '0.74rem',
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '3px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <MapPin size={11} color="#94a3b8" />
                        <span>{s.address || s.city || (isHindi ? 'स्थानीय क्षेत्र' : 'Local Area')}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSaveShop(s)}
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fee2e2',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      color: '#ef4444',
                      padding: '7px',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.15s ease',
                    }}
                    title={t('saved.remove_saved')}
                    aria-label={isHindi ? `${s.name} को पसंदीदा से हटाएं` : `Remove ${s.name} from saved shops`}
                  >
                    <Heart size={16} fill="#ef4444" strokeWidth={0} />
                  </button>
                </div>
              </div>

              {/* Actions Row */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                {s.phone && (
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#334155',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onClick={() => window.open(`tel:${s.phone}`)}
                  >
                    <Phone size={13} color="#475569" />
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
                    gap: '5px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
                    transition: 'background-color 0.15s ease',
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
