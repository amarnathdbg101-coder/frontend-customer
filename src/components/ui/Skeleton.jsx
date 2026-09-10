/**
 * Skeleton Loader Components
 * 
 * Pulse-animated placeholder shapes displayed while content is loading.
 * Matches the design tokens from variables.css.
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

/** Skeleton for a product card matching ProductCard layout */
export const SkeletonProductCard = () => (
  <div className="card" style={{ margin: 0, padding: '12px' }}>
    <SkeletonImage height="160px" />
    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Skeleton height="12px" width="40%" />
      <Skeleton height="16px" width="85%" />
      <Skeleton height="14px" width="55%" />
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <Skeleton height="20px" width="60px" />
        <Skeleton height="20px" width="40px" />
      </div>
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
