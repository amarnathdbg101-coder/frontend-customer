import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const BaseModal = ({
  isOpen,
  onClose,
  maxWidth = '520px',
  maxHeight = '90vh',
  children,
  className = '',
  style = {},
  overlayStyle = {},
  closeOnBackdrop = true,
  closeOnEscape = true,
  zIndex = 1000,
}) => {
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out',
        ...overlayStyle,
      }}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={`modal-content ${className}`}
        style={{
          backgroundColor: 'var(--bg-surface, #ffffff)',
          color: 'var(--text-primary, #0f172a)',
          borderRadius: '16px',
          width: '100%',
          maxWidth,
          maxHeight,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04))',
          border: '1px solid var(--border-subtle, #e2e8f0)',
          overflow: 'hidden',
          position: 'relative',
          animation: 'slideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
          ...style,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export const ModalHeader = ({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'var(--color-primary, #4f46e5)',
  onClose,
  actions,
  children,
  style = {},
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
        backgroundColor: 'var(--bg-surface, #ffffff)',
        flexShrink: 0,
        gap: '12px',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
        {Icon && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-surface-subtle, #f1f5f9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={20} color={iconColor} />
          </div>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          {title && (
            <h2
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--text-primary, #0f172a)',
                margin: 0,
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted, #94a3b8)',
                margin: '2px 0 0 0',
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {actions}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted, #94a3b8)',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle, #f1f5f9)';
              e.currentTarget.style.color = 'var(--text-primary, #0f172a)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted, #94a3b8)';
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export const ModalBody = ({ children, padding = '20px', style = {}, className = '' }) => {
  return (
    <div
      className={className}
      style={{
        padding,
        overflowY: 'auto',
        flex: 1,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const ModalFooter = ({ children, style = {}, align = 'flex-end', padding = '14px 20px' }) => {
  return (
    <div
      style={{
        padding,
        borderTop: '1px solid var(--border-subtle, #e2e8f0)',
        backgroundColor: 'var(--bg-surface, #ffffff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: align,
        gap: '10px',
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
