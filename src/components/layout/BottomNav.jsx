import React from 'react';
import { NavLink } from 'react-router-dom';
import { Store, Tag, Heart, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSaved } from '../../context/SavedContext';
import { useLanguage } from '../../context/LanguageContext';

export const BottomNav = () => {
  const { isAuthenticated } = useAuth();
  const { savedProducts, savedShops } = useSaved();
  const { t } = useLanguage();
  const totalSaved = (savedProducts?.length || 0) + (savedShops?.length || 0);

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Bottom Navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Store size={20} aria-hidden="true" />
        <span>{t('nav.explore')}</span>
      </NavLink>

      <NavLink
        to="/deals"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Tag size={20} aria-hidden="true" />
        <span>{t('nav.deals')}</span>
      </NavLink>

      <NavLink
        to="/saved"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        style={{ position: 'relative' }}
      >
        <Heart size={20} aria-hidden="true" />
        <span>{t('nav.saved')}</span>
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
        <ShoppingBag size={20} aria-hidden="true" />
        <span>{t('nav.reservations')}</span>
      </NavLink>

      <NavLink
        to={isAuthenticated ? "/profile" : "/login"}
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <User size={20} aria-hidden="true" />
        <span>{isAuthenticated ? t('nav.profile') : t('nav.login')}</span>
      </NavLink>
    </nav>
  );
};
export default BottomNav;
