import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Store,
  MapPin,
  Clock,
  Phone,
  Search,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  Package,
  Eye,
  QrCode,
  ShieldAlert,
  Share2,
} from 'lucide-react';
import { shopApi } from '../../api/shop.api';
import { productApi } from '../../api/product.api';
import { reservationApi } from '../../api/reservation.api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { ProductDetailModal } from '../../components/common/ProductDetailModal';
import { ShopDetailModal } from '../../components/common/ShopDetailModal';
import { ShopReviewsSection } from '../../components/customer/ShopReviewsSection';
import { ShopQRModal } from '../../components/customer/ShopQRModal';
import { ReportModal } from '../../components/customer/ReportModal';
import { getImageUrl } from '../../utils/imageUrl';

export const StorefrontScreen = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, isHindi } = useLanguage();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [inspectedProduct, setInspectedProduct] = useState(null);
  const [showShopDetailModal, setShowShopDetailModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      loadShopAndProducts();
    }
  }, [slug]);

  const loadShopAndProducts = async () => {
    try {
      setLoading(true);
      const [shopData, prodData] = await Promise.all([
        shopApi.getShopBySlug(slug),
        productApi.listByShopSlug(slug),
      ]);
      setShop(shopData);
      const list = Array.isArray(prodData?.products) ? prodData.products : (Array.isArray(prodData) ? prodData : []);
      setProducts(list);
    } catch (err) {
      console.error('Failed to load shop:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async ({ productId, quantity, pickup_hours, notes }) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setError('');
    try {
      const res = await reservationApi.createReservation({
        shop_id: shop.id,
        product_id: productId,
        quantity: quantity || 1,
        pickup_hours: pickup_hours || 4,
        notes: notes || '',
      });
      setReservationSuccess(res);
      setInspectedProduct(null);
    } catch (err) {
      setError(err.response?.data?.message || (isHindi ? 'आरक्षण विफल रहा। कृपया पुनः प्रयास करें।' : 'Reservation failed. Please try again.'));
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AppLayout showBack={true} title={t('common.loading')}>
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {t('common.loading')}
        </div>
      </AppLayout>
    );
  }

  if (!shop) {
    return (
      <AppLayout showBack={true} title={t('common.error')}>
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <h3>{isHindi ? 'दुकान नहीं मिली' : 'Shop Not Found'}</h3>
          <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '16px' }}>
            {t('nav.explore')}
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showBack={true} title={shop.name} subtitle={shop.category || (isHindi ? 'स्थानीय दुकान' : 'Local Store')}>
      {/* Shop Hero Card */}
      <div style={{ backgroundColor: 'var(--bg-card, var(--bg-surface))', borderRadius: '16px', border: '1px solid var(--border-subtle)', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '14px', background: 'var(--bg-surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {shop.logo_url ? (
              <img src={getImageUrl(shop.logo_url)} alt={shop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Store size={36} color="var(--color-primary)" />
            )}
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{shop.name}</h2>
              <span className={`shop-card-status ${shop.is_active ? 'open' : 'closed'}`}>
                <span className="shop-card-status-dot" />
                {shop.is_active ? t('common.open_now') : t('common.closed')}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '4px' }}>
              <MapPin size={14} color="var(--color-primary)" />
              <span>{[shop.address, shop.city].filter(Boolean).join(', ')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '2px' }}>
              <Clock size={14} />
              <span>{shop.opening_time || '09:00'} - {shop.closing_time || '21:00'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => setShowQrModal(true)} className="btn btn-secondary btn-sm" title={isHindi ? 'दुकान का क्यूआर' : 'Shop QR'}>
              <QrCode size={16} />
              <span>{isHindi ? 'क्यूआर' : 'QR'}</span>
            </button>
            {shop.phone && (
              <a href={`tel:${shop.phone}`} className="btn btn-secondary btn-sm">
                <Phone size={15} />
                <span>{t('common.call_shop')}</span>
              </a>
            )}
            <button onClick={() => setShowReportModal(true)} className="btn btn-secondary btn-sm" style={{ color: 'var(--color-danger)' }} title={t('nav.report')}>
              <ShieldAlert size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Reservation Success Banner */}
      {reservationSuccess && (
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '12px', padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <CheckCircle size={24} color="#059669" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 4px 0', color: '#065f46', fontSize: '0.95rem' }}>
              {t('checkout.reservation_success_title')}
            </h4>
            <p style={{ margin: 0, color: '#047857', fontSize: '0.82rem' }}>
              {t('checkout.reservation_success_desc')}
            </p>
            <button
              onClick={() => navigate('/reservations')}
              className="btn btn-primary btn-sm"
              style={{ marginTop: '10px' }}
            >
              {t('checkout.view_token')}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #ef4444', borderRadius: '12px', padding: '12px', marginBottom: '16px', color: '#991b1b', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* In-Store Product Catalog Search */}
      <div style={{ marginBottom: '16px' }}>
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={isHindi ? `${shop.name} में सामान खोजें...` : `Search products in ${shop.name}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Products Grid */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '12px' }}>
        {t('products.catalog_title')} ({filteredProducts.length})
      </h3>

      {filteredProducts.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: '12px' }}>
          <Package size={40} color="var(--text-muted)" style={{ opacity: 0.5 }} />
          <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>{t('common.no_results')}</p>
        </div>
      ) : (
        <div className="products-grid" style={{ marginBottom: '30px' }}>
          {filteredProducts.map((product) => {
            const stock = product.stock_quantity ?? product.available_quantity ?? 0;
            const inStock = stock > 0;
            return (
              <div
                key={product.id}
                className="card card-clickable product-card"
                onClick={() => setInspectedProduct(product)}
              >
                <div className="product-card-image-box">
                  {product.images && product.images[0] ? (
                    <img src={getImageUrl(product.images[0])} alt={product.name} className="product-card-image" loading="lazy" />
                  ) : (
                    <Package size={44} color="var(--text-muted)" style={{ opacity: 0.35 }} />
                  )}
                  <span className={`product-card-stock-badge ${inStock ? 'in-stock' : 'out-of-stock'}`}>
                    {inStock ? t('products.in_stock') : t('products.out_of_stock')}
                  </span>
                </div>
                <div className="product-card-body">
                  <h4 className="product-card-name">{product.name}</h4>
                  <div className="product-card-price-row">
                    <span className="product-card-price">₹{product.price}</span>
                    {product.compare_price && product.compare_price > product.price && (
                      <span className="product-card-mrp">₹{product.compare_price}</span>
                    )}
                  </div>
                </div>
                <div className="product-card-actions">
                  <button className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                    <ShoppingBag size={14} />
                    <span>{t('products.reserve_for_pickup')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Verified Store Reviews Section */}
      <ShopReviewsSection shopId={shop.id} />

      {/* Modals */}
      {inspectedProduct && (
        <ProductDetailModal
          product={{ ...inspectedProduct, shop_name: shop.name, shop_phone: shop.phone }}
          onClose={() => setInspectedProduct(null)}
          onReserve={handleReserve}
        />
      )}

      {showQrModal && (
        <ShopQRModal
          shop={shop}
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
        />
      )}

      {showReportModal && (
        <ReportModal
          shop={shop}
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </AppLayout>
  );
};
export default StorefrontScreen;
