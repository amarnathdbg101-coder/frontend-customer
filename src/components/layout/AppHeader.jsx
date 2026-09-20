/**
 * Top App Header Component (Modern Glassy Style with Bilingual Selector and Cart Trigger)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu, Sun, Moon, ShoppingCart, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { SideDrawer } from './SideDrawer';
import { getImageUrl } from '../../utils/imageUrl';

export const AppHeader = ({ title, subtitle, showBack = false }) => {
  const navigate = useNavigate();
  const { user, shop } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { setLanguage, isHindi, t } = useLanguage();
  const { cartCount, openCart } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="header-icon-btn"
              title={t('nav.back')}
              aria-label={t('nav.back')}
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <button
              onClick={() => setDrawerOpen(true)}
              className="header-icon-btn"
              title={t('nav.menu')}
              aria-label={t('nav.menu')}
            >
              <Menu size={22} />
            </button>
          )}

          <div className="header-title-container">
            <div className="header-title">
              {title || (shop ? shop.name : (isHindi ? 'शॉपसिलो' : 'ShopSilo'))}
            </div>
            {subtitle ? (
              <div className="header-subtitle">{subtitle}</div>
            ) : shop ? (
              <div className="header-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: shop.is_active ? 'var(--color-success)' : 'var(--color-danger)',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontWeight: 600, color: shop.is_active ? '#065f46' : '#991b1b' }}>
                  {shop.is_active ? t('common.open_now') : t('common.closed')}
                </span>
              </div>
            ) : user ? (
              <div className="header-subtitle">
                {isHindi ? `नमस्ते, ${user.full_name || user.name}` : `Hello, ${user.full_name || user.name}`}
              </div>
            ) : null}
          </div>
        </div>

        <div className="header-actions">
          {/* Cart Trigger */}
          <button
            type="button"
            onClick={openCart}
            className="header-action-btn"
            title={t('nav.cart')}
            aria-label={t('nav.cart')}
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  fontSize: '0.62rem',
                  fontWeight: 900,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          {/* Language Switcher Pill (1-tap toggle) */}
          <button
            onClick={() => setLanguage(isHindi ? 'en' : 'hi')}
            className="header-lang-btn"
            title={isHindi ? 'Switch to English' : 'हिंदी भाषा चुनें'}
            aria-label={isHindi ? 'Switch to English' : 'हिंदी भाषा चुनें'}
          >
            {isHindi ? 'EN' : 'हिंदी'}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="header-action-btn header-theme-toggle"
            title={isDark ? t('profile.light_mode') : t('profile.dark_mode')}
            aria-label={isDark ? t('profile.light_mode') : t('profile.dark_mode')}
          >
            {isDark ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} />}
          </button>

          {/* User Profile / Compact Login Button */}
          {user ? (
            <button
              onClick={() => navigate('/profile')}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: user.avatar_url ? 'transparent' : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.8rem',
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
                overflow: 'hidden',
                padding: 0,
                flexShrink: 0,
              }}
              title={t('nav.profile')}
              aria-label={t('nav.profile')}
            >
              {user.avatar_url ? (
                <img
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
              className="header-login-btn"
              title={t('nav.login')}
              aria-label={t('nav.login')}
            >
              <User size={14} />
              <span>{isHindi ? 'लॉगिन' : 'Login'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Side Navigation Drawer */}
      <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
};
