/**
 * Universal Responsive Mobile Drawer Navigation Menu
 * Pixel-perfect match with Shopsilo Mobile OS Side Menu Drawer
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Store,
  BookOpen,
  ShoppingBag,
  User,
  LogOut,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { getImageUrl } from '../../utils/imageUrl';

export const SideDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isMerchant, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isHindi } = useLanguage();
  const [systemMode, setSystemMode] = useState(false);

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const handleOpenMerchantDashboard = () => {
    onClose();
    window.open('https://shop.shopsilo.in', '_blank');
  };

  const handleCreateShop = () => {
    onClose();
    window.open('https://shop.shopsilo.in/register', '_blank');
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  const handleThemeChange = (mode) => {
    if (mode === 'system') {
      setSystemMode(true);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    } else {
      setSystemMode(false);
      setTheme(mode);
    }
  };

  const currentThemeMode = systemMode ? 'system' : theme === 'dark' ? 'dark' : 'light';
  const isAdmin = user?.role === 'admin';

  return (
    <>
      {/* Backdrop */}
      <div className="drawer-backdrop active" onClick={onClose} />

      {/* Drawer Container */}
      <aside
        className="side-drawer open"
        aria-label="Customer Navigation Drawer"
        role="dialog"
        aria-modal="true"
        style={{
          width: '82vw',
          maxWidth: '320px',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface, #ffffff)',
          borderRight: '1px solid var(--border-subtle, #e2e8f0)',
        }}
      >
        {/* Header Profile Section */}
        <div
          style={{
            padding: '16px 16px 14px 16px',
            borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface, #ffffff)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary, #4f46e5)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                border: '1.5px solid #ea580c',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {user?.avatar_url ? (
                <img
                  src={getImageUrl(user.avatar_url)}
                  alt={user?.name || user?.full_name || 'User'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                (user?.name || user?.full_name || 'U').charAt(0).toUpperCase()
              )}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: 'var(--text-primary, #0f172a)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user ? user.name || user.full_name || 'Customer' : 'Welcome Guest'}
              </div>
              <div
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--text-secondary, #64748b)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '1px',
                }}
              >
                {user ? user.phone || user.email || 'Logged in' : 'Local Shopping'}
              </div>

              {/* Role Badge */}
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: isAdmin ? '#fef3c7' : isMerchant ? '#e0e7ff' : '#dcfce7',
                  color: isAdmin ? '#92400e' : isMerchant ? '#3730a3' : '#166534',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  marginTop: '4px',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                }}
              >
                {isAdmin ? 'SUPER-ADMIN' : isMerchant ? 'SHOP OWNER' : 'CUSTOMER'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary, #64748b)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={isHindi ? 'Menu band karein' : 'Close Menu'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Navigation Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div
            style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              letterSpacing: '0.6px',
              color: 'var(--text-secondary, #64748b)',
              padding: '0 6px',
              marginBottom: '2px',
              textTransform: 'uppercase',
            }}
          >
            {isHindi ? 'MARKETPLACE & ORDERS' : 'MARKETPLACE & ORDERS'}
          </div>

          {/* Navigation Items */}
          {[
            {
              label: isHindi ? 'Aas-Paas Ki Dukanein' : 'Browse Nearby Shops',
              path: '/',
              icon: Store,
              color: '#4f46e5',
              bg: 'rgba(79, 70, 229, 0.1)',
            },
            {
              label: isHindi ? 'Mera In-Store Reservations' : 'My In-Store Reservations',
              path: '/reservations',
              icon: ShoppingBag,
              color: '#10b981',
              bg: 'rgba(16, 185, 129, 0.1)',
            },
            {
              label: isHindi ? 'Mera Khata (Passbook)' : 'Mera Khata (Passbook)',
              path: isAuthenticated ? '/khata' : '/login',
              icon: BookOpen,
              color: '#dc2626',
              bg: 'rgba(220, 38, 38, 0.1)',
            },
            {
              label: isHindi ? 'Meri Profile & Settings' : 'My Profile & Settings',
              path: isAuthenticated ? '/profile' : '/login',
              icon: User,
              color: '#64748b',
              bg: 'rgba(100, 116, 139, 0.1)',
            },
          ].map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                onClick={() => handleNavigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '9px 10px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
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
                    fontSize: '0.82rem',
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
                <ChevronRight size={16} color="var(--text-secondary, #94a3b8)" style={{ flexShrink: 0 }} />
              </div>
            );
          })}

          {/* Appearance Selector */}
          <div style={{ marginTop: '14px', marginBottom: '8px' }}>
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.6px',
                color: 'var(--text-secondary, #64748b)',
                padding: '0 6px',
                marginBottom: '6px',
                textTransform: 'uppercase',
              }}
            >
              APPEARANCE
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
                      gap: '5px',
                      padding: '7px 0',
                      borderRadius: '9px',
                      border: 'none',
                      backgroundColor: isSelected ? 'var(--color-primary, #4f46e5)' : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary, #64748b)',
                      fontSize: '0.72rem',
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
        </div>

        {/* Drawer Footer Actions */}
        <div
          style={{
            padding: '14px 16px 20px 16px',
            borderTop: '1px solid var(--border-subtle, #e2e8f0)',
            backgroundColor: 'var(--bg-surface, #ffffff)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* Role Action Box */}
          {isMerchant ? (
            <div
              onClick={handleOpenMerchantDashboard}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '12px',
                backgroundColor: '#e0e7ff',
                border: '1px solid #c7d2fe',
                cursor: 'pointer',
              }}
            >
              <Store size={20} color="#4338ca" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#312e81' }}>
                  Merchant OS Hub
                </div>
                <div style={{ fontSize: '0.7rem', color: '#4338ca', marginTop: '1px' }}>
                  Counter POS, Khata & Sales
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={handleCreateShop}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '12px',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                cursor: 'pointer',
              }}
            >
              <Sparkles size={20} color="#059669" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#065f46' }}>
                  Become a Shop Owner
                </div>
                <div style={{ fontSize: '0.7rem', color: '#047857', marginTop: '1px' }}>
                  Open local digital storefront
                </div>
              </div>
            </div>
          )}

          {/* Sign Out / Sign In */}
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
                color: '#dc2626',
                cursor: 'pointer',
                fontSize: '0.88rem',
                fontWeight: 700,
                textAlign: 'left',
              }}
            >
              <LogOut size={18} color="#dc2626" />
              <span>{isHindi ? 'लॉग आउट करें' : 'Sign Out'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleNavigate('/login')}
              className="btn btn-primary btn-block"
              style={{ padding: '9px 12px', fontSize: '0.86rem', fontWeight: 700 }}
            >
              <span>{isHindi ? 'लॉग इन / खाता बनाएं' : 'Login / Register'}</span>
            </button>
          )}
          <div style={{ textAlign: 'center', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            ShopSilo Customer Portal • v1.0
          </div>
        </div>
      </aside>
    </>
  );
};
