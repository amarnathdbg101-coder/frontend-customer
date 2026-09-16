import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Store,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  QrCode,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { reservationApi } from '../../api/reservation.api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { EmptyState } from '../../components/ui/EmptyState';
import { RealQRCode } from '../../components/common/RealQRCode';

export const ReservationsScreen = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, isHindi } = useLanguage();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTokenQR, setSelectedTokenQR] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchReservations();
  }, [isAuthenticated]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await reservationApi.getMyReservations();
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setReservations(list);
    } catch (err) {
      console.error('Failed to load reservations:', err);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm(t('checkout.cancel_confirm'))) return;
    try {
      await reservationApi.cancelReservation(id);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || (isHindi ? 'निरस्तीकरण विफल रहा' : 'Cancellation failed'));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return <span className="badge badge-success">{t('checkout.status_ready')}</span>;
      case 'completed':
        return <span className="badge badge-secondary">{t('checkout.status_completed')}</span>;
      case 'cancelled':
        return <span className="badge badge-danger">{t('checkout.status_cancelled')}</span>;
      default:
        return <span className="badge badge-warning">{t('checkout.status_pending')}</span>;
    }
  };

  return (
    <AppLayout title={t('nav.reservations')} subtitle={isHindi ? 'काउंटर पिकअप टोकन एवं आर्डर स्थिति' : 'Pickup tokens and live order status'}>
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {t('common.loading')}
        </div>
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={48} color="var(--text-muted)" />}
          title={isHindi ? 'कोई सक्रिय पिकअप आरक्षण नहीं है' : 'No Active Pickup Reservations'}
          message={isHindi ? 'नजदीकी दुकानों से सामान आरक्षित करें और काउंटर से तुरंत प्राप्त करें।' : 'Reserve items from nearby shops and collect at the counter.'}
          actionLabel={t('nav.explore')}
          onAction={() => navigate('/')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reservations.map((res) => (
            <div
              key={res.id}
              style={{
                backgroundColor: 'var(--bg-card, var(--bg-surface))',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {res.product_name || (isHindi ? 'आरक्षित उत्पाद' : 'Reserved Item')}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Store size={13} />
                    <span>{res.shop_name || (isHindi ? 'प्रमाणित स्टोर' : 'Verified Store')}</span>
                  </div>
                </div>
                {getStatusBadge(res.status)}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: '10px', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('checkout.token_number', { token: res.token || res.id.slice(0, 6).toUpperCase() })}</span>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                    ₹{res.total_price || res.price}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTokenQR(res)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <QrCode size={16} />
                  <span>{isHindi ? 'टोकन क्यूआर' : 'Token QR'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {isHindi ? `मात्रा: ${res.quantity || 1} नग` : `Quantity: ${res.quantity || 1} units`}
                </span>

                {res.status === 'pending' && (
                  <button
                    onClick={() => handleCancel(res.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--color-danger)' }}
                  >
                    {t('checkout.cancel_reservation')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Token QR Modal */}
      {selectedTokenQR && (
        <div className="modal-backdrop" onClick={() => setSelectedTokenQR(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: 800 }}>
              {t('checkout.pickup_otp')}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {isHindi ? 'दुकान के काउंटर पर यह क्यूआर कोड अथवा टोकन क्रमांक दिखाएं:' : 'Show this QR code or token number at the shop counter:'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <RealQRCode value={`SHOPME-RESERVATION:${selectedTokenQR.id}`} size={180} />
            </div>

            <div style={{ padding: '8px 16px', background: 'var(--bg-surface-subtle)', borderRadius: '10px', display: 'inline-block', fontWeight: 900, fontSize: '1.2rem', color: 'var(--color-primary)', letterSpacing: '2px', marginBottom: '16px' }}>
              #{selectedTokenQR.token || selectedTokenQR.id.slice(0, 6).toUpperCase()}
            </div>

            <button onClick={() => setSelectedTokenQR(null)} className="btn btn-primary" style={{ width: '100%' }}>
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
export default ReservationsScreen;
