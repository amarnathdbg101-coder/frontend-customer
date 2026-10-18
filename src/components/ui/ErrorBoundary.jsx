/**
 * Error Boundary Component
 * 
 * Catches runtime rendering errors in child components, reports to Sentry,
 * and displays a friendly fallback UI with retry capability instead of a white screen.
 */

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
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
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-fallback" role="alert">
          <div className="error-boundary-icon">
            <AlertTriangle size={48} />
          </div>
          <h2 className="error-boundary-title">Something Went Wrong</h2>
          <p className="error-boundary-message">
            Something went wrong. Please try again.
          </p>
          {this.state.error && (
            <details className="error-boundary-details">
              <summary>Technical Details</summary>
              <pre>{this.state.error.message}</pre>
            </details>
          )}
          <button
            onClick={this.handleRetry}
            className="btn btn-primary"
            style={{ marginTop: '16px' }}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
