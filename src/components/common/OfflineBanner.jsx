import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);
  const { isHindi } = useLanguage();

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        padding: '10px 16px',
        backgroundColor: isOffline ? '#ef4444' : '#10b981',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '0.875rem',
        fontWeight: '600',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        transition: 'transform 0.3s ease-in-out',
        animation: 'slideDown 0.3s ease-out',
      }}
    >
      <style>{
        `@keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }`
      }</style>
      <span>
        {isOffline ? '⚡' : '✅'}
      </span>
      <span>
        {isOffline
          ? (isHindi 
              ? 'आप अभी ऑफलाइन हैं। सहेजे गए कैटलॉग दिखाए जा रहे हैं।' 
              : 'You are currently offline. Showing cached catalog.')
          : (isHindi 
              ? 'इंटरनेट वापस जुड़ गया है!' 
              : 'Connection restored! Live inventory active.')
        }
      </span>
    </div>
  );
}
