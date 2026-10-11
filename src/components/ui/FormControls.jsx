import React from 'react';

export const FormField = ({
  label,
  required = false,
  error,
  helperText,
  children,
  style = {},
  labelStyle = {},
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px', ...style }}>
      {label && (
        <label
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-secondary, #475569)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            ...labelStyle,
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span>}
        </label>
      )}
      {children}
      {error && (
        <span style={{ fontSize: '0.78rem', color: 'var(--color-danger, #ef4444)', marginTop: '2px' }}>
          {error}
        </span>
      )}
      {!error && helperText && (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)', marginTop: '2px' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};

export const Input = ({
  error,
  fullWidth = true,
  style = {},
  className = '',
  ...props
}) => {
  return (
    <input
      className={`form-input ${className}`}
      style={{
        width: fullWidth ? '100%' : 'auto',
        height: '42px',
        padding: '0 14px',
        borderRadius: '10px',
        border: `1.5px solid ${error ? 'var(--color-danger, #ef4444)' : 'var(--border-subtle, #e2e8f0)'}`,
        backgroundColor: 'var(--bg-surface, #ffffff)',
        color: 'var(--text-primary, #0f172a)',
        fontSize: '0.92rem',
        outline: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        ...style,
      }}
      onFocus={(e) => {
        if (!error) {
          e.currentTarget.style.borderColor = 'var(--color-primary, #4f46e5)';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.15)';
        }
      }}
      onBlur={(e) => {
        if (!error) {
          e.currentTarget.style.borderColor = 'var(--border-subtle, #e2e8f0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
      {...props}
    />
  );
};

export const Textarea = ({
  error,
  fullWidth = true,
  rows = 4,
  style = {},
  className = '',
  ...props
}) => {
  return (
    <textarea
      rows={rows}
      className={`form-textarea ${className}`}
      style={{
        width: fullWidth ? '100%' : 'auto',
        padding: '12px 14px',
        borderRadius: '10px',
        border: `1.5px solid ${error ? 'var(--color-danger, #ef4444)' : 'var(--border-subtle, #e2e8f0)'}`,
        backgroundColor: 'var(--bg-surface, #ffffff)',
        color: 'var(--text-primary, #0f172a)',
        fontSize: '0.92rem',
        outline: 'none',
        fontFamily: 'inherit',
        resize: 'vertical',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        ...style,
      }}
      onFocus={(e) => {
        if (!error) {
          e.currentTarget.style.borderColor = 'var(--color-primary, #4f46e5)';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.15)';
        }
      }}
      onBlur={(e) => {
        if (!error) {
          e.currentTarget.style.borderColor = 'var(--border-subtle, #e2e8f0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
      {...props}
    />
  );
};

export const Select = ({
  options = [],
  error,
  fullWidth = true,
  children,
  style = {},
  className = '',
  ...props
}) => {
  return (
    <select
      className={`form-select ${className}`}
      style={{
        width: fullWidth ? '100%' : 'auto',
        height: '42px',
        padding: '0 14px',
        borderRadius: '10px',
        border: `1.5px solid ${error ? 'var(--color-danger, #ef4444)' : 'var(--border-subtle, #e2e8f0)'}`,
        backgroundColor: 'var(--bg-surface, #ffffff)',
        color: 'var(--text-primary, #0f172a)',
        fontSize: '0.92rem',
        outline: 'none',
        cursor: 'pointer',
        ...style,
      }}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value ?? opt} value={opt.value ?? opt}>
          {opt.label ?? opt}
        </option>
      ))}
      {children}
    </select>
  );
};
