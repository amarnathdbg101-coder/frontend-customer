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
import { ShoppingBag, Clock, CheckCircle, XCircle, AlertCircle, QrCode, X, ArrowLeft } from 'lucide-react';
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
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{t('auth.login_title')}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            {t('auth.login_required_reserve')}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ padding: '10px 24px', fontWeight: 700 }}>
            {t('nav.login')}
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={t('nav.reservations')} subtitle={t('checkout.reservation_subtitle')} showBack={true}>
      {/* Status Tabs */}
      <div
        style={{
          display: 'flex',
          background: 'var(--bg-surface)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '16px',
          border: '1px solid var(--border-subtle)',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'all', label: t('common.view_all') },
          { id: 'active', label: t('checkout.status_pending') },
          { id: 'completed', label: t('checkout.status_completed') },
          { id: 'cancelled', label: t('checkout.status_cancelled') },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveStatusTab(tab.id)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
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

      <div className="card" style={{ padding: '12px 16px' }}>
        <div style={{ padding: '4px 0 12px 0', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
          <span>{t('checkout.order_items')}</span>
          <span>({filteredReservations.length})</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {t('common.loading')}
          </div>
        ) : filteredReservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <ShoppingBag size={40} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {t('common.no_results')}
            </div>
            <p style={{ margin: 0 }}>
              {t('common.try_adjusting_search')}
            </p>
          </div>
        ) : (
          filteredReservations.map((r) => {
            const displayId =
              r.pickup_code ||
              r.reservation_number ||
              (typeof r.id === 'string' ? r.id.slice(0, 8) : r.id) ||
              'PKP-892';

            return (
              <div
                key={r.id || Math.random()}
                className="list-item"
                style={{
                  padding: '14px 0',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {r.product?.name || `Reservation #${displayId}`}
                  </div>
                  {r.shop?.name && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 600, marginTop: '2px' }}>
                      🏪 {r.shop.name}
                    </div>
                  )}
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    {t('cart.quantity')}: {r.quantity || 1} • {t('products.hold_hours')}: {formatExpiry(r.expires_at)}
                  </div>

                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span
                      style={{
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        fontWeight: 900,
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
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
                      style={{ padding: '3px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
                    >
                      <QrCode size={13} />
                      <span>{t('checkout.view_token')}</span>
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span
                    className={`badge ${
                      r.status === 'verified' || r.status === 'completed'
                        ? 'badge-success'
                        : r.status === 'cancelled'
                        ? 'badge-danger'
                        : 'badge-warning'
                    }`}
                  >
                    {r.status === 'completed' ? t('checkout.status_completed') : r.status === 'cancelled' ? t('checkout.status_cancelled') : t('checkout.status_pending')}
                  </span>

                  {(r.status === 'active' || r.status === 'pending' || !r.status) && (
                    <div style={{ marginTop: '10px' }}>
                      <button
                        onClick={() => handleCancel(r.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-danger, #ef4444)',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {t('checkout.cancel_reservation')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Inspect QR Code Modal */}
      {inspectToken && (
        <div className="modal-backdrop" onClick={() => setInspectToken(null)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{t('checkout.pickup_otp')}</h3>
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
                  size={160}
                />
              </div>

              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '3px' }}>
                {inspectToken.pickup_code || inspectToken.reservation_number || 'PKP-789'}
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
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
