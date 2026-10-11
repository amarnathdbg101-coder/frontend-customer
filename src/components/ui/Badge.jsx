import React from 'react';

export const Badge = ({
  variant = 'neutral', // 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'bargain'
  size = 'md', // 'sm' | 'md'
  icon: Icon,
  children,
  pill = true,
  onClick,
  style = {},
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: {
      padding: '2px 8px',
      fontSize: '0.72rem',
      gap: '4px',
    },
    md: {
      padding: '4px 10px',
      fontSize: '0.8rem',
      gap: '6px',
    },
  }[size] || {
    padding: '4px 10px',
    fontSize: '0.8rem',
    gap: '6px',
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'rgba(79, 70, 229, 0.12)',
      color: '#4f46e5',
      border: '1px solid rgba(79, 70, 229, 0.25)',
    },
    success: {
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      color: '#059669',
      border: '1px solid rgba(16, 185, 129, 0.25)',
    },
    warning: {
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
      color: '#d97706',
      border: '1px solid rgba(245, 158, 11, 0.25)',
    },
    danger: {
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
      color: '#dc2626',
      border: '1px solid rgba(239, 68, 68, 0.25)',
    },
    info: {
      backgroundColor: 'rgba(2, 132, 199, 0.12)',
      color: '#0284c7',
      border: '1px solid rgba(2, 132, 199, 0.25)',
    },
    neutral: {
      backgroundColor: 'var(--bg-surface-subtle, #f1f5f9)',
      color: 'var(--text-secondary, #475569)',
      border: '1px solid var(--border-subtle, #e2e8f0)',
    },
    bargain: {
      backgroundColor: 'rgba(124, 58, 237, 0.12)',
      color: '#7c3aed',
      border: '1px solid rgba(124, 58, 237, 0.25)',
    },
  }[variant] || {
    backgroundColor: 'var(--bg-surface-subtle, #f1f5f9)',
    color: 'var(--text-secondary, #475569)',
    border: '1px solid var(--border-subtle, #e2e8f0)',
  };

  return (
    <span
      className={`badge badge-${variant} ${className}`}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontWeight: 600,
        borderRadius: pill ? '9999px' : '6px',
        lineHeight: 1.2,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        ...sizeStyles,
        ...variantStyles,
        ...style,
      }}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 12 : 14} style={{ flexShrink: 0 }} />}
      {children}
    </span>
  );
};
