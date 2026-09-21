import React from 'react';
import { Store, CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { CustomerKhata } from '../../../types';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';

interface KhataSummaryCardProps {
  khata: CustomerKhata;
  onSelect: (khata: CustomerKhata) => void;
  onPayUpi: (khata: CustomerKhata) => void;
}

export const KhataSummaryCard: React.FC<KhataSummaryCardProps> = ({
  khata,
  onSelect,
  onPayUpi,
}) => {
  const isDue = khata.balance > 0;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card, #ffffff)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-secondary, #f1f5f9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary, #6366f1)',
            }}
          >
            <Store size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              {khata.shop_name || 'Dukaan'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Khata ID: #{khata.id.slice(0, 8)}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: isDue ? '#ef4444' : '#10b981',
            }}
          >
            {formatCurrency(khata.balance)}
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isDue ? '#ef4444' : '#10b981' }}>
            {isDue ? 'Baki (Due)' : 'Cleared'}
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '10px',
          paddingTop: '8px',
          borderTop: '1px solid var(--border-color, #f1f5f9)',
        }}
      >
        <button
          onClick={() => onSelect(khata)}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-color, #cbd5e1)',
            background: 'transparent',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          View Passbook
        </button>

        {isDue && (
          <button
            onClick={() => onPayUpi(khata)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <CreditCard size={16} />
            Pay with UPI
          </button>
        )}
      </div>
    </div>
  );
};
