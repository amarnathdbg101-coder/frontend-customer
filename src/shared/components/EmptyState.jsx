import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  actionLabel,
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 16px',
        color: 'var(--text-secondary, #64748b)',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--bg-secondary, #f1f5f9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
        <Icon size={32} color="var(--color-primary, #6366f1)" />
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary, #1e293b)', marginBottom: '6px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', maxWidth: '360px', marginBottom: actionLabel ? '20px' : 0 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-primary, #6366f1)',
            color: '#fff',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
