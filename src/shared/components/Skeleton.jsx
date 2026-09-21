import React from 'react';

export const Skeleton = ({
  width = '100%',
  height = '20px',
  borderRadius = '6px',
  style = {},
}) => {
  return (
    <div
      className="skeleton-loader"
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--border-color, #e2e8f0)',
        opacity: 0.6,
        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
};

export const CardSkeleton = () => (
  <div
    style={{
      padding: '16px',
      borderRadius: '12px',
      backgroundColor: 'var(--bg-card, #ffffff)',
      border: '1px solid var(--border-color, #e2e8f0)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}
  >
    <Skeleton height="140px" borderRadius="8px" />
    <Skeleton width="70%" height="18px" />
    <Skeleton width="40%" height="14px" />
  </div>
);
