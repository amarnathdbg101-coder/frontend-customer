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
      height: '32px',
      buttonSize: '30px',
      iconSize: 13,
      fontSize: '0.88rem',
      padding: '0 8px',
    },
    md: {
      height: '38px',
      buttonSize: '36px',
      iconSize: 15,
      fontSize: '0.95rem',
      padding: '0 12px',
    },
    lg: {
      height: '46px',
      buttonSize: '42px',
      iconSize: 18,
      fontSize: '1.1rem',
      padding: '0 16px',
    },
  }[size] || {
    height: '38px',
    buttonSize: '36px',
    iconSize: 15,
    fontSize: '0.95rem',
    padding: '0 12px',
  };

  const isAtMin = quantity <= min;
  const isAtMax = quantity >= max;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1.5px solid #0f172a',
        borderRadius: '8px',
        backgroundColor: 'var(--bg-surface, #ffffff)',
        height: sizeStyles.height,
        overflow: 'hidden',
        userSelect: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        ...style,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Decrement Button */}
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
          backgroundColor: (isAtMin && !showDeleteOnOne) ? '#f8fafc' : '#f1f5f9',
          border: 'none',
          borderRight: '1px solid #cbd5e1',
          color: (isAtMin && showDeleteOnOne)
            ? '#dc2626'
            : (isAtMin && !showDeleteOnOne)
              ? '#94a3b8'
              : '#0f172a',
          cursor: disabled || (isAtMin && !showDeleteOnOne) ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        {isAtMin && showDeleteOnOne ? (
          <Trash2 size={sizeStyles.iconSize} strokeWidth={2.5} />
        ) : (
          <Minus size={sizeStyles.iconSize} strokeWidth={2.5} />
        )}
      </button>

      {/* Quantity Count */}
      <span
        style={{
          padding: sizeStyles.padding,
          fontWeight: 800,
          fontSize: sizeStyles.fontSize,
          color: 'var(--text-primary, #0f172a)',
          minWidth: '32px',
          textAlign: 'center',
        }}
      >
        {quantity}
      </span>

      {/* Increment Button (High-Contrast Solid Dark Button) */}
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
          backgroundColor: disabled || isAtMax ? '#f1f5f9' : '#0f172a',
          border: 'none',
          borderLeft: '1px solid #cbd5e1',
          color: disabled || isAtMax ? '#94a3b8' : '#ffffff',
          cursor: disabled || isAtMax ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <Plus size={sizeStyles.iconSize} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default QuantityStepper;
