import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';

export const QuantityStepper = ({
  quantity = 1,
  onIncrement,
  onDecrement,
  min = 1,
  max = 99,
  size = 'md', // 'sm' | 'md' | 'lg'
  showDeleteOnOne = false,
  disabled = false,
  style = {},
}) => {
  const sizeStyles = {
    sm: {
      height: '30px',
      buttonSize: '28px',
      iconSize: 12,
      fontSize: '0.85rem',
      padding: '0 6px',
    },
    md: {
      height: '38px',
      buttonSize: '34px',
      iconSize: 14,
      fontSize: '0.95rem',
      padding: '0 10px',
    },
    lg: {
      height: '46px',
      buttonSize: '40px',
      iconSize: 18,
      fontSize: '1.1rem',
      padding: '0 14px',
    },
  }[size] || {
    height: '38px',
    buttonSize: '34px',
    iconSize: 14,
    fontSize: '0.95rem',
    padding: '0 10px',
  };

  const isAtMin = quantity <= min;
  const isAtMax = quantity >= max;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1.5px solid var(--border-subtle, #e2e8f0)',
        borderRadius: '10px',
        backgroundColor: 'var(--bg-surface, #ffffff)',
        height: sizeStyles.height,
        overflow: 'hidden',
        userSelect: 'none',
        ...style,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        disabled={disabled || (isAtMin && !showDeleteOnOne)}
        onClick={(e) => {
          e.stopPropagation();
          if (onDecrement) onDecrement();
        }}
        aria-label="Decrease quantity"
        style={{
          width: sizeStyles.buttonSize,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          color: (isAtMin && showDeleteOnOne) ? 'var(--color-danger, #ef4444)' : 'var(--text-primary, #0f172a)',
          cursor: disabled || (isAtMin && !showDeleteOnOne) ? 'not-allowed' : 'pointer',
          opacity: disabled || (isAtMin && !showDeleteOnOne) ? 0.4 : 1,
          transition: 'background-color 0.15s',
        }}
        onMouseEnter={(e) => {
          if (!disabled) e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle, #f1f5f9)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {isAtMin && showDeleteOnOne ? (
          <Trash2 size={sizeStyles.iconSize} />
        ) : (
          <Minus size={sizeStyles.iconSize} />
        )}
      </button>

      <span
        style={{
          padding: sizeStyles.padding,
          fontWeight: 700,
          fontSize: sizeStyles.fontSize,
          color: 'var(--text-primary, #0f172a)',
          minWidth: '28px',
          textAlign: 'center',
        }}
      >
        {quantity}
      </span>

      <button
        type="button"
        disabled={disabled || isAtMax}
        onClick={(e) => {
          e.stopPropagation();
          if (onIncrement) onIncrement();
        }}
        aria-label="Increase quantity"
        style={{
          width: sizeStyles.buttonSize,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-primary, #0f172a)',
          cursor: disabled || isAtMax ? 'not-allowed' : 'pointer',
          opacity: disabled || isAtMax ? 0.4 : 1,
          transition: 'background-color 0.15s',
        }}
        onMouseEnter={(e) => {
          if (!disabled && !isAtMax) e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle, #f1f5f9)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Plus size={sizeStyles.iconSize} />
      </button>
    </div>
  );
};
