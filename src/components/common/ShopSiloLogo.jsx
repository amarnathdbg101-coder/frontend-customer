import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable, production-grade ShopSilo Brand Logo component.
 * Exact 1:1 match with Flutter's ShopSiloLogo (lib/core/widgets/shopsilo_logo.dart).
 * 
 * Features:
 * - Rounded squircle icon container with exact 0.28 radius curve
 * - Material Icons Storefront Rounded geometry matching mobile Flutter app
 * - Flexible variants: 'gradient' (default), 'tint' (light indigo), 'white'
 * - Typography with heavy 900-weight branding and optional subtitle
 * - Clickable routing link support
 */
export const ShopSiloLogo = ({
  size = 36,
  showText = true,
  subtitle,
  textColor,
  variant = 'gradient', // 'gradient' | 'tint' | 'white'
  to = null,
  className = '',
  style = {},
}) => {
  const radius = Math.round(size * 0.28);
  const iconSize = Math.round(size * 0.58);

  // Background and icon styling per variant
  let bgStyle = {
    background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #4338ca 100%)',
    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
    color: '#ffffff',
  };

  if (variant === 'tint') {
    bgStyle = {
      background: 'var(--color-primary-light, #eef2ff)',
      border: '1.5px solid rgba(79, 70, 229, 0.18)',
      boxShadow: 'none',
      color: 'var(--color-primary, #4f46e5)',
    };
  } else if (variant === 'white') {
    bgStyle = {
      background: '#ffffff',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
      color: 'var(--color-primary, #4f46e5)',
    };
  }

  const logoIcon = (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${radius}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...bgStyle,
      }}
      aria-hidden="true"
    >
      {/* Material Icons Storefront Rounded SVG */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ display: 'block' }}
      >
        <path d="M21.9 8.89l-.98-4.42c-.2-.88-.98-1.47-1.88-1.47H4.96c-.9 0-1.68.59-1.88 1.47l-.98 4.42c-.24 1.07.39 2.11 1.42 2.46.2.07.41.11.62.13V20c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8.52c.21-.02.42-.06.62-.13 1.03-.35 1.66-1.39 1.42-2.46zM18 20H6v-7.06c.32-.08.62-.23.88-.44.53-.44.88-1.07.97-1.78.16.03.32.06.49.06.62 0 1.18-.26 1.6-.68.41.42.97.68 1.59.68.62 0 1.18-.26 1.6-.68.41.42.97.68 1.59.68.62 0 1.18-.26 1.6-.68.09.71.44 1.34.97 1.78.26.21.56.36.88.44V20zm-9-2v-4h6v4H9z" />
      </svg>
    </div>
  );

  const content = (
    <div
      className={`shopsilo-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${Math.max(6, Math.round(size * 0.28))}px`,
        textDecoration: 'none',
        ...style,
      }}
    >
      {logoIcon}

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, lineHeight: 1.15 }}>
          <span
            style={{
              fontSize: `${Math.max(14, Math.round(size * 0.52))}px`,
              fontWeight: 900,
              color: textColor || 'var(--text-primary, #0f172a)',
              letterSpacing: '-0.4px',
              fontFamily: 'inherit',
            }}
          >
            ShopSilo
          </span>
          {subtitle && (
            <span
              style={{
                fontSize: `${Math.max(10, Math.round(size * 0.28))}px`,
                fontWeight: 600,
                color: 'var(--text-secondary, #64748b)',
                letterSpacing: '0.2px',
                marginTop: '1px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: 'none', color: 'inherit', display: 'inline-block' }}>
        {content}
      </Link>
    );
  }

  return content;
};

export default ShopSiloLogo;
