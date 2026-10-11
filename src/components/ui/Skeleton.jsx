/**
 * Skeleton Loader Components
 * 
 * Pulse-animated placeholder shapes displayed while content is loading.
 * Pixel-perfect match with ProductCard & ShopCard layouts to deliver 0 Cumulative Layout Shift (CLS).
 */

import React from 'react';

export const Skeleton = ({ width = '100%', height = '16px', borderRadius = 'var(--radius-sm)', style = {} }) => (
  <div
    className="skeleton-pulse"
    aria-hidden="true"
    style={{
      width,
      height,
      borderRadius,
      backgroundColor: 'var(--bg-surface-subtle)',
      ...style,
    }}
  />
);

export const SkeletonText = ({ lines = 3, lastLineWidth = '60%' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height="14px"
        width={i === lines - 1 ? lastLineWidth : '100%'}
      />
    ))}
  </div>
);

export const SkeletonAvatar = ({ size = '44px' }) => (
  <Skeleton width={size} height={size} borderRadius="50%" />
);

export const SkeletonImage = ({ height = '160px' }) => (
  <Skeleton width="100%" height={height} borderRadius="var(--radius-sm)" />
);

/** Skeleton for a product card matching exact ProductCard square layout */
export const SkeletonProductCard = () => (
  <div
    style={{
      backgroundColor: 'var(--bg-surface, #ffffff)',
      borderRadius: '14px',
      border: '1px solid var(--border-subtle, #e2e8f0)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
    }}
  >
    <div>
      {/* Square Image Placeholder (1:1 Ratio) */}
      <div style={{ width: '100%', aspectRatio: '1 / 1', backgroundColor: 'var(--bg-surface-subtle, #f8fafc)', padding: '6px' }}>
        <Skeleton width="100%" height="100%" borderRadius="10px" />
      </div>

      {/* 1-Line Title Placeholder */}
      <div style={{ padding: '8px 10px 4px 10px' }}>
        <Skeleton height="14px" width="80%" borderRadius="4px" />
      </div>
    </div>

    {/* Price & Button Placeholder Row */}
    <div
      style={{
        padding: '0 10px 10px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '4px',
      }}
    >
      <Skeleton height="18px" width="48px" borderRadius="4px" />
      <Skeleton height="26px" width="54px" borderRadius="6px" />
    </div>
  </div>
);

/** Skeleton for a shop card matching ShopCard layout */
export const SkeletonShopCard = () => (
  <div className="card" style={{ margin: 0, padding: '16px' }}>
    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
      <Skeleton width="64px" height="64px" borderRadius="var(--radius-md)" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Skeleton height="18px" width="70%" />
        <div style={{ display: 'flex', gap: '6px' }}>
          <Skeleton height="14px" width="80px" borderRadius="6px" />
          <Skeleton height="14px" width="60px" borderRadius="6px" />
        </div>
        <Skeleton height="12px" width="50%" />
        <Skeleton height="12px" width="65%" />
      </div>
    </div>
    <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
      <Skeleton height="34px" width="30%" borderRadius="var(--radius-sm)" />
      <Skeleton height="34px" width="70%" borderRadius="var(--radius-sm)" />
    </div>
  </div>
);

/** Grid of skeleton cards */
export const SkeletonProductGrid = ({ count = 6 }) => (
  <div className="customer-product-grid">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonProductCard key={i} />
    ))}
  </div>
);

export const SkeletonShopGrid = ({ count = 4 }) => (
  <div className="customer-shop-grid">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonShopCard key={i} />
    ))}
  </div>
);

export const CardSkeleton = SkeletonProductCard;
