import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, CheckCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { BaseModal, ModalHeader, ModalBody, ModalFooter, Button } from '../ui';

const DISMISS_KEY = 'shopsilo_pwa_dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function PWAInstallBanner() {
  const { isHindi, t } = useLanguage();
  const { totalItems } = useCart();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // default true until checked
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone mode (installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Check if recently dismissed
    const dismissedTime = localStorage.getItem(DISMISS_KEY);
    if (dismissedTime && Date.now() - Number(dismissedTime) < DISMISS_DURATION) {
      setIsDismissed(true);
    } else {
      setIsDismissed(false);
    }

    // 3. Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua) && !window.MSStream;
    const isSafari = ua.includes('safari') && !ua.includes('crios') && !ua.includes('fxios');
    if (isIosDevice && isSafari && !isStandalone) {
      setIsIOS(true);
      setIsInstallable(true);
    }

    // 4. Capture Chromium beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult?.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch {
      // Ignored
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setIsDismissed(true);
  };

  // Don't render if already installed, dismissed, or not installable
  if (isInstalled || isDismissed || !isInstallable) {
    return null;
  }

  // Calculate bottom offset to yield nicely to FloatingCartBar if cart has items
  const bottomOffset = totalItems > 0
    ? 'calc(var(--bottom-nav-height, 64px) + 72px)'
    : 'calc(var(--bottom-nav-height, 64px) + 12px)';

  return (
    <>
      <div
        className="pwa-install-banner"
        role="region"
        aria-label="Install App Banner"
        style={{
          position: 'fixed',
          bottom: bottomOffset,
          left: '12px',
          right: '12px',
          maxWidth: '460px',
          margin: '0 auto',
          zIndex: 88,
          backgroundColor: 'var(--bg-surface, #ffffff)',
          border: '1.5px solid var(--border-subtle, #e2e8f0)',
          borderRadius: '16px',
          padding: '12px 14px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.14)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          backdropFilter: 'blur(10px)',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          transition: 'bottom 0.3s ease',
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(40px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>

        {/* Left: App Logo & Details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 8px rgba(79, 70, 229, 0.35)',
              flexShrink: 0,
            }}
          >
            <img
              src="/favicon.svg"
              alt="ShopSilo"
              style={{ width: '24px', height: '24px', filter: 'brightness(0) invert(1)' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--text-primary, #0f172a)' }}>
                {t('pwa.install_title', 'Get the ShopSilo App')}
              </span>
              <Sparkles size={13} color="#f59e0b" />
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-secondary, #64748b)',
                marginTop: '1px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {t('pwa.install_subtitle', 'Instant counter pickup & live khata updates')}
            </div>
          </div>
        </div>

        {/* Right: Install & Dismiss Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleInstallClick}
            style={{
              backgroundColor: 'var(--color-primary, #4f46e5)',
              color: '#ffffff',
              border: 'none',
              padding: '7px 12px',
              borderRadius: '10px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Download size={13} strokeWidth={2.5} />
            <span>{t('pwa.install_button', 'Install App')}</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted, #94a3b8)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={t('pwa.dismiss', 'Not now')}
            aria-label="Dismiss app install banner"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* iOS Safari Installation Instruction Modal */}
      {showIOSModal && (
        <BaseModal isOpen={showIOSModal} onClose={() => setShowIOSModal(false)} maxWidth="420px">
          <ModalHeader
            title={t('pwa.ios_title', 'Install ShopSilo on iPhone / iPad')}
            icon={Download}
            onClose={() => setShowIOSModal(false)}
          />
          <ModalBody padding="20px">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                  border: '1px solid var(--border-subtle, #e2e8f0)',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    color: 'var(--color-primary, #4f46e5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  <Share size={16} />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  <strong>{isHindi ? '1. शेयर बटन दबाएं' : '1. Tap Share'}:</strong>{' '}
                  {t('pwa.ios_step1', 'Tap the Share button at the bottom of Safari.')}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                  border: '1px solid var(--border-subtle, #e2e8f0)',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    color: 'var(--color-primary, #4f46e5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  <PlusSquare size={16} />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  <strong>{isHindi ? '2. होम स्क्रीन चुनें' : '2. Add to Home Screen'}:</strong>{' '}
                  {t('pwa.ios_step2', "Scroll down and select 'Add to Home Screen'.")}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                  border: '1px solid var(--border-subtle, #e2e8f0)',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle size={16} />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  <strong>{isHindi ? '3. पुष्टि करें' : '3. Tap Add'}:</strong>{' '}
                  {t('pwa.ios_step3', "Tap 'Add' in the top-right corner to finish.")}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" fullWidth onClick={() => setShowIOSModal(false)}>
              {t('pwa.ios_done', 'Got it')}
            </Button>
          </ModalFooter>
        </BaseModal>
      )}
    </>
  );
}
