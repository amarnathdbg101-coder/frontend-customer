/**
 * Customer App Bottom Navigation Bar
 * Fully bilingual with live saved badges and active highlight
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Store, Tag, Heart, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSaved } from '../../context/SavedContext';
import { useLanguage } from '../../context/LanguageContext';

export const BottomNav = () => {
  const { isAuthenticated } = useAuth();
  const { savedProducts, savedShops } = useSaved();
  const { isHindi } = useLanguage();
  const totalSaved = (savedProducts?.length || 0) + (savedShops?.length || 0);

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Store size={20} />
        <span>{isHindi ? 'दुकानें' : 'Shops'}</span>
      </NavLink>

      <NavLink
        to="/deals"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Tag size={20} />
        <span>{isHindi ? 'डील्स' : 'Deals'}</span>
      </NavLink>

      <NavLink
        to="/saved"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        style={{ position: 'relative' }}
      >
        <Heart size={20} />
        <span>{isHindi ? 'पसंदीदा' : 'Saved'}</span>
        {totalSaved > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '18px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 800,
              width: '16px',
              height: '16px',
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
        to="/reservations"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <ShoppingBag size={20} />
        <span>{isHindi ? 'बुकिंग्स' : 'Bookings'}</span>
      </NavLink>

      <NavLink
        to={isAuthenticated ? "/profile" : "/login"}
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <User size={20} />
        <span>{isAuthenticated ? (isHindi ? 'प्रोफ़ाइल' : 'Profile') : (isHindi ? 'लॉगिन' : 'Login')}</span>
      </NavLink>
    </nav>
  );
};
