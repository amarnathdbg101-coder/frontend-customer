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

/** Skeleton for a product card matching exact ProductCard layout */
export const SkeletonProductCard = () => (
  <div
    style={{
      backgroundColor: 'var(--bg-surface, #ffffff)',
      borderRadius: '16px',
      border: '1px solid var(--border-subtle, #e2e8f0)',
      padding: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    }}
  >
    <div>
      {/* 1. Square Image Placeholder (1:1 Ratio) */}
      <div style={{ width: '100%', aspectRatio: '1 / 1', backgroundColor: 'var(--bg-surface-subtle, #f8fafc)', borderRadius: '12px', padding: '10px' }}>
        <Skeleton width="100%" height="100%" borderRadius="10px" />
      </div>

      {/* 2. Availability Placeholder */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', marginBottom: '4px' }}>
        <Skeleton width="8px" height="8px" borderRadius="50%" />
        <Skeleton width="75px" height="12px" borderRadius="4px" />
      </div>

      {/* 3. Product Title Placeholder (2 Lines) */}
      <div style={{ margin: '4px 0 6px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Skeleton height="14px" width="90%" borderRadius="4px" />
        <Skeleton height="14px" width="60%" borderRadius="4px" />
      </div>

      {/* 4. Price & Savings Placeholder */}
      <div style={{ marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Skeleton height="18px" width="55px" borderRadius="4px" />
          <Skeleton height="12px" width="35px" borderRadius="4px" />
        </div>
        <Skeleton height="12px" width="60px" borderRadius="4px" />
      </div>

      {/* 5. Store Information Chip Placeholder */}
      <div style={{ backgroundColor: 'var(--bg-surface-subtle, #f8fafc)', border: '1px solid var(--border-subtle, #f1f5f9)', borderRadius: '8px', padding: '6px 8px', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Skeleton height="12px" width="85%" borderRadius="4px" />
        <Skeleton height="10px" width="50%" borderRadius="4px" />
      </div>
    </div>

    {/* 6. Dual Action Buttons Placeholder */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: 'auto' }}>
      <Skeleton height="30px" width="100%" borderRadius="8px" />
      <Skeleton height="30px" width="100%" borderRadius="8px" />
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
