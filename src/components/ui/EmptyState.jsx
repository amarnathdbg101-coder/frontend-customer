/**
 * Reusable Empty State Component
 * 
 * Displayed when a list or search returns zero results.
 */

import React from 'react';

export const EmptyState = ({
  icon: Icon,
  title = 'Nothing found',
  description = '',
  action = null,
}) => {
  return (
    <div
      className="card"
      style={{
        textAlign: 'center',
        padding: '40px 20px',
        borderRadius: 'var(--radius-lg)',
      }}
      role="status"
    >
      {Icon && (
        <Icon
          size={48}
          color="var(--text-muted)"
          style={{ margin: '0 auto 12px auto', opacity: 0.6, display: 'block' }}
          aria-hidden="true"
        />
      )}
      <div
        style={{
          fontWeight: 800,
          fontSize: '1.1rem',
          color: 'var(--text-primary)',
        }}
      >
        {title}
      </div>
      {description && (
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginTop: '6px',
          }}
        >
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: '16px' }}>{action}</div>}
    </div>
  );
};
