/**
 * Desktop Navbar Component (Screens >= 1024px)
 * 
 * Hinglish Hint:
 * Laptop & Desktop screens ke liye top navigation bar:
 * - Brand logo ("ShopMe QuickPick")
 * - GPS Location pill with live detection
 * - Quick nav links: Explore Shops, Deals & Offers, My Pickups, Saved, Mera Khata
 * - Theme Switcher (Light / Dark)
 * - User Profile Avatar or Login button
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Store,
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
import { getImageUrl } from '../../utils/imageUrl';

export const DesktopNavbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { locationName, detectLocation, isDetecting } = useLocation();
  const { isDark, toggleTheme } = useTheme();
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
              ShopMe
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.5px' }}>
              HYPERLOCAL RETAIL
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
          title="GPS se aas-paas ki location update karein"
        >
          <MapPin size={16} color="var(--color-primary)" />
          <span style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {isDetecting ? 'Detecting GPS...' : locationName || 'Darbhanga, Bihar'}
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
            <span>Explore Shops</span>
          </NavLink>

          <NavLink
            to="/deals"
            className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
          >
            <Tag size={18} />
            <span>Deals & Offers</span>
          </NavLink>

          <NavLink
            to="/reservations"
            className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
          >
            <ShoppingBag size={18} />
            <span>My Pickups</span>
          </NavLink>

          <NavLink
            to="/saved"
            className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
          >
            <Heart size={18} />
            <span>Saved</span>
            {savedCount > 0 && <span className="nav-badge" style={{ position: 'static', marginLeft: '4px' }}>{savedCount}</span>}
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to="/khata"
              className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
            >
              <BookOpen size={18} />
              <span>Mera Khata</span>
            </NavLink>
          )}
        </nav>

        {/* Utilities: Theme switch & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '16px' }}>
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
            title={isDark ? 'Light Mode' : 'Dark Mode'}
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
                {user.name || user.full_name || 'My Account'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary btn-sm"
              style={{ padding: '7px 16px', fontWeight: 700 }}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
