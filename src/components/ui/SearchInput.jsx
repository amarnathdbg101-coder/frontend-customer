import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchInput = ({
  value = '',
  onChange,
  onClear,
  onSubmit,
  placeholder = 'Search...',
  autoFocus = false,
  size = 'md', // 'sm' | 'md' | 'lg'
  leadingIcon = true,
  clearable = true,
  fullWidth = true,
  disabled = false,
  style = {},
  inputStyle = {},
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: {
      height: '36px',
      fontSize: '0.85rem',
      iconSize: 16,
      paddingLeft: leadingIcon ? '34px' : '10px',
      paddingRight: clearable && value ? '34px' : '10px',
      borderRadius: '8px',
    },
    md: {
      height: '42px',
      fontSize: '0.92rem',
      iconSize: 18,
      paddingLeft: leadingIcon ? '38px' : '12px',
      paddingRight: clearable && value ? '38px' : '12px',
      borderRadius: '10px',
    },
    lg: {
      height: '48px',
      fontSize: '1rem',
      iconSize: 20,
      paddingLeft: leadingIcon ? '44px' : '16px',
      paddingRight: clearable && value ? '44px' : '16px',
      borderRadius: '12px',
    },
  }[size] || {
    height: '42px',
    fontSize: '0.92rem',
    iconSize: 18,
    paddingLeft: leadingIcon ? '38px' : '12px',
    paddingRight: clearable && value ? '38px' : '12px',
    borderRadius: '10px',
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit(value);
    }
  };

  return (
    <div
      className={`search-input-wrapper ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: fullWidth ? '100%' : 'auto',
        ...style,
      }}
    >
      {leadingIcon && (
        <Search
          size={sizeStyles.iconSize}
          style={{
            position: 'absolute',
            left: '12px',
            color: 'var(--text-muted, #94a3b8)',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      )}

      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        style={{
          width: '100%',
          height: sizeStyles.height,
          paddingLeft: sizeStyles.paddingLeft,
          paddingRight: sizeStyles.paddingRight,
          fontSize: sizeStyles.fontSize,
          borderRadius: sizeStyles.borderRadius,
          border: '1.5px solid var(--border-subtle, #e2e8f0)',
          backgroundColor: 'var(--bg-surface, #ffffff)',
          color: 'var(--text-primary, #0f172a)',
          outline: 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          ...inputStyle,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-primary, #4f46e5)';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.15)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-subtle, #e2e8f0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        {...props}
      />

      {clearable && value && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onClear) onClear();
          }}
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: '8px',
            background: 'none',
            border: 'none',
            padding: '4px',
            borderRadius: '50%',
            color: 'var(--text-muted, #94a3b8)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={sizeStyles.iconSize - 2} />
        </button>
      )}
    </div>
  );
};
