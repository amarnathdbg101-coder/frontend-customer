import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  Store,
  QrCode,
  MapPin,
  Phone,
  MessageCircle,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Navigation,
  AlertTriangle,
  ArrowRight,
  Package,
} from 'lucide-react';
import { reservationApi } from '../../api/reservation.api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSWR } from '../../hooks/useSWR.js';
import { useRealtimeCustomer } from '../../hooks/useRealtimeCustomer.js';
import { AppLayout } from '../../components/layout/AppLayout';
import { RealQRCode } from '../../components/common/RealQRCode';
import { localCache, CACHE_KEYS, DEFAULT_TTL } from '../../utils/localCache.js';
import { cacheEvents, CACHE_EVENTS } from '../../utils/cacheEvents.js';
import { getDirectionsUrl } from '../../utils/distance.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import { BaseModal, ModalHeader, ModalBody, EmptyState, Card, Badge, Button } from '../../components/ui';

const PickupStepper = ({ status, isHindi }) => {
  const isCancelled = status === 'cancelled';
  const isCompleted = status === 'completed' || status === 'verified';
  const isReady = status === 'ready';

  if (isCancelled) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          borderRadius: '8px',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          fontSize: '0.74rem',
          fontWeight: 700,
          margin: '8px 0',
        }}
      >
        <AlertTriangle size={14} />
        <span>{isHindi ? 'यह रिजर्वेशन निरस्त कर दिया गया है' : 'This reservation was cancelled'}</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
        borderRadius: '10px',
        padding: '8px 12px',
        margin: '10px 0',
        border: '1px solid var(--border-subtle, #e2e8f0)',
      }}
    >
      {/* Step 1: Booked */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#16a34a',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 800,
          }}
        >
          ✓
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#15803d' }}>
          {isHindi ? 'बुक हुआ' : 'Booked'}
        </span>
      </div>

      {/* Divider 1-2 */}
      <div
        style={{
          flex: 1,
          height: '2px',
          backgroundColor: isReady || isCompleted ? '#16a34a' : 'var(--border-subtle, #cbd5e1)',
          margin: '0 8px',
        }}
      />

      {/* Step 2: Ready at Store Counter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: isCompleted ? '#16a34a' : (isReady ? '#f59e0b' : '#0f172a'),
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 800,
          }}
        >
          {isCompleted ? '✓' : (isReady ? '⚡' : '2')}
        </div>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: isCompleted ? '#15803d' : (isReady ? '#b45309' : '#0f172a'),
          }}
        >
          {isReady ? (isHindi ? 'काउंटर पर तैयार' : 'Ready at Store') : (isHindi ? 'पैकिंग जारी' : 'Packing')}
        </span>
      </div>

      {/* Divider 2-3 */}
      <div
        style={{
          flex: 1,
          height: '2px',
          backgroundColor: isCompleted ? '#16a34a' : 'var(--border-subtle, #cbd5e1)',
          margin: '0 8px',
        }}
      />

      {/* Step 3: Collected */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: isCompleted ? '#16a34a' : '#94a3b8',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 800,
          }}
        >
          {isCompleted ? '✓' : '3'}
        </div>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: isCompleted ? '#15803d' : '#64748b',
          }}
        >
          {isCompleted ? (isHindi ? 'प्राप्त हुआ' : 'Collected') : (isHindi ? 'पिकअप' : 'Pickup')}
        </span>
      </div>
    </div>
  );
};

