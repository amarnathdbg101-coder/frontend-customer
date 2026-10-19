/**
 * Error Boundary Component
 * 
 * Catches runtime rendering errors in child components, reports to Sentry,
 * handles chunk dynamic import load failures gracefully on new builds,
 * and displays a friendly fallback UI with retry capability instead of a white screen.
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import * as Sentry from '@sentry/react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.captureException(error, { extra: errorInfo });
    }

    // Auto-reload on dynamic import chunk error if not reloaded recently
    const errorStr = String(error?.message || error || '');
    if (
      errorStr.includes('Failed to fetch dynamically imported module') ||
      errorStr.includes('Importing a module script failed') ||
      errorStr.includes('Failed to load module script')
    ) {
      const lastReload = sessionStorage.getItem('shopsilo_chunk_reload');
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem('shopsilo_chunk_reload', String(now));
        window.location.reload();
      }
    }
  }

  handleRetry = () => {
    const errorStr = String(this.state.error?.message || this.state.error || '');
    if (
      errorStr.includes('Failed to fetch dynamically imported module') ||
      errorStr.includes('Importing a module script failed') ||
      errorStr.includes('Failed to load module script')
    ) {
      sessionStorage.removeItem('shopsilo_chunk_reload');
      window.location.reload();
      return;
    }
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorStr = String(this.state.error?.message || this.state.error || '');
      const isChunkError =
        errorStr.includes('Failed to fetch dynamically imported module') ||
        errorStr.includes('Importing a module script failed') ||
        errorStr.includes('Failed to load module script');

      return (
        <div
          className="error-boundary-fallback"
          role="alert"
          style={{
            padding: '32px 20px',
            maxWidth: '480px',
            margin: '40px auto',
            textAlign: 'center',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-surface, #ffffff)',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: isChunkError ? 'rgba(79, 70, 229, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: isChunkError ? 'var(--color-primary, #4f46e5)' : 'var(--color-danger, #ef4444)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            {isChunkError ? <Sparkles size={32} /> : <AlertTriangle size={32} />}
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
            {isChunkError ? 'New Update Available / नया अपडेट उपलब्ध है' : 'Something Went Wrong'}
          </h2>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
            {isChunkError
              ? 'A fresh update has been deployed. Please refresh to load the latest app version.'
              : 'An unexpected error occurred. Please refresh or try again.'}
          </p>

          {this.state.error && (
            <details style={{ textAlign: 'left', margin: '12px 0 16px 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Technical Details</summary>
              <pre style={{ overflowX: 'auto', padding: '8px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: '6px', marginTop: '6px' }}>
                {this.state.error.message}
              </pre>
            </details>
          )}

          <button
            onClick={this.handleRetry}
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              fontWeight: 700,
            }}
          >
            <RefreshCw size={16} />
            {isChunkError ? 'Refresh Application / ऐप रिफ्रेश करें' : 'Try Again'}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
