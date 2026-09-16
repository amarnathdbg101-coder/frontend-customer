import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Store,
  Tag,
  ShoppingBag,
  Heart,
  BookOpen,
  User,
  LogOut,
  ChevronRight,
  ShieldAlert,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getImageUrl } from '../../utils/imageUrl';
import { ThemeLanguageBar } from '../common/ThemeLanguageBar';

export const SideDrawer = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, isHindi } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = () => {
    if (window.confirm(t('auth.logout_confirm'))) {
      logout();
      onClose();
      navigate('/login');
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      <div
        className={`drawer-backdrop ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside className={`drawer-content ${isOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu">
        {/* Drawer Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: user?.avatar_url ? 'transparent' : 'var(--color-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.1rem',
                overflow: 'hidden',
                border: '2px solid var(--color-primary-light, #c7d2fe)',
              }}
            >
              {user?.avatar_url ? (
                <img
                  src={getImageUrl(user.avatar_url)}
                  alt={user?.name || user?.full_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                (user?.name || user?.full_name)?.charAt(0)?.toUpperCase() || 'G'
              )}
            </div>

            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {user ? user.full_name || user.name : (isHindi ? 'अतिथि ग्राहक' : 'Guest Customer')}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                {user ? user.phone || user.email : (isHindi ? 'लॉगिन नहीं है' : 'Not signed in')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '6px',
            }}
            aria-label={t('common.close')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body Nav Links */}
        <div className="drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px' }}>
          <button
            className="drawer-nav-item"
            onClick={() => handleNavigate('/')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px', background: 'transparent', border: 'none', borderRadius: '12px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
              <Store size={18} color="var(--color-primary)" />
              <span>{t('nav.explore')}</span>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>

          <button
            className="drawer-nav-item"
            onClick={() => handleNavigate('/deals')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px', background: 'transparent', border: 'none', borderRadius: '12px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
              <Tag size={18} color="#10b981" />
              <span>{t('nav.deals')}</span>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>

          <button
            className="drawer-nav-item"
            onClick={() => handleNavigate('/reservations')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px', background: 'transparent', border: 'none', borderRadius: '12px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
              <ShoppingBag size={18} color="#f59e0b" />
              <span>{t('nav.reservations')}</span>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>

          <button
            className="drawer-nav-item"
            onClick={() => handleNavigate('/saved')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px', background: 'transparent', border: 'none', borderRadius: '12px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
              <Heart size={18} color="#ef4444" />
              <span>{t('nav.saved')}</span>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>

          {isAuthenticated && (
            <button
              className="drawer-nav-item"
              onClick={() => handleNavigate('/khata')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px', background: 'transparent', border: 'none', borderRadius: '12px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                <BookOpen size={18} color="#8b5cf6" />
                <span>{t('nav.khata')}</span>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </button>
          )}

          <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '8px 0' }} />

          {/* Theme and Language Settings Box */}
          <ThemeLanguageBar compact={false} />

          <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '8px 0' }} />

          {/* Compliance & Grievance */}
          <button
            className="drawer-nav-item"
            onClick={() => handleNavigate('/profile')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px', background: 'transparent', border: 'none', borderRadius: '12px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
              <ShieldAlert size={18} color="#dc2626" />
              <span>{t('nav.report')}</span>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>
        </div>

        {/* Drawer Footer */}
        <div className="drawer-footer" style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-danger)' }}
            >
              <LogOut size={16} />
              <span>{t('nav.logout')}</span>
            </button>
          ) : (
            <button
              onClick={() => handleNavigate('/login')}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {t('nav.login')}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
export default SideDrawer;
