/**
 * Customer Top App Header Component
 * Clean, modern, responsive app bar showing ShopSilo brand and User Greeting.
 * All utilities (Cart, Language, Theme, Navigation, Profile) are cleanly shifted into the Menu Bar (SideDrawer).
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { SideDrawer } from './SideDrawer';
import { ShopSiloLogo } from '../common/ShopSiloLogo';
import { sessionState } from '../../utils/sessionState';

export const AppHeader = ({ title, subtitle, showBack = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isHindi } = useLanguage();
  const { cartCount } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      const prev = sessionState.getPreviousRoute();
      navigate(prev || '/', { replace: true });
    }
  };

  const greetingName = user?.name || user?.full_name || '';

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          {showBack && (
            <button
              onClick={handleBack}
              className="header-icon-btn"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
              }}
              title={isHindi ? 'पीछे जाएं' : 'Go Back'}
              aria-label={isHindi ? 'पीछे जाएं' : 'Go Back'}
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <ShopSiloLogo size={32} showText={false} variant="gradient" to="/" />

          <div className="header-title-container">
            <div className="header-title">
              {title || (isHindi ? 'शॉपसिलो' : 'ShopSilo')}
            </div>
            <div className="header-subtitle">
              {subtitle ? (
                subtitle
              ) : greetingName ? (
                isHindi ? `नमस्ते, ${greetingName}` : `Hello, ${greetingName}`
              ) : (
                isHindi ? 'नमस्ते, अतिथि ग्राहक' : 'Hello, Guest'
              )}
            </div>
          </div>
        </div>

        <div className="header-actions">
          {/* Menu Button to Open Side Drawer (Menu Bar) */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="header-icon-btn"
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-full, 50%)',
              background: 'var(--bg-surface-subtle, #f8fafc)',
              border: '1px solid var(--border-subtle, #e2e8f0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
            title={isHindi ? 'मेनू बार खोलें' : 'Open Menu Bar'}
            aria-label={isHindi ? 'मेनू बार खोलें' : 'Open Menu Bar'}
          >
            <Menu size={20} />
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.62rem',
                  fontWeight: 900,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)',
                }}
              >
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Side Navigation Drawer (Menu Bar) */}
      <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
};

export default AppHeader;
