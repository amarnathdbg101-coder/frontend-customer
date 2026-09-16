/**
 * Desktop Navbar Component (Screens >= 1024px)
 * High-performance top navigation with GPS, Search, Language Switcher, and Theme Toggle
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Store,
  ExternalLink,
  MapPin,
  Tag,
  ShoppingBag,
  Heart,
  BookOpen,
  User,
  Sun,
  Moon,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useTheme } from '../../context/ThemeContext';
import { useSaved } from '../../context/SavedContext';
import { useLanguage } from '../../context/LanguageContext';
import { getImageUrl } from '../../utils/imageUrl';

export const DesktopNavbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { locationName, detectLocation, isDetecting } = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, isHindi } = useLanguage();
  const { savedProducts, savedShops } = useSaved();

  const savedCount = (savedProducts?.length || 0) + (savedShops?.length || 0);

  return (
    <header className="desktop-navbar" role="banner">
      <div className="desktop-navbar-inner">
        {/* Brand Logo */}
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
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
            <Store size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              ShopSilo
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.5px' }}>
              {isHindi ? 'हाइपरलोकल बाज़ार' : 'HYPERLOCAL RETAIL'}
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
          title={isHindi ? 'लाइव जीपीएस लोकेशन अपडेट करें' : 'Update Live GPS Location'}
        >
          <MapPin size={16} color="var(--color-primary)" />
          <span style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {isDetecting ? (isHindi ? 'लोकेशन खोज रहे हैं...' : 'Detecting GPS...') : locationName || 'Darbhanga, Bihar'}
          </span>
          <Navigation size={12} color="var(--text-muted)" />
        </button>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
          >
            <Store size={18} />
            <span>{isHindi ? 'दुकानें' : 'Explore Shops'}</span>
          </NavLink>

          <NavLink
            to="/deals"
            className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
          >
            <Tag size={18} />
            <span>{isHindi ? 'ऑफ़र्स एवं डील्स' : 'Deals & Offers'}</span>
          </NavLink>

          <NavLink
            to="/reservations"
            className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
          >
            <ShoppingBag size={18} />
            <span>{isHindi ? 'मेरी बुकिंग्स' : 'My Pickups'}</span>
          </NavLink>

          <NavLink
            to="/saved"
            className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
          >
            <Heart size={18} />
            <span>{isHindi ? 'पसंदीदा' : 'Saved'}</span>
            {savedCount > 0 && <span className="nav-badge" style={{ position: 'static', marginLeft: '4px' }}>{savedCount}</span>}
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to="/khata"
              className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
            >
              <BookOpen size={18} />
              <span>{isHindi ? 'मेरा खाता' : 'My Khata'}</span>
            </NavLink>
          )}
        </nav>

                  {/* Merchant Portal Direct Link */}
          <a
            href="https://shop.shopsilo.in"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.78rem',
              padding: '6px 13px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid #4338ca',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(67, 56, 202, 0.25)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            title={isHindi ? 'दुकानदार पोर्टल (बिलिंग POS व खाता OS)' : 'Shop Owner Portal (POS Billing & Khata OS)'}
          >
            <Store size={14} color="#a5b4fc" />
            <span>{isHindi ? 'दुकानदार पोर्टल' : 'Merchant Portal'}</span>
            <ExternalLink size={12} color="#a5b4fc" />
          </a>

        {/* Utilities: Language Selector, Theme Switch & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '16px' }}>
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
              title="हिंदी भाषा चुनें"
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
              title="Select English language"
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
            title={isDark ? (isHindi ? 'लाइट मोड चालू करें' : 'Switch to Light Mode') : (isHindi ? 'डार्क मोड चालू करें' : 'Switch to Dark Mode')}
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
                {user.name || user.full_name || (isHindi ? 'मेरा अकाउंट' : 'My Account')}
              </span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary btn-sm"
              style={{ padding: '7px 16px', fontWeight: 700 }}
            >
              {isHindi ? 'लॉगिन' : 'Login'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
