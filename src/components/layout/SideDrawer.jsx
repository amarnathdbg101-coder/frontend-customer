/**
 * Universal Responsive Mobile Drawer Navigation Menu
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Store,
  BookOpen,
  ShoppingBag,
  User,
  LogOut,
  ChevronRight,
  PlusCircle,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ThemeLanguageBar } from '../common/ThemeLanguageBar';
import { getImageUrl } from '../../utils/imageUrl';

export const SideDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isMerchant, logout } = useAuth();
  const { isHindi } = useLanguage();

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

  return (
    <>
      {/* Backdrop */}
      <div className="drawer-backdrop active" onClick={onClose} />

      {/* Drawer Container */}
      <aside className="side-drawer open" aria-label="Customer Navigation Drawer" role="dialog" aria-modal="true">
        {/* Header Profile Section */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.2rem',
                overflow: 'hidden',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
              }}
            >
              {user?.avatar_url ? (
                <img
                  src={getImageUrl(user.avatar_url)}
                  alt={user.name || user.full_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                (user?.name || user?.full_name)?.charAt(0)?.toUpperCase() || 'S'
              )}
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                {user ? user.name || user.full_name || (isHindi ? 'नमस्ते ग्राहक' : 'Hello Customer') : (isHindi ? 'नमस्ते ग्राहक' : 'Welcome Guest')}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                {user ? user.phone || user.email : (isHindi ? 'हाइपरलोकल बाज़ार में स्वागत है' : 'Hyperlocal Shopping Portal')}
              </div>
            </div>
          </div>

          <button onClick={onClose} className="drawer-close-btn" title={isHindi ? 'मेनू बंद करें' : 'Close Menu'}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          <div className="drawer-section-title">{isHindi ? 'बाज़ार एवं ऑर्डर्स' : 'MARKETPLACE & ORDERS'}</div>
          <div className="drawer-links-group">
            <button className="drawer-link-btn" onClick={() => handleNavigate('/')}>
              <div className="drawer-icon-bubble" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                <Store size={18} />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div className="drawer-link-title">{isHindi ? 'आस-पास की दुकानें' : 'Explore Nearby Shops'}</div>
                <div className="drawer-link-sub">{isHindi ? 'प्रमाणित स्थानीय स्टोर खोजें' : 'Discover verified stores'}</div>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </button>

            <button className="drawer-link-btn" onClick={() => handleNavigate('/reservations')}>
              <div className="drawer-icon-bubble" style={{ background: '#dcfce7', color: '#15803d' }}>
                <ShoppingBag size={18} />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div className="drawer-link-title">{isHindi ? 'मेरी बुकिंग्स एवं होल्ड्स' : 'My Pickups & Holds'}</div>
                <div className="drawer-link-sub">{isHindi ? 'आरक्षित सामान एवं पिकअप ओटीपी कोड' : 'Reserved items & pickup OTP codes'}</div>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </button>

            <button className="drawer-link-btn" onClick={() => handleNavigate(isAuthenticated ? '/khata' : '/login')}>
              <div className="drawer-icon-bubble" style={{ background: '#fef3c7', color: '#d97706' }}>
                <BookOpen size={18} />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div className="drawer-link-title">{isHindi ? 'मेरा डिजिटल खाता (पासबुक)' : 'My Khata (Digital Passbook)'}</div>
                <div className="drawer-link-sub">{isHindi ? 'उधार बही, ऑनलाइन यूपीआई भुगतान' : 'Udhar ledger, UPI payments & balance'}</div>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </button>

            {/* Merchant Dashboard or Create Shop (Role-based conditional) */}
            {isMerchant ? (
              <button className="drawer-link-btn" onClick={handleOpenMerchantDashboard} style={{ background: 'rgba(79, 70, 229, 0.05)', border: '1px solid rgba(79, 70, 229, 0.15)' }}>
                <div className="drawer-icon-bubble" style={{ background: 'var(--color-primary)', color: '#ffffff' }}>
                  <LayoutDashboard size={18} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div className="drawer-link-title" style={{ color: 'var(--color-primary)', fontWeight: 900 }}>
                    {isHindi ? 'दुकानदार डैशबोर्ड' : 'Merchant Dashboard'}
                  </div>
                  <div className="drawer-link-sub">{isHindi ? 'पीओएस बिलिंग, स्टॉक, खाता व दैनिक लाभ' : 'POS Billing, Stock, Khata & Daily Profit'}</div>
                </div>
                <ChevronRight size={16} color="var(--color-primary)" />
              </button>
            ) : (
              <button className="drawer-link-btn" onClick={handleCreateShop}>
                <div className="drawer-icon-bubble" style={{ background: '#ede9fe', color: '#6d28d9' }}>
                  <PlusCircle size={18} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div className="drawer-link-title" style={{ color: 'var(--color-primary)', fontWeight: 800 }}>
                    {isHindi ? 'दुकान बनाएं' : 'Create Shop'}
                  </div>
                  <div className="drawer-link-sub">{isHindi ? 'नई दुकान रजिस्टर करें और बिलिंग शुरू करें' : 'Register store & start billing'}</div>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </button>
            )}

            <button className="drawer-link-btn" onClick={() => handleNavigate(isAuthenticated ? '/profile' : '/login')}>
              <div className="drawer-icon-bubble" style={{ background: '#f1f5f9', color: '#334155' }}>
                <User size={18} />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div className="drawer-link-title">{isHindi ? 'मेरी प्रोफ़ाइल एवं सेटिंग्स' : 'My Profile & Account'}</div>
                <div className="drawer-link-sub">{isAuthenticated ? (isHindi ? 'खाता विवरण व सेटिंग्स' : 'Account details & preferences') : (isHindi ? 'लॉगिन या नया खाता बनाएं' : 'Sign in or register')}</div>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <div className="drawer-section-title">{isHindi ? 'थीम एवं भाषा सेटिंग्स' : 'THEME & LANGUAGE'}</div>
            <ThemeLanguageBar />
          </div>
        </div>

        <div className="drawer-footer">
          {isAuthenticated ? (
            <button className="btn btn-outline btn-block" onClick={handleLogout} style={{ gap: '8px', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              <LogOut size={16} />
              <span>{isHindi ? 'लॉग आउट करें' : 'Sign Out'}</span>
            </button>
          ) : (
            <button className="btn btn-primary btn-block" onClick={() => handleNavigate('/login')}>
              <span>{isHindi ? 'लॉगिन / खाता बनाएं' : 'Login / Register'}</span>
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
