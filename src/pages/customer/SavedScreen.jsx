/**
 * Customer Saved Items & Followed Stores (Wishlist)
 * 
 * Features:
 * - Subtabs for saved products and followed stores
 * - Quick Add to Cart from Wishlist
 * - Direct storefront navigation & call/directions
 * - Full i18n support (English & Formal Hindi)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Store, Package, MapPin, Phone, Navigation, ShoppingCart } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useSaved } from '../../context/SavedContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { getImageUrl } from '../../utils/imageUrl';
import { ProductDetailModal } from '../../components/common/ProductDetailModal';
import { reservationApi } from '../../api/reservation.api';
import { useAuth } from '../../context/AuthContext';

export const SavedScreen = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { savedProducts, savedShops, toggleSaveProduct, toggleSaveShop } = useSaved();
  const { t, isHindi } = useLanguage();
  const { addItem, isInCart } = useCart();

  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'shops'
  const [inspectedProduct, setInspectedProduct] = useState(null);

  return (
    <AppLayout title={t('saved.title')} subtitle={t('saved.subtitle')}>
      <title>{t('saved.title')} — ShopSilo</title>

      {/* Subtabs */}
      <div
        style={{
          display: 'flex',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '4px',
          marginBottom: '18px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <button
          onClick={() => setActiveTab('products')}
          style={{
            flex: 1,
            padding: '9px 12px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'products' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'products' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          {t('saved.saved_products')} ({savedProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('shops')}
          style={{
            flex: 1,
            padding: '9px 12px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: activeTab === 'shops' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'shops' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          {t('saved.saved_shops')} ({savedShops.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'products' ? (
        savedProducts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
            <Heart size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              {t('saved.no_saved_products')}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              {t('saved.subtitle')}
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
              style={{
                marginTop: '16px',
                padding: '8px 24px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {t('saved.browse_deals')}
            </button>
          </div>
        ) : (
          <div className="saved-grid">
            {savedProducts.map((p) => {
              const inCart = isInCart(p.id);

              return (
                <div
                  key={p.id}
                  className="card card-clickable"
                  onClick={() => setInspectedProduct(p)}
                  style={{
                    margin: 0,
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {p.images && p.images[0] ? (
                      <img
                        src={getImageUrl(p.images[0])}
                        alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                      />
                    ) : (
                      <Package size={32} color="var(--text-muted)" style={{ opacity: 0.4 }} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--text-primary)', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                      <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                        ₹{p.price}
                      </span>
                      {(p.compare_price || p.mrp) && (p.compare_price || p.mrp) > p.price && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          ₹{p.compare_price || p.mrp}
                        </span>
                      )}
                    </div>
                    {p.shop_name && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Store size={12} color="var(--color-primary)" />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.shop_name}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleSaveProduct(p)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ef4444',
                        padding: '4px',
                      }}
                      title={t('saved.remove_saved')}
                    >
                      <Heart size={20} fill="#ef4444" />
                    </button>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => addItem(p, 1)}
                        className={`btn btn-sm ${inCart ? 'btn-success' : 'btn-secondary'}`}
                        style={{ padding: '6px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: 700 }}
                        title={t('products.add_to_cart')}
                      >
                        <ShoppingCart size={13} />
                      </button>

                      <button
                        onClick={() => setInspectedProduct(p)}
                        className="btn btn-primary btn-sm"
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                        }}
                      >
                        {t('common.view_details')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : savedShops.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <Store size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            {t('saved.no_saved_shops')}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            {t('saved.subtitle')}
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
            style={{
              marginTop: '16px',
              padding: '8px 24px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {t('nav.explore')}
          </button>
        </div>
      ) : (
        <div className="saved-grid">
          {savedShops.map((s) => (
            <div
              key={s.id}
              className="card"
              style={{
                margin: 0,
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
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
                  <a
                    href={`tel:${s.phone}`}
                    className="btn btn-secondary btn-sm"
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      textDecoration: 'none',
                    }}
                  >
                    <Phone size={12} /> {t('common.call_shop')}
                  </a>
                )}
                {s.latitude && s.longitude && (
                  <a
                    href={`https://maps.google.com/?q=${s.latitude},${s.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      flex: 1,
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      textDecoration: 'none',
                    }}
                  >
                    <Navigation size={12} /> {t('common.directions')}
                  </a>
                )}
                <button
                  onClick={() => navigate(`/shop/${s.slug}`)}
                  className="btn btn-primary btn-sm"
                  style={{
                    flex: 1.2,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                  }}
                >
                  {t('products.visit_storefront')}
                </button>
              </div>
            </div>
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
