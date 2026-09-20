/**
 * Customer App Bottom Navigation Bar
 * Matches Shopsilo Native Mobile OS: Explore, Saved & Orders, Profile
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Heart, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSaved } from '../../context/SavedContext';
import { useLanguage } from '../../context/LanguageContext';

export const BottomNav = () => {
  const { isAuthenticated } = useAuth();
  const { savedProducts, savedShops } = useSaved();
  const { isHindi } = useLanguage();
  const totalSaved = (savedProducts?.length || 0) + (savedShops?.length || 0);

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Customer Navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Home size={20} />
        <span>{isHindi ? 'एक्सप्लोर' : 'Explore'}</span>
      </NavLink>

      <NavLink
        to="/saved"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        style={{ position: 'relative' }}
      >
        <Heart size={20} />
        <span>{isHindi ? 'सेव्ड व ऑर्डर्स' : 'Saved & Orders'}</span>
        {totalSaved > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '20px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '0.62rem',
              fontWeight: 800,
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {totalSaved > 9 ? '9+' : totalSaved}
          </span>
        )}
      </NavLink>

      <NavLink
        to={isAuthenticated ? "/profile" : "/login"}
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <User size={20} />
        <span>{isAuthenticated ? (isHindi ? 'प्रोफ़ाइल' : 'Profile') : (isHindi ? 'लॉगिन' : 'Profile')}</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
