import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.jsx'

// Initialize Sentry for real-time error tracking if DSN is configured
const sentryDsn = import.meta.env.VITE_SENTRY_DSN
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE || 'production',
  })
}

// Global Handler for Dynamic Import Chunk Loading Errors (e.g. after new production deployments)
if (typeof window !== 'undefined') {
  const handleChunkError = (event) => {
    const errorMsg = event?.message || event?.reason?.message || event?.reason || event?.error?.message || '';
    const errorStr = String(errorMsg);

    if (
      errorStr.includes('Failed to fetch dynamically imported module') ||
      errorStr.includes('Importing a module script failed') ||
      errorStr.includes('Failed to load module script') ||
      errorStr.includes('error loading dynamically imported module')
    ) {
      console.warn('[ChunkLoader] Dynamic module import failed due to build update. Triggering auto-refresh...', errorStr);

      const lastReload = sessionStorage.getItem('shopsilo_chunk_reload');
      const now = Date.now();

      // Auto-refresh page once if not reloaded in the last 10 seconds
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem('shopsilo_chunk_reload', String(now));
        window.location.reload();
      }
    }
  };

  window.addEventListener('error', handleChunkError);
  window.addEventListener('unhandledrejection', handleChunkError);
}

// Register Service Worker for PWA capabilities
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('PWA SW registration failed:', err);
    });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
