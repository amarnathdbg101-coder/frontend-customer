/**
 * Customer Side Navigation Drawer (Menu Bar)
 * Complete, modern, responsive navigation drawer with:
 * - User Profile / Guest Card
 * - Full Navigation Suite: Home, Cart (with live badge), Deals, Reservations, Saved Items, Khata, Profile
 * - Language Selector (हिंदी / English)
 * - Appearance Selector (Light, Dark, System)
 * - Merchant OS Portal Link
 * - Sign Out / Sign In Action
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Heart,
  BookOpen,
  User,
  Store,
  LogOut,
  X,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Languages,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useSaved } from '../../context/SavedContext';
import { getImageUrl } from '../../utils/imageUrl';
import { Badge } from '../ui';
import { ShopSiloLogo } from '../common/ShopSiloLogo';

export const SideDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme, setThemeMode } = useTheme();
  const { isHindi, setLanguage, t } = useLanguage();
  const { cartCount, openCart } = useCart();

  let savedCount = 0;
  try {
    const saved = useSaved();
    if (saved) {
      savedCount = (saved.savedProducts?.length || 0) + (saved.savedShops?.length || 0);
    }
  } catch (e) {
    savedCount = 0;
  }

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const handleOpenCart = () => {
    onClose();
    openCart();
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
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
      label: isHindi ? 'दुकानें खोजें (होम)' : 'Storefront Home',
      onClick: () => handleNavigate('/'),
      icon: Home,
      color: '#4f46e5',
      bg: '#eef2ff',
    },
    {
      label: isHindi ? 'मेरी शॉपिंग कार्ट' : 'My Shopping Cart',
      onClick: handleOpenCart,
      icon: ShoppingCart,
      color: '#2563eb',
      bg: '#eff6ff',
      badge: cartCount > 0 ? (cartCount > 9 ? '9+' : cartCount) : null,
      badgeColor: '#ef4444',
    },
    {
      label: isHindi ? 'ऑफ़र्स और डिस्काउंट' : 'Deals & Discounts',
      onClick: () => handleNavigate('/deals'),
      icon: Tag,
      color: '#f59e0b',
      bg: '#fef3c7',
    },
    {
      label: isHindi ? 'मेरी काउंटर बुकिंग्स' : 'My Counter Reservations',
      onClick: () => handleNavigate('/reservations'),
      icon: ShoppingBag,
      color: '#059669',
      bg: '#ecfdf5',
    },
    {
      label: isHindi ? 'पसंदीदा दुकानें एवं वस्तुएं' : 'Saved Items & Shops',
      onClick: () => handleNavigate('/saved'),
      icon: Heart,
      color: '#ec4899',
      bg: '#fdf2f8',
      badge: savedCount > 0 ? savedCount : null,
      badgeColor: '#ec4899',
    },
    {
      label: isHindi ? 'मेरा डिजिटल खाता (पासबुक)' : 'My Khata Ledger',
      onClick: () => handleNavigate('/khata'),
      icon: BookOpen,
      color: '#dc2626',
      bg: '#fef2f2',
    },
    {
      label: isHindi ? 'मेरी प्रोफ़ाइल एवं सेटिंग्स' : 'My Profile & Settings',
      onClick: () => handleNavigate('/profile'),
      icon: User,
      color: '#6366f1',
      bg: '#eef2ff',
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
          width: '84vw',
          maxWidth: '350px',
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
        {/* Brand Top Header */}
        <div
          style={{
            padding: '16px 18px 12px 18px',
            borderBottom: '1px solid var(--border-subtle, #f1f5f9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
          }}
        >
          <ShopSiloLogo size={28} subtitle={isHindi ? 'हायपरलोकल बाज़ार' : 'Hyperlocal Market'} />
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary, #64748b)',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* =========================================================================
            1. TOP PROFILE HEADER (Avatar, Name, Email, CUSTOMER badge / Guest)
           ========================================================================= */}
        <div
          style={{
            padding: '18px',
            borderBottom: '1px solid var(--border-subtle, #f1f5f9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            backgroundColor: 'var(--bg-surface, #ffffff)',
          }}
        >
          {isAuthenticated && user ? (
            <div
              onClick={() => handleNavigate('/profile')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, cursor: 'pointer', flex: 1 }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: user?.avatar_url
                    ? 'transparent'
                    : 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.15rem',
                  flexShrink: 0,
                  border: '2px solid rgba(79, 70, 229, 0.3)',
                  boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)',
                  overflow: 'hidden',
                }}
              >
                {user?.avatar_url ? (
                  <img
                    loading="lazy"
                    decoding="async"
                    src={getImageUrl(user.avatar_url)}
                    alt={user.name || user.full_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  (user?.name || user?.full_name)?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>

              {/* Name, Email & CUSTOMER Pill */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: '0.94rem',
                    fontWeight: 800,
                    color: 'var(--text-primary, #0f172a)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.name || user?.full_name || (isHindi ? 'नमस्ते, उपयोगकर्ता' : 'Welcome User')}
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-secondary, #64748b)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginTop: '1px',
                    marginBottom: '4px',
                  }}
                >
                  {user?.email || user?.phone || 'customer@shopsilo.in'}
                </div>
                <div>
                  <Badge variant="success" size="sm">
                    {isHindi ? 'सत्यापित ग्राहक' : 'CUSTOMER'}
                  </Badge>
                </div>
              </div>

              <ChevronRight size={18} color="var(--text-secondary, #94a3b8)" style={{ flexShrink: 0 }} />
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-surface-subtle, #f1f5f9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary, #64748b)',
                    flexShrink: 0,
                  }}
                >
                  <User size={22} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {isHindi ? 'नमस्ते, अतिथि' : 'Hello, Guest'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {isHindi ? 'ऑर्डर और खाते के लिए लॉगिन करें' : 'Sign in to access your orders'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleNavigate('/login')}
                style={{
                  backgroundColor: 'var(--color-primary, #4f46e5)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-full, 9999px)',
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
                }}
              >
                {isHindi ? 'लॉग इन' : 'Sign In'}
              </button>
            </div>
          )}
        </div>

        {/* =========================================================================
            2. NAVIGATION ITEMS LIST (Shifted from top app bar)
           ========================================================================= */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>
          {navItems.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                onClick={item.onClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '11px 12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  transition: 'background 0.15s ease',
                  marginBottom: '4px',
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
                  <IconComp size={18} color={item.color} />
                </div>

                <span
                  style={{
                    fontSize: '0.88rem',
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

                {item.badge && (
                  <span
                    style={{
                      backgroundColor: item.badgeColor || 'var(--color-primary)',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-full, 9999px)',
                      flexShrink: 0,
                    }}
                  >
                    {item.badge}
                  </span>
                )}

                <ChevronRight size={16} color="var(--text-secondary, #94a3b8)" style={{ flexShrink: 0 }} />
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            3. FOOTER SECTION: LANGUAGE, APPEARANCE, SHOPKEEPER LINK, LOGOUT
           ========================================================================= */}
        <div
          style={{
            padding: '14px 16px 20px 16px',
            borderTop: '1px solid var(--border-subtle, #f1f5f9)',
            backgroundColor: 'var(--bg-surface, #ffffff)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* LANGUAGE SELECTOR */}
          <div>
            <div
              style={{
                fontSize: '0.66rem',
                fontWeight: 800,
                letterSpacing: '0.8px',
                color: 'var(--text-secondary, #64748b)',
                padding: '0 4px',
                marginBottom: '6px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Languages size={13} />
              <span>{isHindi ? 'भाषा (LANGUAGE)' : 'LANGUAGE'}</span>
            </div>

            <div
              style={{
                display: 'flex',
                borderRadius: '12px',
                padding: '3px',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                gap: '4px',
              }}
            >
              {[
                { label: 'हिंदी', value: 'hi' },
                { label: 'English', value: 'en' },
              ].map((opt) => {
                const isSelected = (isHindi && opt.value === 'hi') || (!isHindi && opt.value === 'en');
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLanguage(opt.value)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '7px 0',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: isSelected ? 'var(--color-primary, #4f46e5)' : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary, #64748b)',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 6px rgba(79, 70, 229, 0.3)' : 'none',
                    }}
                  >
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* APPEARANCE (THEME) SEGMENTED SELECTOR */}
          <div>
            <div
              style={{
                fontSize: '0.66rem',
                fontWeight: 800,
                letterSpacing: '0.8px',
                color: 'var(--text-secondary, #64748b)',
                padding: '0 4px',
                marginBottom: '6px',
                textTransform: 'uppercase',
              }}
            >
              {isHindi ? 'थीम (APPEARANCE)' : 'APPEARANCE'}
            </div>

            <div
              style={{
                display: 'flex',
                borderRadius: '12px',
                padding: '3px',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                gap: '2px',
              }}
            >
              {[
                { label: isHindi ? 'लाइट' : 'Light', value: 'light', icon: Sun },
                { label: isHindi ? 'डार्क' : 'Dark', value: 'dark', icon: Moon },
                { label: isHindi ? 'सिस्टम' : 'System', value: 'system', icon: Monitor },
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
                      gap: '5px',
                      padding: '7px 0',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: isSelected ? 'var(--color-primary, #4f46e5)' : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary, #64748b)',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 6px rgba(79, 70, 229, 0.3)' : 'none',
                    }}
                  >
                    <IconComp size={13} color={isSelected ? '#ffffff' : 'var(--text-secondary, #64748b)'} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MERCHANT APP LINK FOR SHOPKEEPERS */}
          <a
            href="https://shop.shopsilo.in"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
              border: '1px solid var(--border-subtle, #e2e8f0)',
              textDecoration: 'none',
              transition: 'transform 0.15s ease',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-primary-light, #eef2ff)',
                color: 'var(--color-primary, #4f46e5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Store size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.80rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
                {isHindi ? 'क्या आप दुकानदार हैं?' : 'Are you a Shop Keeper?'}
              </div>
              <div style={{ fontSize: '0.70rem', color: 'var(--text-secondary, #64748b)', marginTop: '1px' }}>
                {isHindi ? 'मर्चेंट ऐप खोलें' : 'Open Merchant OS App ↗'}
              </div>
            </div>
          </a>

          {/* SIGN OUT / SIGN IN */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 4px',
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '0.86rem',
                fontWeight: 800,
                textAlign: 'left',
              }}
            >
              <LogOut size={16} color="#ef4444" />
              <span>{t('nav.logout')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleNavigate('/login')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 4px',
                background: 'transparent',
                border: 'none',
                color: '#4f46e5',
                cursor: 'pointer',
                fontSize: '0.86rem',
                fontWeight: 800,
                textAlign: 'left',
              }}
            >
              <User size={16} color="#4f46e5" />
              <span>{isHindi ? 'लॉग इन करें' : 'Sign In'}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default SideDrawer;
