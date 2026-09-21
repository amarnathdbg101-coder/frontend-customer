import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Exception caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            background: 'var(--bg-primary, #0f172a)',
            color: 'var(--text-primary, #f8fafc)',
          }}
        >
          <div
            style={{
              padding: '16px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              marginBottom: '16px',
            }}
          >
            <AlertTriangle size={48} color="#ef4444" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
            Oops! Something went wrong
          </h2>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary, #94a3b8)',
              maxWidth: '400px',
              marginBottom: '24px',
            }}
          >
            {this.state.error?.message || 'An unexpected error occurred while loading this screen.'}
          </p>
          <button
            onClick={this.handleReload}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'var(--color-primary, #6366f1)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} />
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
