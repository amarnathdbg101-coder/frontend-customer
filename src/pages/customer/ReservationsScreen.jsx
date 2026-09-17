/**
 * Customer Reservations (Pickup Orders) Screen
 * 
 * Features:
 * - List of counter pickup reservations and generated tokens
 * - Filter by status (All, Active, Completed, Cancelled)
 * - View QR Code & Verification Token Modal
 * - Cancel reservation action
 * - Full i18n support (English & Formal Hindi)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Clock, CheckCircle, XCircle, QrCode, X, Store, Package } from 'lucide-react';
import { reservationApi } from '../../api/reservation.api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { RealQRCode } from '../../components/common/RealQRCode';

export const ReservationsScreen = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, isHindi } = useLanguage();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatusTab, setActiveStatusTab] = useState('all'); // 'all', 'active', 'completed', 'cancelled'
  const [inspectToken, setInspectToken] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadReservations();
  }, [isAuthenticated]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationApi.listUserReservations();
      const list = Array.isArray(data?.reservations)
        ? data.reservations
        : Array.isArray(data)
        ? data
        : [];
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
      await reservationApi.cancelUserReservation(id);
      await loadReservations();
    } catch (err) {
      alert(err.message || t('common.error'));
    }
  };

  const formatExpiry = (expiresAt) => {
    if (!expiresAt) return 'Today';
    try {
      const d = new Date(expiresAt);
      if (isNaN(d.getTime())) return 'Today';
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Today';
    }
  };

  const filteredReservations = useMemo(() => {
    if (activeStatusTab === 'all') return reservations;
    if (activeStatusTab === 'active') {
      return reservations.filter((r) => r.status === 'pending' || r.status === 'active' || r.status === 'ready');
    }
    if (activeStatusTab === 'completed') {
      return reservations.filter((r) => r.status === 'completed' || r.status === 'verified');
    }
    if (activeStatusTab === 'cancelled') {
      return reservations.filter((r) => r.status === 'cancelled');
    }
    return reservations;
  }, [reservations, activeStatusTab]);

  if (!isAuthenticated) {
    return (
      <AppLayout title={t('nav.reservations')} subtitle={t('checkout.reservation_title')} showBack={true}>
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t('auth.login_title')}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', maxWidth: '360px', margin: '8px auto 20px auto' }}>
            {t('auth.login_required_reserve')}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ padding: '10px 28px', fontWeight: 700, borderRadius: 'var(--radius-full)' }}>
            {t('nav.login')}
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={t('nav.reservations')} subtitle={t('checkout.reservation_subtitle')} showBack={true}>
      <title>{t('nav.reservations')} — ShopSilo</title>

      {/* Status Tabs */}
      <div
        style={{
          display: 'flex',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '4px',
          marginBottom: '18px',
          border: '1px solid var(--border-subtle)',
          overflowX: 'auto',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        {[
          { id: 'all', label: `${t('common.view_all')} (${reservations.length})` },
          { id: 'active', label: t('checkout.status_pending') },
          { id: 'completed', label: t('checkout.status_completed') },
          { id: 'cancelled', label: t('checkout.status_cancelled') },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveStatusTab(tab.id)}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: activeStatusTab === tab.id ? 'var(--color-primary)' : 'transparent',
              color: activeStatusTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {t('common.loading')}
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
          <ShoppingBag size={48} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
          <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '4px' }}>
            {t('common.no_results')}
          </div>
          <p style={{ margin: 0, fontSize: '0.84rem' }}>
            {t('common.try_adjusting_search')}
          </p>
        </div>
      ) : (
        <div className="reservations-grid">
          {filteredReservations.map((r) => {
            const displayId =
              r.pickup_code ||
              r.reservation_number ||
              (typeof r.id === 'string' ? r.id.slice(0, 8) : r.id) ||
              'PKP-892';

            const isActive = r.status === 'active' || r.status === 'pending' || !r.status || r.status === 'ready';
            const isDone = r.status === 'completed' || r.status === 'verified';
            const isCancelled = r.status === 'cancelled';

            return (
              <div
                key={r.id || Math.random()}
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
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                        {r.product?.name || `Reservation #${displayId}`}
                      </div>
                      {r.shop?.name && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 700, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Store size={12} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.shop.name}</span>
                        </div>
                      )}
                    </div>

                    <span
                      className={`badge ${
                        isDone
                          ? 'badge-success'
                          : isCancelled
                          ? 'badge-danger'
                          : 'badge-warning'
                      }`}
                      style={{ flexShrink: 0 }}
                    >
                      {isDone ? t('checkout.status_completed') : isCancelled ? t('checkout.status_cancelled') : t('checkout.status_pending')}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{t('cart.quantity')}: <strong>{r.quantity || 1}</strong></span>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={12} color="var(--text-muted)" />
                      {t('products.hold_hours')}: {formatExpiry(r.expires_at)}
                    </span>
                  </div>
                </div>

                {/* Pickup Code & Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                    gap: '8px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        fontWeight: 900,
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.88rem',
                        letterSpacing: '1px',
                        display: 'inline-block',
                      }}
                    >
                      {displayId}
                    </span>

                    <button
                      type="button"
                      onClick={() => setInspectToken(r)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
                    >
                      <QrCode size={13} />
                      <span>{t('checkout.view_token')}</span>
                    </button>
                  </div>

                  {isActive && (
                    <button
                      onClick={() => handleCancel(r.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-danger, #ef4444)',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '4px 8px',
                      }}
                    >
                      {t('checkout.cancel_reservation')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect QR Code Modal */}
      {inspectToken && (
        <div className="modal-backdrop" onClick={() => setInspectToken(null)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', margin: '0 auto' }}>
            <div className="sheet-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {t('checkout.pickup_otp')}
              </h3>
              <button
                type="button"
                onClick={() => setInspectToken(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                <RealQRCode
                  value={`SHOP-PICKUP:${inspectToken.pickup_code || inspectToken.reservation_number || inspectToken.id}`}
                  size={180}
                  logoText="PICKUP"
                  showDownload={true}
                  downloadFilename={"pickup-code-" + (inspectToken.pickup_code || inspectToken.id)}
                />
              </div>

              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '3px' }}>
                {inspectToken.pickup_code || inspectToken.reservation_number || 'PKP-789'}
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>
                {t('checkout.pickup_instructions')}
              </p>

              <button
                type="button"
                onClick={() => setInspectToken(null)}
                className="btn btn-primary btn-block"
                style={{ marginTop: '16px', fontWeight: 700 }}
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
export default ReservationsScreen;
