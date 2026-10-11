import React from 'react';

export const SectionHeader = ({
  title,
  subtitle,
  count,
  actionText,
  onAction,
  actionIcon: ActionIcon,
  children,
  style = {},
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        gap: '12px',
        ...style,
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2
            style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--text-primary, #0f172a)',
              margin: 0,
            }}
          >
            {title}
          </h2>
          {count !== undefined && count !== null && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: 'var(--bg-surface-subtle, #f1f5f9)',
                color: 'var(--text-muted, #94a3b8)',
              }}
            >
              {count}
            </span>
          )}
        </div>
        {subtitle && (
          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted, #94a3b8)',
              margin: '3px 0 0 0',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {actionText && (
          <button
            type="button"
            onClick={onAction}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-primary, #4f46e5)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px',
            }}
          >
            {actionText}
            {ActionIcon && <ActionIcon size={14} />}
          </button>
        )}
        {children}
      </div>
    </div>
  );
};
