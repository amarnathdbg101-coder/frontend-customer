import React from 'react';
import { AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const CreditLimitBar = ({ currentBalance = 0, creditLimit = 0, compact = false }) => {
  const { isHindi, t } = useLanguage();
  const balance = Number(currentBalance) > 0 ? Number(currentBalance) : 0;
  const limit = Number(creditLimit) || 0;

  if (limit <= 0) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 8px',
          borderRadius: '8px',
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          color: 'var(--color-primary, #4f46e5)',
          fontSize: '0.72rem',
          fontWeight: 700,
          marginTop: '6px',
        }}
      >
        <Zap size={13} />
        <span>{t('khata.credit_unlimited', 'Open / Flexible Limit')}</span>
      </div>
    );
  }

  const usedPct = Math.min(100, Math.round((balance / limit) * 100));
  const availableCredit = Math.max(0, limit - balance);
  const isCritical = usedPct >= 90;
  const isWarning = usedPct >= 75 && usedPct < 90;

  const barColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';
  const barBg = isCritical ? 'rgba(239, 68, 68, 0.08)' : isWarning ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)';

  return (
    <div
      style={{
        marginTop: compact ? '6px' : '10px',
        padding: compact ? '8px 10px' : '10px 12px',
        borderRadius: '10px',
        backgroundColor: barBg,
        border: `1px solid ${barColor}33`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '5px',
          fontSize: '0.73rem',
        }}
      >
        <span style={{ fontWeight: 700, color: 'var(--text-secondary, #475569)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {isCritical ? <AlertTriangle size={13} color="#ef4444" /> : <ShieldCheck size={13} color={barColor} />}
          <span>{t('khata.credit_utilization', 'Credit Limit Utilization')}</span>
        </span>
        <span style={{ fontWeight: 800, color: barColor }}>
          {usedPct}% {t('khata.credit_used', 'Used')}
        </span>
      </div>

      {/* Progress Track */}
      <div
        style={{
          width: '100%',
          height: '7px',
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${usedPct}%`,
            height: '100%',
            backgroundColor: barColor,
            borderRadius: '9999px',
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {/* Footer Numbers */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '5px',
          fontSize: '0.7rem',
          color: 'var(--text-secondary, #64748b)',
        }}
      >
        <span>
          {isHindi ? `उपयोग: ₹${balance.toLocaleString('en-IN')}` : `Used: ₹${balance.toLocaleString('en-IN')}`}
        </span>
        <span style={{ fontWeight: 600 }}>
          {isHindi
            ? `सीमा: ₹${limit.toLocaleString('en-IN')} (उपलब्ध: ₹${availableCredit.toLocaleString('en-IN')})`
            : `Limit: ₹${limit.toLocaleString('en-IN')} (Left: ₹${availableCredit.toLocaleString('en-IN')})`}
        </span>
      </div>

      {isCritical && (
        <div style={{ marginTop: '4px', fontSize: '0.68rem', fontWeight: 700, color: '#dc2626' }}>
          ⚠️ {t('khata.credit_critical', 'Credit limit almost exhausted! Settle dues soon.')}
        </div>
      )}
    </div>
  );
};

export default CreditLimitBar;
