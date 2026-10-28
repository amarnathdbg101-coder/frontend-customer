import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';
import { DesktopNavbar } from './DesktopNavbar';
import { AppFooter } from './AppFooter';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

export const AppLayout = ({
  children,
  title,
  subtitle,
  showBack = false,
  hideNav = false,
  showFooter = true,
  rightAction = null,
  customHeader = null,
  hideDesktopNav = false,
}) => {
  const navigate = useNavigate();
  const { cartCount, cartTotal, openCart } = useCart();
  const { isHindi } = useLanguage();

  return (
    <div className="app-container">
      {!hideNav && !hideDesktopNav && <DesktopNavbar />}
      {customHeader ? (
        customHeader
      ) : (
        <AppHeader title={title} subtitle={subtitle} showBack={showBack} rightAction={rightAction} />
      )}
      <main className={`app-content ${hideNav ? 'no-bottom-nav' : ''}`}>
        {children}
        {showFooter && <AppFooter />}
      </main>

      {/* Floating App-Like Cart & Pickup Bar (Blinkit/Zepto PWA Style) */}
      {!hideNav && cartCount > 0 && (
        <div
          onClick={openCart}
          style={{
            position: 'fixed',
            bottom: 'calc(var(--bottom-nav-height, 62px) + 12px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 24px)',
            maxWidth: '480px',
            backgroundColor: '#10b981',
            color: '#ffffff',
            borderRadius: '14px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
            zIndex: 90,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="floating-cart-bar-container"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <ShoppingCart size={20} />
              <span style={{ position: 'absolute', top: '-6px', right: '-8px', backgroundColor: '#ffffff', color: '#059669', fontSize: '0.65rem', fontWeight: 900, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cartCount}
              </span>
            </div>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 900 }}>
                ₹{cartTotal.toFixed(0)} • {cartCount} {isHindi ? 'सामान' : 'items'}
              </div>
              <div style={{ fontSize: '0.68rem', opacity: 0.9, fontWeight: 700 }}>
                {isHindi ? '0-अग्रिम भुगतान काउंटर रिज़र्वेशन' : '0-Risk In-Store Pickup'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 900 }}>
            <span>{isHindi ? 'रिज़र्व करें' : 'View Pickup'}</span>
            <ArrowRight size={16} />
          </div>
        </div>
      )}

      {!hideNav && <BottomNav />}
    </div>
  );
};
