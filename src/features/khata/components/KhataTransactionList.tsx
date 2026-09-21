import React from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { KhataTransaction } from '../../../types';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';

interface KhataTransactionListProps {
  transactions: KhataTransaction[];
}

export const KhataTransactionList: React.FC<KhataTransactionListProps> = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No transactions recorded yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {transactions.map((tx) => {
        const isCredit = tx.type === 'credit';
        return (
          <div
            key={tx.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #f1f5f9)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isCredit ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: isCredit ? '#ef4444' : '#10b981',
                }}
              >
                {isCredit ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {tx.description || (isCredit ? 'Udhar / Items Purchase' : 'Payment Received')}
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {formatDate(tx.created_at)}
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: isCredit ? '#ef4444' : '#10b981',
                }}
              >
                {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Balance: {formatCurrency(tx.balance_after)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