export const ReservationsScreen = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, isHindi } = useLanguage();

  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [inspectToken, setInspectToken] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [now, setNow] = useState(Date.now());

  // Dynamic live countdown refresh every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Authenticated redirect guard
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Live Real-Time Customer Pickup & Order Updates via WebSocket
  useRealtimeCustomer({
    enabled: isAuthenticated,
    onReservationUpdate: () => {
      revalidate?.(true);
    },
  });

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

  const handleCopyCode = (code, id) => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSharePickup = (r, displayId) => {
    const storeName = r.shop?.name || 'Local Store';
    const prodName = r.product?.name || 'Item';
    const directionsUrl = getDirectionsUrl(r.shop?.latitude, r.shop?.longitude, storeName, r.shop?.address);
    const text = `*ShopSilo Store Pickup Pass:*%0A📦 Item: ${prodName} (Qty: ${r.quantity || 1})%0A🏪 Store: ${storeName}%0A🔢 Pickup PIN: *#${displayId}*%0A📍 Directions: ${directionsUrl}`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
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

  const getCountdownInfo = (expiresAt) => {
    if (!expiresAt) return null;
    const diffMs = new Date(expiresAt).getTime() - now;
    if (diffMs <= 0) {
      return {
        isExpired: true,
        isUrgent: true,
        text: isHindi ? 'समय समाप्त (Expired)' : 'Hold Expired',
      };
    }
    const totalMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const isUrgent = totalMins <= 30;

    let timeStr = '';
    if (hours > 0) {
      timeStr = isHindi ? `${hours} घंटे ${mins} मिनट बाकी` : `${hours}h ${mins}m left`;
    } else {
      timeStr = isHindi ? `${mins} मिनट बाकी` : `${mins}m left`;
    }

    return {
      isExpired: false,
      isUrgent,
      text: isUrgent ? (isHindi ? `⚡ जल्दी करें, ${mins} मिनट बाकी` : `⚡ Hurry, ${mins}m left!`) : `⏳ ${timeStr}`,
    };
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
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: activeStatusTab === tab.id ? 'none' : '1px solid var(--border-subtle, #e2e8f0)',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              backgroundColor: activeStatusTab === tab.id ? '#0f172a' : 'var(--bg-surface, #ffffff)',
              color: activeStatusTab === tab.id ? '#ffffff' : 'var(--text-secondary, #475569)',
              boxShadow: activeStatusTab === tab.id ? '0 2px 6px rgba(15, 23, 42, 0.15)' : 'none',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredReservations.map((r) => {
            const displayId = r.pickup_code || r.reservation_number || String(r.id || '').slice(-6).toUpperCase();
            const isActive = r.status === 'active' || r.status === 'pending' || !r.status || r.status === 'ready';
            const isDone = r.status === 'completed' || r.status === 'verified';
            const isCancelled = r.status === 'cancelled';
            const countdown = isActive ? getCountdownInfo(r.expires_at) : null;

            // Robust multi-field fallbacks for product and store
            const productName = r.product?.name || r.product_name || r.name || (isHindi ? `काउंटर पिकअप #${displayId}` : `Counter Pickup #${displayId}`);
            const productImage = r.product?.image || (Array.isArray(r.product?.images) && r.product.images[0]) || r.product_image || (Array.isArray(r.product_images) && r.product_images[0]);
            const unitPrice = Number(r.product?.price ?? r.product_price ?? (r.total_amount && r.quantity ? r.total_amount / r.quantity : 0));
            const totalAmount = Number(r.total_amount || (unitPrice * (r.quantity || 1)));
            const storeName = r.shop?.name || r.shop_name || (isHindi ? 'स्थानीय दुकान' : 'Local Store');
            const storeSlug = r.shop?.slug || r.shop_slug || '';
            const targetProdId = r.product_id || r.product?.id;
            const directionsUrl = getDirectionsUrl(r.shop?.latitude, r.shop?.longitude, storeName, r.shop?.address);

            return (
              <Card
                key={r.id || r.pickup_code || r.reservation_number || `res_${r.created_at || 'item'}_${r.product_id || 'idx'}`}
                padding="16px"
                style={{
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px',
                  border: '1px solid var(--border-subtle, #e2e8f0)',
                  borderRadius: '14px',
                  backgroundColor: 'var(--bg-surface, #ffffff)',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <div>
                  {/* Top Row: Product Thumbnail, Title & Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', minWidth: 0, flex: 1, alignItems: 'center' }}>
                      <div
                        onClick={() => {
                          if (targetProdId) {
                            navigate(`/shop/${storeSlug || 'store'}/product/${targetProdId}`, {
                              state: { product: r.product, shop: r.shop },
                            });
                          }
                        }}
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                          border: '1px solid var(--border-subtle, #e2e8f0)',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          cursor: targetProdId ? 'pointer' : 'default',
                        }}
                      >
                        {productImage ? (
                          <img
                            src={getImageUrl(productImage)}
                            alt={productName}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <Package size={22} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                        )}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          onClick={() => {
                            if (targetProdId) {
                              navigate(`/shop/${storeSlug || 'store'}/product/${targetProdId}`, {
                                state: { product: r.product, shop: r.shop },
                              });
                            }
                          }}
                          style={{
                            fontWeight: 800,
                            fontSize: '0.98rem',
                            color: 'var(--text-primary, #0f172a)',
                            lineHeight: 1.3,
                            cursor: targetProdId ? 'pointer' : 'default',
                          }}
                          title={productName}
                        >
                          {productName}
                        </div>
                        {storeName && (
                          <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Store size={12} color="#0f172a" />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{storeName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Badge
                      variant={isDone ? 'success' : isCancelled ? 'danger' : 'warning'}
                      size="sm"
                    >
                      {isDone ? t('checkout.status_completed') : isCancelled ? t('checkout.status_cancelled') : t('checkout.status_pending')}
                    </Badge>
                  </div>

                  {/* Visual Status Stepper */}
                  <PickupStepper status={r.status} isHindi={isHindi} />

                  {/* Quantity, Time & Live Countdown */}
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #475569)', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span>{t('cart.quantity')}: <strong>{r.quantity || 1}</strong></span>
                      {totalAmount > 0 && (
                        <>
                          <span>•</span>
                          <span>{t('common.price', 'Price')}: <strong style={{ color: '#0f172a' }}>₹{totalAmount.toFixed(0)}</strong></span>
                        </>
                      )}
                      <span>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0f172a', fontWeight: 600 }}>
                        <Clock size={12} color="#0f172a" />
                        <span>{isHindi ? 'आरक्षित किया:' : 'Booked at:'} <strong>{formatLocalTime(r.created_at)}</strong></span>
                      </span>
                    </div>

                    {/* Countdown Banner */}
                    {countdown && (
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: countdown.isUrgent ? '#dc2626' : '#1e40af',
                          backgroundColor: countdown.isUrgent ? '#fee2e2' : '#eff6ff',
                          border: countdown.isUrgent ? '1px solid #fca5a5' : '1px solid #bfdbfe',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 800,
                          marginTop: '2px',
                          width: 'fit-content',
                        }}
                      >
                        <span>{countdown.text}</span>
                        {r.expires_at && (
                          <span style={{ opacity: 0.8, fontWeight: 500 }}>
                            ({isHindi ? 'मान्यता:' : 'valid till'} {formatLocalTime(r.expires_at)})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pickup Code & Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle, #e2e8f0)',
                    gap: '8px',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Left: Code Badge & QR Pass */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div
                      onClick={() => handleCopyCode(displayId, r.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#eff6ff',
                        color: '#1e40af',
                        padding: '6px 14px',
                        borderRadius: '10px',
                        fontWeight: 900,
                        fontSize: '0.95rem',
                        fontFamily: 'monospace',
                        letterSpacing: '2px',
                        cursor: 'pointer',
                        border: '1.5px dashed #3b82f6',
                      }}
                      title={isHindi ? 'क्लिक करके कोड कॉपी करें' : 'Click to copy PIN'}
                    >
                      <span>#{displayId}</span>
                      {copiedId === r.id ? <Check size={15} color="#16a34a" /> : <Copy size={15} />}
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      icon={QrCode}
                      onClick={() => setInspectToken(r)}
                    >
                      {t('checkout.view_token')}
                    </Button>
                  </div>

                  {/* Right: Directions, Call, Share, Cancel */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {/* Directions Button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Navigation}
                      onClick={() => window.open(directionsUrl, '_blank', 'noopener,noreferrer')}
                    >
                      {t('checkout.get_directions')}
                    </Button>

                    {/* WhatsApp Share PIN */}
                    <Button
                      variant="whatsapp"
                      size="sm"
                      icon={Share2}
                      onClick={() => handleSharePickup(r, displayId)}
                    >
                      {isHindi ? 'शेयर PIN' : 'Share PIN'}
                    </Button>

                    {/* Cancel Button */}
                    {isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        style={{ color: '#dc2626', fontWeight: 800 }}
                        onClick={() => handleCancel(r.id)}
                      >
                        {t('checkout.cancel')}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* QR Token Modal */}
      {inspectToken && (
        <BaseModal isOpen={Boolean(inspectToken)} onClose={() => setInspectToken(null)} maxWidth="420px">
          <ModalHeader
            title={isHindi ? 'काउंटर सत्यापन पास (QR Pass)' : 'Store Pickup Pass'}
            subtitle={inspectToken.shop?.name || (isHindi ? 'दुकानदार काउंटर पर दिखाएं' : 'Show at store counter')}
            icon={QrCode}
            onClose={() => setInspectToken(null)}
          />
          <ModalBody padding="20px" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              {isHindi ? 'काउंटर 6-अंकीय पिकअप PIN' : '6-DIGIT COUNTER PICKUP PIN'}
            </div>
            <div
              style={{
                backgroundColor: '#eff6ff',
                color: '#1e40af',
                fontSize: '2.2rem',
                fontWeight: 900,
                letterSpacing: '4px',
                padding: '12px',
                borderRadius: '12px',
                marginBottom: '16px',
                fontFamily: 'monospace',
                border: '1.5px dashed #3b82f6',
              }}
            >
              #{inspectToken.pickup_code || inspectToken.reservation_number || String(inspectToken.id || '').slice(-6).toUpperCase()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <RealQRCode
                value={JSON.stringify({
                  id: inspectToken.id,
                  code: inspectToken.pickup_code || inspectToken.reservation_number,
                  shop_id: inspectToken.shop_id || inspectToken.shop?.id,
                })}
                size={180}
              />
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #475569)', lineHeight: 1.45, marginBottom: '16px' }}>
              {isHindi
                ? 'दुकानदार अपने POS काउंटर स्कैनर से इस QR कोड या PIN को स्कैन करके आपका सामान तुरंत हैंडओवर कर देगा।'
                : 'Show this 6-digit PIN or QR code to the store merchant counter for instant verification & pickup.'}
            </p>

            <Button variant="primary" fullWidth onClick={() => setInspectToken(null)}>
              {t('common.close')}
            </Button>
          </ModalBody>
        </BaseModal>
      )}
    </AppLayout>
  );
};

export default ReservationsScreen;
