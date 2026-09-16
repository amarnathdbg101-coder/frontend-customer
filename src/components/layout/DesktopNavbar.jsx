/**
 * Universal Desktop Top Navigation Bar (Customer Portal)
 * 
 * Features:
 * - Brand Logo & Slogan
 * - Navigation tabs (Explore Shops, Deals, Pickups, Saved, Khata)
 * - Live Shopping Cart drawer button with badge count
 * - Menu bar "दुकान बनाएं" / "Create Shop" action button
 * - Bilingual Switcher (Hindi / English)
 * - Dark / Light Theme Toggle
 * - User Profile & Account Dropdown
 */

import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  Store,
  Tag,
  Heart,
  ShoppingBag,
  BookOpen,
  Sun,
  Moon,
  PlusCircle,
  ShoppingCart,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSaved } from '../../context/SavedContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { getImageUrl } from '../../utils/imageUrl';

export const DesktopNavbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { savedProducts, savedShops } = useSaved();
  const { isDark, toggleTheme } = useTheme();
  const { setLanguage, isHindi, t } = useLanguage();
  const { cartCount, openCart } = useCart();

  const savedCount = (savedProducts?.length || 0) + (savedShops?.length || 0);

  return (
    <header className="desktop-nav-header">
      <div className="desktop-nav-container">
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.25rem',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
            }}
          >
            S
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              ShopSilo
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              {isHindi ? 'हाइपरलोकल बाज़ार' : 'Hyperlocal Market'}
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
          >
            <Store size={18} />
            <span>{t('nav.explore')}</span>
          </NavLink>

          <NavLink
            to="/deals"
            className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
          >
            <Tag size={18} />
            <span>{t('nav.deals')}</span>
          </NavLink>

          <NavLink
            to="/reservations"
            className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
          >
            <ShoppingBag size={18} />
            <span>{t('nav.reservations')}</span>
          </NavLink>

          <NavLink
            to="/saved"
            className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
          >
            <Heart size={18} />
            <span>{t('nav.saved')}</span>
            {savedCount > 0 && <span className="nav-badge" style={{ position: 'static', marginLeft: '4px' }}>{savedCount}</span>}
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to="/khata"
              className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
            >
              <BookOpen size={18} />
              <span>{t('nav.khata')}</span>
            </NavLink>
          )}

          {/* Shop Creation Action Button */}
          <a
            href="https://shop.shopsilo.in/register"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              fontWeight: 800,
              fontSize: '0.8rem',
              marginLeft: '8px',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
            }}
            title={t('nav.create_shop')}
          >
            <PlusCircle size={15} />
            <span>{t('nav.create_shop')}</span>
          </a>
        </nav>

        {/* Utilities: Cart, Language Selector, Theme Switch & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '16px' }}>
          {/* Cart Trigger Button */}
          <button
            type="button"
            onClick={openCart}
            style={{
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              position: 'relative',
            }}
            title={t('nav.cart')}
            aria-label={t('nav.cart')}
          >
            <ShoppingCart size={17} />
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                }}
              >
                {cartCount}
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
            role="radiogroup"
            aria-label="Language selection"
          >
            <button
              onClick={() => setLanguage('hi')}
              style={{
                border: 'none',
                background: isHindi ? 'var(--color-primary)' : 'transparent',
                color: isHindi ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.76rem',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="हिंदी"
            >
              हिंदी
            </button>
            <button
              onClick={() => setLanguage('en')}
              style={{
                border: 'none',
                background: !isHindi ? 'var(--color-primary)' : 'transparent',
                color: !isHindi ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.76rem',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
            title={isDark ? t('profile.light_mode') : t('profile.dark_mode')}
          >
            {isDark ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} />}
          </button>

          {isAuthenticated && user ? (
            <button
              onClick={() => navigate('/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                padding: '4px 10px 4px 4px',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  overflow: 'hidden',
                }}
              >
                {user.avatar_url ? (
                  <img
                    src={getImageUrl(user.avatar_url)}
                    alt={user.name || user.full_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  (user.name || user.full_name)?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {user.name || user.full_name || t('nav.profile')}
              </span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary btn-sm"
              style={{ padding: '7px 16px', fontWeight: 700 }}
            >
              {t('nav.login')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
