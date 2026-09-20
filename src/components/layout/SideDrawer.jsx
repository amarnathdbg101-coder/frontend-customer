/**
 * Customer Side Navigation Drawer (Menu Bar)
 * Pixel-Perfect Match with Shopsilo Mobile OS (Screenshot_2026_0920_142009.jpg):
 * - User Profile Header (Photo, Name, Email, CUSTOMER green pill badge, Close 'X')
 * - Clean 3-Item Navigation:
 *   1. [ 🏠 ] Storefront Home >
 *   2. [ 🛍️ ] My In-Store Reservations >
 *   3. [ 📖 ] Mera Khata (Passbook) >
 * - APPEARANCE Segmented Selector (Light, Dark, System)
 * - Become a Shop Owner Card ("Open local digital storefront")
 * - Sign Out (Red action)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  ShoppingBag,
  BookOpen,
  Sparkles,
  Store,
  LogOut,
  X,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { getImageUrl } from '../../utils/imageUrl';

export const SideDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, shop } = useAuth();
  const { theme, toggleTheme, setThemeMode } = useTheme();
  const { isHindi } = useLanguage();

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  const handleBecomeMerchant = () => {
    onClose();
    if (shop) {
      window.location.href = 'https://shop.shopsilo.in/merchant';
    } else {
      window.location.href = 'https://shop.shopsilo.in/register';
    }
  };

  const currentThemeMode = theme || 'system';

  const handleThemeChange = (mode) => {
    if (setThemeMode) {
      setThemeMode(mode);
    } else {
      toggleTheme();
    }
  };

  const navItems = [
    {
      label: isHindi ? 'स्टोरफ्रंट होम' : 'Storefront Home',
      path: '/',
      icon: Home,
      color: '#4f46e5',
      bg: '#eef2ff',
    },
    {
      label: isHindi ? 'मेरी इन-स्टोर बुकिंग्स' : 'My In-Store Reservations',
      path: '/reservations',
      icon: ShoppingBag,
      color: '#059669',
      bg: '#ecfdf5',
    },
    {
      label: isHindi ? 'मेरा खाता (Passbook)' : 'Mera Khata (Passbook)',
      path: '/khata',
      icon: BookOpen,
      color: '#dc2626',
      bg: '#fef2f2',
    },
  ];

  return (
    <>
      {/* Dark Backdrop Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          zIndex: 9998,
          transition: 'opacity 0.2s ease',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Menu Drawer */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '82vw',
          maxWidth: '340px',
          backgroundColor: 'var(--bg-surface, #ffffff)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          animation: 'slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          borderRight: '1px solid var(--border-subtle, #e2e8f0)',
        }}
        role="dialog"
        aria-label="Customer Navigation Menu"
      >
        {/* =========================================================================
            1. TOP PROFILE HEADER (Avatar, Name, Email, CUSTOMER badge, Close 'X')
           ========================================================================= */}
        <div
          style={{
            padding: '24px 18px 18px 18px',
            borderBottom: '1px solid var(--border-subtle, #f1f5f9)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            {/* Avatar */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: user?.avatar_url
                  ? 'transparent'
                  : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                flexShrink: 0,
                border: '2px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 4px 10px rgba(59, 130, 246, 0.25)',
                overflow: 'hidden',
              }}
            >
              {user?.avatar_url ? (
                <img loading="lazy" decoding="async" 
                  src={getImageUrl(user.avatar_url)}
                  alt={user.name || user.full_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                (user?.name || user?.full_name)?.charAt(0)?.toUpperCase() || 'A'
              )}
            </div>

            {/* Name, Email & CUSTOMER Pill */}
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.96rem',
                  fontWeight: 900,
                  color: 'var(--text-primary, #0f172a)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.name || user?.full_name || (isHindi ? 'अमरनाथ गुप्ता' : 'Amarnath Gupta')}
              </div>
              <div
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--text-secondary, #64748b)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '1px',
                  marginBottom: '6px',
                }}
              >
                {user?.email || 'customer@shopsilo.in'}
              </div>
              <div>
                <span
                  style={{
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                    display: 'inline-block',
                  }}
                >
                  CUSTOMER
                </span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary, #64748b)',
              padding: '4px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* =========================================================================
            2. NAVIGATION ITEMS LIST
           ========================================================================= */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
          {navItems.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                onClick={() => handleNavigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  transition: 'background 0.15s ease',
                  marginBottom: '6px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle, #f8fafc)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: item.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconComp size={19} color={item.color} />
                </div>

                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: 'var(--text-primary, #0f172a)',
                    flex: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.label}
                </span>

                <ChevronRight size={17} color="var(--text-secondary, #94a3b8)" style={{ flexShrink: 0 }} />
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            3. FOOTER SECTION (APPEARANCE, BECOME A SHOP OWNER, SIGN OUT)
           ========================================================================= */}
        <div
          style={{
            padding: '14px 16px 24px 16px',
            borderTop: '1px solid var(--border-subtle, #f1f5f9)',
            backgroundColor: 'var(--bg-surface, #ffffff)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* APPEARANCE SEGMENTED SELECTOR */}
          <div>
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.8px',
                color: 'var(--text-secondary, #64748b)',
                padding: '0 4px',
                marginBottom: '8px',
                textTransform: 'uppercase',
              }}
            >
              APPEARANCE
            </div>

            <div
              style={{
                display: 'flex',
                borderRadius: '14px',
                padding: '3px',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                gap: '2px',
              }}
            >
              {[
                { label: 'Light', value: 'light', icon: Sun },
                { label: 'Dark', value: 'dark', icon: Moon },
                { label: 'System', value: 'system', icon: Monitor },
              ].map((opt) => {
                const isSelected = currentThemeMode === opt.value;
                const IconComp = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleThemeChange(opt.value)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 0',
                      borderRadius: '11px',
                      border: 'none',
                      backgroundColor: isSelected ? 'var(--color-primary, #4f46e5)' : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary, #64748b)',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 6px rgba(79, 70, 229, 0.3)' : 'none',
                    }}
                  >
                    <IconComp size={14} color={isSelected ? '#ffffff' : 'var(--text-secondary, #64748b)'} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BECOME A SHOP OWNER CARD */}
          <div
            onClick={handleBecomeMerchant}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '14px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#166534' }}>
                {shop ? (isHindi ? 'दुकानदार डैशबोर्ड' : 'Merchant OS Hub') : (isHindi ? 'दुकानदार बनें' : 'Become a Shop Owner')}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '1px' }}>
                {shop ? (isHindi ? 'काउंटर बिलिंग व सेल्स' : 'Counter POS, Khata & Sales') : (isHindi ? 'अपनी डिजिटल दुकान खोलें' : 'Open local digital storefront')}
              </div>
            </div>
          </div>

          {/* SIGN OUT / SIGN IN */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 4px',
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 800,
                textAlign: 'left',
              }}
            >
              <LogOut size={18} color="#ef4444" />
              <span>{isHindi ? 'लॉग आउट' : 'Sign Out'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleNavigate('/login')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 4px',
                background: 'transparent',
                border: 'none',
                color: '#4f46e5',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 800,
                textAlign: 'left',
              }}
            >
              <User size={18} color="#4f46e5" />
              <span>{isHindi ? 'लॉग इन करें' : 'Sign In'}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default SideDrawer;
