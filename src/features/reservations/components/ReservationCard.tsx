import React from 'react';
import { Clock, Store, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Reservation } from '../../../types';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';

interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: (reservationId: string) => void;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onCancel,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
      case 'confirmed':
        return {
          bg: '#ecfdf5',
          color: '#059669',
          icon: <CheckCircle size={14} />,
          text: 'Ready for Pickup',
        };
      case 'completed':
        return {
          bg: '#f0fdf4',
          color: '#16a34a',
          icon: <CheckCircle size={14} />,
          text: 'Collected',
        };
      case 'cancelled':
        return {
          bg: '#fef2f2',
          color: '#dc2626',
          icon: <XCircle size={14} />,
          text: 'Cancelled',
        };
      default:
        return {
          bg: '#fffbeb',
          color: '#d97706',
          icon: <AlertCircle size={14} />,
          text: 'Pending Shop Confirmation',
        };
    }
  };

  const badge = getStatusBadge(reservation.status);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card, #ffffff)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Store size={18} color="var(--color-primary, #6366f1)" />
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {reservation.shop_name || 'Dukaan Store'}
          </h4>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '999px',
            backgroundColor: badge.bg,
            color: badge.color,
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          {badge.icon}
          <span>{badge.text}</span>
        </div>
      </div>

      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <Clock size={14} />
          <span>Reserved: {formatDate(reservation.created_at)}</span>
        </div>
        {reservation.pickup_time && (
          <div>Pickup Slot: <strong>{formatDate(reservation.pickup_time)}</strong></div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-color, #f1f5f9)',
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Value</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatCurrency(reservation.total_amount || 0)}
          </div>
        </div>

        {reservation.status === 'pending' && onCancel && (
          <button
            onClick={() => onCancel(reservation.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid #fca5a5',
              background: '#fff',
              color: '#dc2626',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel Pickup
          </button>
        )}
      </div>
    </div>
  );
};
