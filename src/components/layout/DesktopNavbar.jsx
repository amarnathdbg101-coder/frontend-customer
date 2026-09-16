import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Store,
  MapPin,
  Tag,
  ShoppingBag,
  Heart,
  BookOpen,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useSaved } from '../../context/SavedContext';
import { useLanguage } from '../../context/LanguageContext';
import { ThemeLanguageBar } from '../common/ThemeLanguageBar';
import { getImageUrl } from '../../utils/imageUrl';

export const DesktopNavbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { locationName, detectLocation, isDetecting } = useLocation();
  const { savedProducts, savedShops } = useSaved();
  const { t, isHindi } = useLanguage();

  const savedCount = (savedProducts?.length || 0) + (savedShops?.length || 0);

  return (
    <header className="desktop-navbar" role="banner">
      <div className="desktop-navbar-inner">
        {/* Brand Logo */}
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
          aria-label="ShopMe Home"
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, #312e81 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.25rem',
              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
            }}
          >
            <Store size={22} aria-hidden="true" />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              ShopMe
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.5px' }}>
              {isHindi ? 'हाइपरलोकल मार्केट' : 'HYPERLOCAL RETAIL'}
            </div>
          </div>
        </div>

        {/* GPS Location Pill */}
        <button
          type="button"
          onClick={detectLocation}
          disabled={isDetecting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 14px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            transition: 'all 0.15s ease',
          }}
          aria-label={isHindi ? 'वर्तमान जीपीएस स्थान का पता लगाएं' : 'Detect GPS location'}
        >
          <MapPin size={16} color="var(--color-primary)" aria-hidden="true" />
          <span style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {isDetecting ? (isHindi ? 'स्थान खोजा जा रहा है...' : 'Detecting GPS...') : locationName || (isHindi ? 'स्थानीय बाजार' : 'Nearby Market')}
          </span>
          <Navigation size={12} color="var(--text-muted)" aria-hidden="true" />
        </button>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }} aria-label="Desktop Navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
          >
            <Store size={18} aria-hidden="true" />
            <span>{t('nav.explore')}</span>
          </NavLink>

          <NavLink
            to="/deals"
            className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
          >
            <Tag size={18} aria-hidden="true" />
            <span>{t('nav.deals')}</span>
          </NavLink>

          <NavLink
            to="/reservations"
            className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
          >
            <ShoppingBag size={18} aria-hidden="true" />
            <span>{t('nav.reservations')}</span>
          </NavLink>

          <NavLink
            to="/saved"
            className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
          >
            <Heart size={18} aria-hidden="true" />
            <span>{t('nav.saved')}</span>
            {savedCount > 0 && <span className="nav-badge" style={{ position: 'static', marginLeft: '4px' }}>{savedCount}</span>}
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to="/khata"
              className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
            >
              <BookOpen size={18} aria-hidden="true" />
              <span>{t('nav.khata')}</span>
            </NavLink>
          )}
        </nav>

        {/* Compact Theme & Language Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '16px' }}>
          <ThemeLanguageBar compact={true} />

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
              aria-label={t('nav.profile')}
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
export default DesktopNavbar;
