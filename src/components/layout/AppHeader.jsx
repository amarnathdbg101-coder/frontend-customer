/**
 * Customer Top App Header Component
 * Clean, modern, responsive glassy header with side drawer & language/theme controls
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu, Sun, Moon, User, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { SideDrawer } from './SideDrawer';
import { getImageUrl } from '../../utils/imageUrl';
import { sessionState } from '../../utils/sessionState';

export const AppHeader = ({ title, subtitle, showBack = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { setLanguage, isHindi, t } = useLanguage();
  const { cartCount, openCart } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      const prev = sessionState.getPreviousRoute();
      navigate(prev || '/', { replace: true });
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          {showBack ? (
            <button
              onClick={handleBack}
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
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <button
              onClick={() => setDrawerOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
              }}
              title={isHindi ? 'साइड मेनू खोलें' : 'Open Menu'}
            >
              <Menu size={22} />
            </button>
          )}

          <div>
            <div className="header-title">
              {title || (isHindi ? 'शॉपसिलो' : 'ShopSilo')}
            </div>
            {subtitle ? (
              <div className="header-subtitle">{subtitle}</div>
            ) : user ? (
              <div className="header-subtitle">
                {isHindi ? `नमस्ते, ${user.full_name || user.name}` : `Hello, ${user.full_name || user.name}`}
              </div>
            ) : (
              <div className="header-subtitle">
                {isHindi ? 'स्थानीय बाज़ार • काउंटर पिकअप' : 'Local Marketplace • Counter Pickup'}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Shopping Cart Button with Live Badge */}
          <button
            type="button"
            onClick={openCart}
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
            }}
            title={isHindi ? 'शॉपिंग कार्ट खोलें' : 'Open Shopping Cart'}
          >
            <ShoppingBag size={20} color="var(--color-primary)" />
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
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
                  boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)',
                }}
              >
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          {/* Language Switcher Pill */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '2px',
            }}
          >
            <button
              onClick={() => setLanguage(isHindi ? 'en' : 'hi')}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--color-primary)',
                fontWeight: 800,
                fontSize: '0.74rem',
                padding: '3px 8px',
                cursor: 'pointer',
              }}
              title={isHindi ? 'Switch to English' : 'हिंदी भाषा चुनें'}
            >
              {isHindi ? 'EN' : 'हिंदी'}
            </button>
          </div>

          {/* Quick Dark/Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
            }}
            title={isDark ? t('profile.light_mode') : t('profile.dark_mode')}
          >
            {isDark ? <Sun size={19} color="#fbbf24" /> : <Moon size={19} />}
          </button>

          {/* User Profile / Login */}
          {user ? (
            <button
              onClick={() => navigate('/profile')}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: user.avatar_url ? 'transparent' : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
                overflow: 'hidden',
                padding: 0,
              }}
              title={isHindi ? 'प्रोफ़ाइल' : 'Profile'}
            >
              {user.avatar_url ? (
                <img loading="lazy" decoding="async" 
                  src={getImageUrl(user.avatar_url)}
                  alt={user?.name || user?.full_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                (user?.name || user?.full_name)?.charAt(0)?.toUpperCase() || 'U'
              )}
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.78rem', padding: '5px 12px', borderRadius: 'var(--radius-full)' }}
            >
              {isHindi ? 'लॉगिन' : 'Login'}
            </button>
          )}
        </div>
      </header>

      {/* Side Navigation Drawer */}
      <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
};

export default AppHeader;
