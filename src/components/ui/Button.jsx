import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'whatsapp' | 'ghost' | 'subtle'
  size = 'md', // 'sm' | 'md' | 'lg'
  children,
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  onClick,
  fullWidth = false,
  type = 'button',
  style = {},
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: {
      padding: '7px 12px',
      fontSize: '0.82rem',
      borderRadius: '8px',
      gap: '6px',
      minHeight: '32px',
    },
    md: {
      padding: '10px 16px',
      fontSize: '0.92rem',
      borderRadius: '10px',
      gap: '8px',
      minHeight: '40px',
    },
    lg: {
      padding: '13px 22px',
      fontSize: '1rem',
      borderRadius: '12px',
      gap: '10px',
      minHeight: '48px',
    },
  }[size] || {
    padding: '10px 16px',
    fontSize: '0.92rem',
    borderRadius: '10px',
    gap: '8px',
    minHeight: '40px',
  };

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
    },
    secondary: {
      backgroundColor: 'var(--bg-surface-subtle, #f1f5f9)',
      color: 'var(--text-primary, #0f172a)',
      border: '1px solid var(--border-subtle, #e2e8f0)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-primary, #4f46e5)',
      border: '1.5px solid var(--color-primary, #4f46e5)',
    },
    danger: {
      backgroundColor: 'var(--color-danger, #ef4444)',
      color: '#ffffff',
      border: 'none',
    },
    success: {
      backgroundColor: 'var(--color-success, #10b981)',
      color: '#ffffff',
      border: 'none',
    },
    whatsapp: {
      backgroundColor: '#16a34a',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary, #475569)',
      border: 'none',
    },
    subtle: {
      backgroundColor: 'var(--bg-surface-subtle, #f1f5f9)',
      color: 'var(--text-secondary, #475569)',
      border: 'none',
    },
  }[variant] || {
    background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn btn-${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.15s ease',
        width: fullWidth ? '100%' : 'auto',
        userSelect: 'none',
        textDecoration: 'none',
        ...sizeStyles,
        ...variantStyles,
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 14 : 18} style={{ animation: 'spin 1s linear infinite' }} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : 18} />
      ) : null}
      {children}
      {!loading && IconRight && <IconRight size={size === 'sm' ? 14 : 18} />}
    </button>
  );
};
