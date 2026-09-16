/**
 * Branded Loading Spinner
 * 
 * Centered full-height spinner with ShopSilo branding.
 * Used as Suspense fallback and route-level loading state.
 */

import React from 'react';
import { Store } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
  return (
    <div
      className="loading-spinner-container"
      role="status"
      aria-live="polite"
      aria-label={message}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '60px 20px',
        minHeight: fullScreen ? '100vh' : '300px',
        color: 'var(--text-secondary)',
      }}
    >
      <div className="loading-spinner-icon" aria-hidden="true">
        <Store size={32} color="var(--color-primary)" />
      </div>
      <div className="loading-spinner-dots" aria-hidden="true">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
      <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{message}</span>
    </div>
  );
};
