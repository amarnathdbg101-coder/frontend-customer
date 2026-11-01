import React from 'react';
import { CheckCircle, ShieldCheck, Copy, Clock } from 'lucide-react';
import { RealQRCode } from '../common/RealQRCode';

export const CheckoutConfirmationView = ({
  confirmedReservation,
  items,
  finalTotal,
  subtotal,
  handleCopyToken,
  copiedToken,
  onClose,
  onViewReservations,
  isHindi,
}) => {
  return (
    <div style={{ textAlign: 'center', padding: '10px 0' }}>
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px auto',
          color: '#10b981',
        }}
      >
        <CheckCircle size={32} />
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 6px 0' }}>
        {isHindi ? 'पिकअप टोकन पास तैयार है!' : 'Pickup Pass Ready!'}
      </h3>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 16px auto', lineHeight: 1.4 }}>
        {isHindi
          ? 'दुकान के काउंटर पर पहुँचकर सिर्फ यह 6-अंकों का टोकन नंबर दिखाएं, दुकानदार POS पर दर्ज करते ही 10 सेकंड में आपका पैक किया सामान मिल जाएगा!'
          : 'Show this 6-digit token or QR pass at the counter. The shopkeeper enters it in POS for 10-second instant pickup!'}
      </p>

      {/* Ordered Items Summary */}
      {items.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            borderRadius: '14px',
            padding: '12px 14px',
            maxWidth: '360px',
            margin: '0 auto 16px auto',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
            {isHindi ? 'ऑर्डर किए गए उत्पाद' : 'RESERVED PRODUCTS'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.slice(0, 3).map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>x{item.quantity}</span>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-primary)', flexShrink: 0 }}>
                  ₹{((item.price || 0) * item.quantity).toFixed(0)}
                </span>
              </div>
            ))}
            {items.length > 3 && (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                +{items.length - 3} {isHindi ? 'और सामान' : 'more items'}
              </div>
            )}
          </div>
          <div style={{ borderTop: '1px dashed var(--border-subtle, #cbd5e1)', marginTop: '8px', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 900 }}>
            <span>{isHindi ? 'कुल देय राशि:' : 'Total Payable:'}</span>
            <span style={{ color: '#059669' }}>₹{finalTotal || subtotal}</span>
          </div>
        </div>
      )}

      {/* Digital Pass Ticket Box */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface-subtle)',
          border: '2px dashed var(--color-primary)',
          borderRadius: 'var(--radius-xl, 20px)',
          padding: '22px 18px',
          maxWidth: '360px',
          margin: '0 auto 20px auto',
          boxShadow: '0 8px 24px rgba(79, 70, 229, 0.12)',
        }}
      >
        {/* Status indicator */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800, marginBottom: '14px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span>{isHindi ? 'काउंटर पिकअप के लिए तैयार' : 'Ready for Counter Pickup'}</span>
        </div>

        {/* QR Code Pass */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
          <RealQRCode
            value={`SHOP-PICKUP:${confirmedReservation?.pickup_code || confirmedReservation?.token_display || '4812'}`}
            size={170}
            logoText="PICKUP"
            showDownload={true}
            downloadFilename={`pickup-pass-${confirmedReservation?.token_display || 'token'}`}
          />
        </div>

        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {isHindi ? '6-अंकों का पिकअप टोकन कोड' : '6-DIGIT PICKUP TOKEN'}
        </div>

        {/* Large 4-Digit Token Display */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            margin: '6px 0',
          }}
        >
          <div
            style={{
              fontSize: '2.4rem',
              fontWeight: 900,
              color: 'var(--color-primary)',
              letterSpacing: '4px',
              fontFamily: 'monospace',
            }}
          >
            {confirmedReservation?.token_display || `#${confirmedReservation?.pickup_code || '4812'}`}
          </div>
          <button
            type="button"
            onClick={handleCopyToken}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: copiedToken ? '#10b981' : 'var(--text-secondary)',
              padding: '6px',
            }}
            title={isHindi ? 'टोकन कॉपी करें' : 'Copy Token'}
          >
            {copiedToken ? <CheckCircle size={20} /> : <Copy size={20} />}
          </button>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <Clock size={13} />
          <span>
            {isHindi ? 'होल्ड समय: 3 घंटे तक वैध' : 'Valid for 3 hours at shop counter'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-secondary"
          style={{ minWidth: '130px', fontWeight: 700 }}
        >
          {isHindi ? 'बंद करें' : 'Close'}
        </button>
        <button
          type="button"
          onClick={onViewReservations}
          className="btn btn-primary"
          style={{ minWidth: '150px', fontWeight: 800 }}
        >
          {isHindi ? 'मेरी बुकिंग्स देखें' : 'View My Pickups'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutConfirmationView;

