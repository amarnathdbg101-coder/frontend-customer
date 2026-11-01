import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';
import { BaseModal, ModalBody, Button } from '../ui';
import { getImageUrl } from '../../utils/imageUrl';
import { getDirectionsUrl } from '../../utils/distance';

export const StorefrontReservationSuccessModal = ({
  reservationSuccess,
  onClose,
  shop,
  isHindi,
  t,
}) => {
  const navigate = useNavigate();

  if (!reservationSuccess) return null;

  const productImg = (reservationSuccess.product?.images && reservationSuccess.product.images[0]) ||
    reservationSuccess.product?.image ||
    reservationSuccess.product_image ||
    (Array.isArray(reservationSuccess.product_images) && reservationSuccess.product_images[0]);

  return (
    <BaseModal isOpen={Boolean(reservationSuccess)} onClose={onClose} maxWidth="440px">
      <ModalBody padding="24px" style={{ textAlign: 'center' }}>
        <CheckCircle size={52} color="var(--color-success, #10b981)" style={{ margin: '0 auto 10px auto' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
          {t('checkout.reservation_success_title') || 'Counter Pickup Confirmed!'}
        </h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0 0 14px 0', lineHeight: 1.45 }}>
          {t('checkout.pickup_instructions_counter', 'Show your 6-digit PIN at the counter to collect your item instantly.')}
        </p>

        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
          {isHindi ? 'काउंटर पिकअप कोड' : 'COUNTER PICKUP PIN'}
        </div>
        <div
          style={{
            backgroundColor: 'var(--color-primary-light, rgba(20, 110, 180, 0.1))',
            color: 'var(--color-primary, #1e40af)',
            fontSize: '2.2rem',
            fontWeight: 900,
            letterSpacing: '4px',
            padding: '12px',
            borderRadius: 'var(--radius-md, 12px)',
            margin: '0 0 16px 0',
            fontFamily: 'monospace',
            border: '1.5px dashed var(--color-primary, #3b82f6)',
          }}
        >
          #{reservationSuccess.pickup_code || reservationSuccess.reservation_number || 'OK'}
        </div>

        {/* Product & Order Summary Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            borderRadius: '12px',
            padding: '10px 14px',
            margin: '0 0 16px 0',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-subtle, #e2e8f0)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {productImg ? (
              <img
                loading="lazy"
                decoding="async"
                src={getImageUrl(productImg)}
                alt={reservationSuccess.product?.name || reservationSuccess.product_name || 'Item'}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <Package size={20} color="var(--text-muted)" />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: '0.88rem',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {reservationSuccess.product?.name || reservationSuccess.product_name || (isHindi ? 'पिकअप सामान' : 'Reserved Item')}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', marginTop: '2px' }}>
              <span>{isHindi ? 'मात्रा:' : 'Qty:'} <strong>{reservationSuccess.quantity || 1}</strong></span>
              <span>•</span>
              <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>
                ₹{Number(reservationSuccess.total_amount || (reservationSuccess.product?.price || reservationSuccess.product_price || 0) * (reservationSuccess.quantity || 1)).toFixed(0)}
              </span>
              <span>•</span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shop?.name}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
          <Button
            variant="primary"
            fullWidth={true}
            onClick={() => {
              onClose();
              navigate('/reservations');
            }}
          >
            {t('checkout.view_my_pickups', 'View in My Pickups')}
          </Button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="secondary"
              fullWidth={true}
              onClick={() => {
                const dirUrl = getDirectionsUrl(shop?.latitude, shop?.longitude, shop?.name, shop?.address);
                window.open(dirUrl, '_blank', 'noopener,noreferrer');
              }}
            >
              📍 {t('checkout.get_directions', 'Directions')}
            </Button>

            <Button
              variant="secondary"
              fullWidth={true}
              onClick={() => {
                const code = reservationSuccess.pickup_code || reservationSuccess.reservation_number || '';
                const dirUrl = getDirectionsUrl(shop?.latitude, shop?.longitude, shop?.name, shop?.address);
                const shareText = `*ShopSilo Counter Pickup:*%0A🏪 Store: ${shop?.name || ''}%0A🔢 Pickup PIN: *#${code}*%0A📍 Store Directions: ${dirUrl}`;
                window.open(`https://wa.me/?text=${shareText}`, '_blank');
              }}
            >
              💬 {t('checkout.share_pickup', 'Share PIN')}
            </Button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            padding: '6px',
            textDecoration: 'underline',
          }}
        >
          {t('common.close', 'Continue Shopping')}
        </button>
      </ModalBody>
    </BaseModal>
  );
};

export default StorefrontReservationSuccessModal;

