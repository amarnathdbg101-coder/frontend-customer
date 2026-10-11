import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Phone, Mail, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { uploadApi } from '../../api/upload.api';
import { AppLayout } from '../../components/layout/AppLayout';
import { getImageUrl } from '../../utils/imageUrl';
import { ThemeLanguageBar } from '../../components/common/ThemeLanguageBar';
import { Card, Badge, Button } from '../../components/ui';

export const CustomerProfileScreen = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
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
        <Card padding="24px 20px" style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 14px auto' }}>
            <div
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2.2rem',
                fontWeight: 900,
                overflow: 'hidden',
                boxShadow: '0 6px 18px rgba(79, 70, 229, 0.35)',
              }}
            >
              {user?.avatar_url ? (
                <img
                  loading="lazy"
                  decoding="async"
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

          <div style={{ marginBottom: '1.25rem' }}>
            <Badge variant="primary">
              {isHindi ? 'सत्यापित ग्राहक (Buyer)' : 'Verified Customer (Shopper)'}
            </Badge>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              textAlign: 'left',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
              <Phone size={15} style={{ color: 'var(--color-primary)' }} />
              <span>{user?.phone || (isHindi ? 'फ़ोन नंबर लिंक नहीं है' : 'No phone number linked')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
              <Mail size={15} style={{ color: 'var(--color-primary)' }} />
              <span>{user?.email || (isHindi ? 'ईमेल दर्ज नहीं है' : 'No email address linked')}</span>
            </div>
          </div>
        </Card>

        {/* Theme & Language Preferences Card */}
        <div style={{ marginBottom: '16px' }}>
          <ThemeLanguageBar />
        </div>

        {/* Logout */}
        <Button
          variant="danger"
          icon={LogOut}
          fullWidth={true}
          onClick={handleLogout}
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            boxShadow: 'none',
          }}
        >
          {isHindi ? 'लॉग आउट करें' : 'Sign Out'}
        </Button>
      </div>
    </AppLayout>
  );
};
export default CustomerProfileScreen;
