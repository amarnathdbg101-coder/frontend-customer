import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Clock, Store, QrCode } from 'lucide-react';
import { reservationApi } from '../../api/reservation.api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { sessionState } from '../../utils/sessionState.js';
import { useScreenState } from '../../hooks/useScreenState.js';
import { useSWR } from '../../hooks/useSWR.js';
import { AppLayout } from '../../components/layout/AppLayout';
import { RealQRCode } from '../../components/common/RealQRCode';
import { localCache, CACHE_KEYS, DEFAULT_TTL } from '../../utils/localCache.js';
import { cacheEvents, CACHE_EVENTS } from '../../utils/cacheEvents.js';
import { BaseModal, ModalHeader, ModalBody, EmptyState, Card, Badge, Button } from '../../components/ui';

export const ReservationsScreen = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, isHindi } = useLanguage();

  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [inspectToken, setInspectToken] = useState(null);

  // Authenticated redirect guard
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Enterprise SWR + Event-Driven Cache Invalidation
  const {
    data: rawReservations,
    loading,
    revalidate,
  } = useSWR(CACHE_KEYS.RESERVATIONS, async () => {
    const data = await reservationApi.listReservations();
    return Array.isArray(data?.reservations) ? data.reservations : (Array.isArray(data) ? data : []);
  }, {
    ttlMinutes: DEFAULT_TTL.RESERVATIONS,
    invalidateEvents: [CACHE_EVENTS.RESERVATIONS_MUTATED],
    enabled: isAuthenticated,
    revalidateOnFocus: true,
  });

  const reservations = rawReservations || [];

  const handleCancel = async (id) => {
    if (!window.confirm(isHindi ? 'क्या आप इस रिजर्वेशन को रद्द करना चाहते हैं?' : 'Are you sure you want to cancel this reservation?')) {
      return;
    }
    try {
      await reservationApi.cancelReservation(id);
      cacheEvents.emit(CACHE_EVENTS.RESERVATIONS_MUTATED, { cancelledId: id });
    } catch (err) {
      alert(err.message || t('common.error'));
    }
  };

  const filteredReservations = useMemo(() => {
    if (activeStatusTab === 'all') return reservations;
    return reservations.filter((r) => {
      const s = r.status?.toLowerCase();
      if (activeStatusTab === 'active') return s === 'active' || s === 'pending' || !s || s === 'ready';
      if (activeStatusTab === 'completed') return s === 'completed' || s === 'verified';
      if (activeStatusTab === 'cancelled') return s === 'cancelled';
      return true;
    });
  }, [reservations, activeStatusTab]);

  const formatLocalTime = (isoStr) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return isoStr;
    }
  };

  return (
    <AppLayout
      title={isHindi ? 'मेरे काउंटर पिकअप ऑर्डर्स' : 'My Store Pickups'}
      subtitle={isHindi ? 'दुकान से 30-मिनट काउंटर पिकअप रिजर्वेशन' : '30-Minute Counter Pickup reservations'}
    >
      <title>{t('nav.reservations')} — ShopSilo</title>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'all', label: isHindi ? 'सभी' : 'All' },
          { id: 'active', label: isHindi ? 'सक्रिय (Active)' : 'Active' },
          { id: 'completed', label: isHindi ? 'पूर्ण (Completed)' : 'Completed' },
          { id: 'cancelled', label: isHindi ? 'रद्द (Cancelled)' : 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveStatusTab(tab.id)}
            className={`tab-pill ${activeStatusTab === tab.id ? 'active' : ''}`}
            style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && reservations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          {t('common.loading')}
        </div>
      ) : filteredReservations.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={isHindi ? 'कोई पिकअप ऑर्डर नहीं मिला' : 'No Pickup Orders Found'}
          description={isHindi ? 'दुकान से सामान चुनें और तुरंत पिकअप कोड पाएं।' : 'Reserve items from local stores for instant queue-free counter pickup.'}
          action={
            <Button variant="primary" onClick={() => navigate('/')}>
              {t('nav.explore')}
            </Button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredReservations.map((r) => {
            const displayId = r.pickup_code || r.reservation_number || String(r.id || '').slice(-6).toUpperCase();
            const isActive = r.status === 'active' || r.status === 'pending' || !r.status || r.status === 'ready';
            const isDone = r.status === 'completed' || r.status === 'verified';
            const isCancelled = r.status === 'cancelled';

            return (
              <Card
                key={r.id || Math.random()}
                padding="16px"
                style={{
                  margin: 0,
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

                    <Badge
                      variant={isDone ? 'success' : isCancelled ? 'danger' : 'warning'}
                      size="sm"
                    >
                      {isDone ? t('checkout.status_completed') : isCancelled ? t('checkout.status_cancelled') : t('checkout.status_pending')}
                    </Badge>
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span>{t('cart.quantity')}: <strong>{r.quantity || 1}</strong></span>
                      <span>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)', fontWeight: 600 }}>
                        <Clock size={12} color="var(--color-primary)" />
                        <span>{isHindi ? 'आरक्षित किया:' : 'Booked at:'} <strong>{formatLocalTime(r.created_at)}</strong></span>
                      </span>
                    </div>
                    {r.expires_at && (
                      <div style={{ fontSize: '0.72rem', color: isActive ? '#b45309' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <span>⏳ {isHindi ? 'पिकअप अंतिम समय:' : 'Pickup Deadline:'} <strong>{formatLocalTime(r.expires_at)}</strong> ({isHindi ? 'तक मान्य' : 'valid till'})</span>
                      </div>
                    )}
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
                    <Badge variant="primary" size="md">
                      {displayId}
                    </Badge>

                    <Button
                      variant="secondary"
                      size="sm"
                      icon={QrCode}
                      onClick={() => setInspectToken(r)}
                    >
                      {t('checkout.view_token')}
                    </Button>
                  </div>

                  {isActive && (
                    <button
                      type="button"
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
              </Card>
            );
          })}
        </div>
      )}

      {/* Inspect QR Code Modal */}
      {inspectToken && (
        <BaseModal isOpen={Boolean(inspectToken)} onClose={() => setInspectToken(null)} maxWidth="420px">
          <ModalHeader
            title={t('checkout.pickup_otp')}
            subtitle={inspectToken.product?.name || `Order #${inspectToken.pickup_code || inspectToken.id}`}
            icon={QrCode}
            onClose={() => setInspectToken(null)}
          />
          <ModalBody padding="20px" style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
              <RealQRCode
                value={`SHOP-PICKUP:${inspectToken.pickup_code || inspectToken.reservation_number || inspectToken.id}`}
                size={180}
                logoText="PICKUP"
                showDownload={true}
                downloadFilename={"pickup-code-" + (inspectToken.pickup_code || inspectToken.id)}
              />
            </div>

            {(() => {
              const rawNums = String(inspectToken.pickup_code || inspectToken.reservation_number || inspectToken.id || '').replace(/[^0-9]/g, '');
              const tokenCode = inspectToken.token_display || (rawNums.length >= 4 ? `#${rawNums.slice(-4)}` : `#${rawNums || '4812'}`);
              return (
                <>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {isHindi ? '4-अंकों का पिकअप कोड' : '4-DIGIT PICKUP CODE'}
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '4px', margin: '6px 0', fontFamily: 'monospace' }}>
                    {tokenCode}
                  </div>
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#065f46', borderRadius: '10px', padding: '10px 14px', fontSize: '0.78rem', lineHeight: 1.45, fontWeight: 600, marginTop: '8px', textAlign: 'left' }}>
                    ⚡ {isHindi
                      ? 'दुकान के काउंटर पर पहुँचकर केवल यह टोकन नंबर (#...) दिखाएं या QR कोड स्कैन करवाएं। दुकानदार POS में दर्ज करते ही आपका पैक किया हुआ सामान 10 सेकंड में मिल जाएगा!'
                      : 'Show this 4-digit token or QR pass at the store counter. The merchant enters it into POS to hand over your packed goods in 10 seconds!'}
                  </div>
                </>
              );
            })()}

            <Button
              variant="primary"
              fullWidth={true}
              style={{ marginTop: '16px' }}
              onClick={() => setInspectToken(null)}
            >
              {t('common.close')}
            </Button>
          </ModalBody>
        </BaseModal>
      )}
    </AppLayout>
  );
};
export default ReservationsScreen;
