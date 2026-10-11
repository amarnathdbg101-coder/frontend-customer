import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const AlertBanner = ({
  type = 'error', // 'error' | 'success' | 'warning' | 'info'
  message,
  description,
  onDismiss,
  action,
  style = {},
}) => {
  if (!message && !description) return null;

  const config = {
    error: {
      icon: AlertCircle,
      bg: 'rgba(239, 68, 68, 0.08)',
      border: 'rgba(239, 68, 68, 0.25)',
      color: '#dc2626',
    },
    success: {
      icon: CheckCircle2,
      bg: 'rgba(16, 185, 129, 0.08)',
      border: 'rgba(16, 185, 129, 0.25)',
      color: '#059669',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'rgba(245, 158, 11, 0.08)',
      border: 'rgba(245, 158, 11, 0.25)',
      color: '#d97706',
    },
    info: {
      icon: Info,
      bg: 'rgba(2, 132, 199, 0.08)',
      border: 'rgba(2, 132, 199, 0.25)',
      color: '#0284c7',
    },
  }[type] || {
    icon: AlertCircle,
    bg: 'rgba(239, 68, 68, 0.08)',
    border: 'rgba(239, 68, 68, 0.25)',
    color: '#dc2626',
  };

  const Icon = config.icon;

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '12px 14px',
        borderRadius: '10px',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        marginBottom: '14px',
        ...style,
      }}
    >
      <Icon size={18} color={config.color} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {message && (
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: config.color, lineHeight: 1.4 }}>
            {message}
          </div>
        )}
        {description && (
          <div
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-secondary, #475569)',
              marginTop: message ? '4px' : '0',
              lineHeight: 1.4,
            }}
          >
            {description}
          </div>
        )}
      </div>

      {action}

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: config.color,
            padding: '2px',
            opacity: 0.7,
          }}
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
