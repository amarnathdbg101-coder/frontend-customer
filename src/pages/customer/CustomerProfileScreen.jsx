/**
 * Dedicated Customer Profile Screen
 * Bilingual, accessible, responsive customer profile dashboard
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  ShoppingBag,
  Store,
  BookOpen,
  LogOut,
  Camera,
  ChevronRight,
  LayoutDashboard,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { uploadApi } from '../../api/upload.api';
import { AppLayout } from '../../components/layout/AppLayout';
import { getImageUrl } from '../../utils/imageUrl';
import { ThemeLanguageBar } from '../../components/common/ThemeLanguageBar';

export const CustomerProfileScreen = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser, isMerchant } = useAuth();
  const { isHindi, t } = useLanguage();
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(isHindi ? 'फ़ोटो का साइज़ 2MB से कम होना चाहिए।' : 'Image size must be less than 2MB.');
      return;
    }

    try {
      setAvatarUploading(true);
      const data = await uploadApi.uploadUserAvatar(file);
      updateUser({ avatar_url: data.avatar_url });
      alert(isHindi ? 'प्रोफ़ाइल फ़ोटो सफलतापूर्वक अपडेट हो गई!' : 'Profile photo updated successfully!');
    } catch (err) {
      console.error('Avatar upload error:', err);
      alert((isHindi ? 'फ़ोटो अपलोड करने में त्रुटि: ' : 'Failed to upload avatar: ') + (err.message || 'Error'));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm(isHindi ? 'क्या आप सचमुच लॉग आउट करना चाहते हैं?' : 'Are you sure you want to sign out?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <AppLayout
      title={isHindi ? 'मेरी प्रोफ़ाइल एवं खाता' : 'My Account & Settings'}
      subtitle={isHindi ? 'व्यक्तिगत विवरण व प्राथमिकताएँ' : 'Personal Details & Preferences'}
    >
      <title>{t('nav.profile')} — ShopSilo</title>

      <div className="profile-container" style={{ padding: '0', maxWidth: '640px', margin: '0 auto' }}>
        
        {/* User Card */}
        <div
          className="card profile-user-card"
          style={{
            padding: '24px 20px',
            textAlign: 'center',
            marginBottom: '16px',
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 14px auto' }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '2.2rem',
              fontWeight: 900,
              overflow: 'hidden',
              boxShadow: '0 6px 18px rgba(79, 70, 229, 0.35)',
            }}>
              {user?.avatar_url ? (
                <img loading="lazy" decoding="async"  
                  src={getImageUrl(user.avatar_url)} 
                  alt={user?.name || 'Customer'} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                user?.name ? user.name[0].toUpperCase() : 'C'
              )}
            </div>

            <label 
              htmlFor="customer-avatar-upload"
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                background: 'var(--color-primary)',
                color: 'white',
                padding: '7px',
                borderRadius: '50%',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--bg-surface)',
              }}
              title={isHindi ? 'प्रोफ़ाइल फ़ोटो बदलें' : 'Change profile photo'}
            >
              <Camera size={15} />
            </label>
            <input 
              id="customer-avatar-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleAvatarChange} 
              style={{ display: 'none' }} 
              disabled={avatarUploading}
            />
          </div>

          {avatarUploading && (
            <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginBottom: '0.5rem', fontWeight: 600 }}>
              {isHindi ? 'फ़ोटो अपलोड हो रही है...' : 'Uploading photo...'}
            </p>
          )}

          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
            {user?.name || user?.full_name || (isHindi ? 'ग्राहक' : 'Customer')}
          </h2>
          <span style={{ 
            display: 'inline-block', 
            background: 'var(--color-primary-light)', 
            color: 'var(--color-primary)', 
            fontSize: '0.76rem', 
            padding: '3px 12px', 
            borderRadius: 'var(--radius-full)',
            fontWeight: 800,
            marginBottom: '1.25rem'
          }}>
            {isHindi ? 'सत्यापित ग्राहक (Buyer)' : 'Verified Customer (Shopper)'}
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', textAlign: 'left', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
              <Phone size={15} style={{ color: 'var(--color-primary)' }} />
              <span>{user?.phone || (isHindi ? 'फ़ोन नंबर लिंक नहीं है' : 'No phone number linked')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
              <Mail size={15} style={{ color: 'var(--color-primary)' }} />
              <span>{user?.email || (isHindi ? 'ईमेल दर्ज नहीं है' : 'No email address linked')}</span>
            </div>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          
          {/* Merchant OS Terminal Tile / Create Shop Tile (Role-based conditional) */}
          <a
            href={isMerchant ? "https://shop.shopsilo.in" : "https://shop.shopsilo.in/register"}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid rgba(79, 70, 229, 0.25)',
              boxShadow: 'var(--shadow-xs)',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'var(--color-primary)', color: '#ffffff', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isMerchant ? <LayoutDashboard size={20} /> : <PlusCircle size={20} />}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.96rem', color: 'var(--color-primary)', fontWeight: 800 }}>
                  {isMerchant ? (isHindi ? '🏪 दुकानदार डैशबोर्ड (Merchant OS)' : '🏪 Open Merchant Dashboard') : (isHindi ? '🏪 दुकान बनाएं / सेलर बनें' : '🏪 Start Selling / Create Shop')}
                </h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {isMerchant
                    ? (isHindi ? 'POS काउंटर, लाइव स्टॉक, डिजिटल खाता व रिपोर्ट्स' : 'Access POS Counter, Live Inventory, Khata & Analytics')
                    : (isHindi ? 'अपनी दुकान रजिस्टर करें, डिजिटल बिलिंग व खाता शुरू करें' : 'Register your store on ShopSilo and start billing')}
                </p>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: 'var(--color-primary)' }} />
          </a>

          <div 
            onClick={() => navigate('/khata')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-xs)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(217, 119, 6, 0.15)', color: '#d97706', padding: '10px', borderRadius: '12px' }}>
                <BookOpen size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.96rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                  {isHindi ? 'मेरा डिजिटल खाता एवं पासबुक' : 'My Khata & Credit Passbook'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {isHindi ? 'उधार बही, ऑनलाइन यूपीआई भुगतान व क्यूआर' : 'Store credit balances, UPI payments & passbook'}
                </p>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>

          <div 
            onClick={() => navigate('/reservations')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-xs)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '10px', borderRadius: '12px' }}>
                <ShoppingBag size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.96rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                  {isHindi ? 'मेरी बुकिंग्स एवं पिकअप ऑर्डर्स' : 'My Store Pickups & Reservations'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {isHindi ? 'दुकान से पिकअप हेतु आरक्षित सामान व ओटीपी' : 'Reserved items held for store pickup with OTP codes'}
                </p>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>

          <div 
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-xs)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(79, 70, 229, 0.15)', color: 'var(--color-primary)', padding: '10px', borderRadius: '12px' }}>
                <Store size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.96rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                  {isHindi ? 'आस-पास की दुकानें खोजें' : 'Explore Neighborhood Stores'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {isHindi ? 'अपने इलाके की प्रमाणित दुकानों का लाइव स्टॉक देखें' : 'Browse certified local stores & live inventory'}
                </p>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>

        </div>

        {/* Theme & Language Preferences Card */}
        <div style={{ marginBottom: '16px' }}>
          <ThemeLanguageBar />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '0.95rem',
            transition: 'all 0.15s ease',
          }}
        >
          <LogOut size={18} />
          <span>{isHindi ? 'लॉग आउट करें' : 'Sign Out'}</span>
        </button>

      </div>
    </AppLayout>
  );
};
export default CustomerProfileScreen;
