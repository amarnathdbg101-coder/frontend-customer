import React from 'react';

export const Card = ({
  children,
  variant = 'default', // 'default' | 'subtle' | 'elevated' | 'interactive'
  padding = '16px',
  onClick,
  style = {},
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: {
      backgroundColor: 'var(--bg-surface, #ffffff)',
      border: '1px solid var(--border-subtle, #e2e8f0)',
      boxShadow: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))',
    },
    subtle: {
      backgroundColor: 'var(--bg-surface-subtle, #f1f5f9)',
      border: '1px solid var(--border-subtle, #e2e8f0)',
    },
    elevated: {
      backgroundColor: 'var(--bg-surface, #ffffff)',
      border: '1px solid var(--border-subtle, #e2e8f0)',
      boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))',
    },
    interactive: {
      backgroundColor: 'var(--bg-surface, #ffffff)',
      border: '1px solid var(--border-subtle, #e2e8f0)',
      boxShadow: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))',
      cursor: 'pointer',
      transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
    },
  }[variant] || {
    backgroundColor: 'var(--bg-surface, #ffffff)',
    border: '1px solid var(--border-subtle, #e2e8f0)',
    boxShadow: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))',
  };

  return (
    <div
      className={`card ${className}`}
      onClick={onClick}
      style={{
        borderRadius: 'var(--radius-lg, 16px)',
        padding,
        color: 'var(--text-primary, #0f172a)',
        ...variantStyles,
        ...style,
      }}
      onMouseEnter={variant === 'interactive' ? (e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.08))';
        e.currentTarget.style.borderColor = 'var(--border-strong, #cbd5e1)';
      } : undefined}
      onMouseLeave={variant === 'interactive' ? (e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))';
        e.currentTarget.style.borderColor = 'var(--border-subtle, #e2e8f0)';
      } : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export const StatCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  variant = 'default',
  onClick,
  style = {},
}) => {
  return (
    <Card
      variant={onClick ? 'interactive' : variant}
      onClick={onClick}
      padding="16px"
      style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>{label}</span>
        {Icon && (
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface-subtle, #f1f5f9)',
              color: 'var(--color-primary, #4f46e5)',
              display: 'flex',
            }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>
      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>{value}</div>
      {subtext && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #475569)' }}>{subtext}</div>}
    </Card>
  );
};
