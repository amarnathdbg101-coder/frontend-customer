import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Phone, Mail, LogOut, Edit2, CheckCircle2, Smartphone, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { uploadApi } from '../../api/upload.api';
import { authApi } from '../../api/auth.api';
import { AppLayout } from '../../components/layout/AppLayout';
import { getImageUrl } from '../../utils/imageUrl';
import { ThemeLanguageBar } from '../../components/common/ThemeLanguageBar';
import { Card, Badge, Button } from '../../components/ui';
import { BaseModal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/BaseModal';
import { FormField, Input } from '../../components/ui/FormControls';
import { AlertBanner } from '../../components/ui/AlertBanner';

export const CustomerProfileScreen = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { isHindi, t } = useLanguage();

  const [avatarUploading, setAvatarUploading] = useState(false);

  // Profile Link & Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fullNameInput, setFullNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFullNameInput(user.name || user.full_name || '');
      const rawPhone = user.phone ? String(user.phone).replace(/[^0-9]/g, '') : '';
      setPhoneInput(rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone);
    }
  }, [user]);

  const handleOpenEditModal = () => {
    setFullNameInput(user?.name || user?.full_name || '');
    const rawPhone = user?.phone ? String(user.phone).replace(/[^0-9]/g, '') : '';
    setPhoneInput(rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone);
    setUpdateError('');
    setUpdateSuccessMsg('');
    setIsEditModalOpen(true);
  };

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
      setUpdateSuccessMsg(isHindi ? 'प्रोफ़ाइल फ़ोटो सफलतापूर्वक अपडेट हो गई!' : 'Profile photo updated successfully!');
    } catch (err) {
      console.error('Avatar upload error:', err);
      alert((isHindi ? 'फ़ोटो अपलोड करने में त्रुटि: ' : 'Failed to upload avatar: ') + (err.message || 'Error'));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccessMsg('');

    const cleanName = fullNameInput.trim();
    const cleanPhoneDigits = phoneInput.replace(/[^0-9]/g, '').trim();

    if (!cleanName || cleanName.length < 2) {
      setUpdateError(isHindi ? 'कृपया अपना पूरा नाम दर्ज करें (कम से कम 2 अक्षर)।' : 'Please enter your full name (at least 2 characters).');
      return;
    }

    if (cleanPhoneDigits && !/^[6-9]\d{9}$/.test(cleanPhoneDigits)) {
      setUpdateError(isHindi ? 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें (6-9 से शुरू)।' : 'Please enter a valid 10-digit Indian mobile number (starting with 6-9).');
      return;
    }

    try {
      setIsSaving(true);
      const formattedPhone = cleanPhoneDigits ? cleanPhoneDigits : '';
      const response = await authApi.updateProfile({
        full_name: cleanName,
        phone: formattedPhone,
      });

      const updatedUserData = response?.data || response?.user || {};
      const newPhone = updatedUserData.phone || formattedPhone;
      const newName = updatedUserData.full_name || cleanName;

      updateUser({
        name: newName,
        full_name: newName,
        phone: newPhone,
      });

      setUpdateSuccessMsg(
        isHindi
          ? 'प्रोफ़ाइल व मोबाइल नंबर सफलतापूर्वक अपडेट हो गया!'
          : 'Profile and mobile number updated successfully!'
      );
      setTimeout(() => {
        setIsEditModalOpen(false);
      }, 1200);
    } catch (err) {
      console.error('Profile update error:', err);
      const errMsg = err?.response?.data?.message || err?.message || '';
      const msgLower = errMsg.toLowerCase();
      if (msgLower.includes('phone') || msgLower.includes('conflict') || msgLower.includes('already')) {
        setUpdateError(
          isHindi
            ? 'यह मोबाइल नंबर पहले से ही किसी अन्य खाते से जुड़ा हुआ है। कृपया कोई दूसरा नंबर दर्ज करें या उस खाते से लॉगिन करें।'
            : 'This mobile number is already linked to another account. Please use a different number or sign in with that account.'
        );
      } else if (msgLower.includes('user not found') || msgLower.includes('unauthorized') || msgLower.includes('session expired')) {
        setUpdateError(
          isHindi
            ? 'आपका सत्र समाप्त हो गया है। कृपया दोबारा लॉग इन करें।'
            : 'Your session has expired. Please sign in again.'
        );
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 1500);
      } else {
        setUpdateError(
          isHindi
            ? 'प्रोफ़ाइल अपडेट करने में विफल: ' + (errMsg || 'त्रुटि')
            : 'Failed to update profile: ' + (errMsg || 'Server Error')
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm(isHindi ? 'क्या आप सचमुच लॉग आउट करना चाहते हैं?' : 'Are you sure you want to sign out?')) {
      logout();
      navigate('/login');
    }
  };

  const cleanUserPhone = user?.phone ? String(user.phone).replace(/[^0-9]/g, '') : '';
  const displayPhone = cleanUserPhone.length >= 10 ? cleanUserPhone.slice(-10) : cleanUserPhone;

  return (
    <AppLayout
      title={isHindi ? 'मेरी प्रोफ़ाइल एवं खाता' : 'My Account & Settings'}
      subtitle={isHindi ? 'व्यक्तिगत विवरण व प्राथमिकताएँ' : 'Personal Details & Preferences'}
    >
      <title>{t('nav.profile')} — ShopSilo</title>

      <div className="profile-container" style={{ padding: '0', maxWidth: '640px', margin: '0 auto' }}>
        {updateSuccessMsg && (
          <AlertBanner
            type="success"
            message={updateSuccessMsg}
            onDismiss={() => setUpdateSuccessMsg('')}
          />
        )}

        {/* User Card */}
        <Card
          padding="24px 20px"
          style={{
            textAlign: 'center',
            marginBottom: '16px',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-surface, #ffffff)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 14px auto' }}>
            <div
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                backgroundColor: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '2.2rem',
                fontWeight: 900,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
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
                backgroundColor: '#0f172a',
                color: '#ffffff',
                padding: '7px',
                borderRadius: '50%',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ffffff',
              }}
              title={isHindi ? 'प्रोफ़ाइल फ़ोटो बदलें' : 'Change profile photo'}
            >
              <Camera size={14} />
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
            <p style={{ fontSize: '0.8rem', color: '#2563eb', marginBottom: '0.5rem', fontWeight: 600 }}>
              {isHindi ? 'फ़ोटो अपलोड हो रही है...' : 'Uploading photo...'}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
              {user?.name || user?.full_name || (isHindi ? 'ग्राहक' : 'Customer')}
            </h2>
            <button
              type="button"
              onClick={handleOpenEditModal}
              title={isHindi ? 'विवरण बदलें' : 'Edit Profile'}
              style={{
                backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                borderRadius: '8px',
                padding: '4px 10px',
                cursor: 'pointer',
                color: 'var(--text-primary, #0f172a)',
                fontSize: '0.76rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Edit2 size={12} />
              <span>{isHindi ? 'संपादित करें' : 'Edit'}</span>
            </button>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                backgroundColor: '#dcfce7',
                color: '#15803d',
                padding: '4px 12px',
                borderRadius: '12px',
                border: '1px solid #86efac',
              }}
            >
              ✓ {isHindi ? 'सत्यापित ग्राहक (Buyer)' : 'Verified Customer (Shopper)'}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              textAlign: 'left',
              backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
              border: '1px solid var(--border-subtle, #e2e8f0)',
              padding: '14px 16px',
              borderRadius: '12px',
            }}
          >
            {/* Phone Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-primary, #0f172a)', fontSize: '0.88rem', fontWeight: 600 }}>
                <Phone size={16} color="#0f172a" style={{ flexShrink: 0 }} />
                <span>
                  {displayPhone ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}>
                      +91 {displayPhone}
                      <CheckCircle2 size={14} color="#16a34a" title={isHindi ? 'सत्यापित मोबाइल' : 'Verified Mobile'} />
                    </span>
                  ) : (
                    <span style={{ color: '#d97706', fontWeight: 600 }}>
                      {isHindi ? 'फ़ोन नंबर लिंक नहीं है' : 'No mobile number linked'}
                    </span>
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={handleOpenEditModal}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  padding: '5px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f1f5f9',
                  color: '#0f172a',
                  cursor: 'pointer',
                }}
              >
                {displayPhone
                  ? (isHindi ? 'बदलें' : 'Change Phone')
                  : (isHindi ? '+ फ़ोन नंबर लिंक करें' : '+ Link Mobile Number')}
              </button>
            </div>

            {/* Email Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary, #475569)', fontSize: '0.86rem' }}>
              <Mail size={16} color="#0f172a" style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 600 }}>{user?.email || (isHindi ? 'ईमेल दर्ज नहीं है' : 'No email address linked')}</span>
            </div>
          </div>
        </Card>

        {/* Theme & Language Preferences Card */}
        <div style={{ marginBottom: '16px' }}>
          <ThemeLanguageBar />
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fca5a5',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <LogOut size={16} />
          <span>{isHindi ? 'लॉग आउट करें' : 'Sign Out'}</span>
        </button>
      </div>

      {/* Link & Edit Mobile Number Modal */}
      <BaseModal
        isOpen={isEditModalOpen}
        onClose={() => !isSaving && setIsEditModalOpen(false)}
        maxWidth="480px"
      >
        <ModalHeader
          title={displayPhone ? (isHindi ? 'प्रोफ़ाइल व मोबाइल नंबर बदलें' : 'Update Profile & Phone') : (isHindi ? '📱 नया मोबाइल नंबर लिंक करें' : '📱 Link Mobile Phone Number')}
          subtitle={isHindi ? 'ऑर्डर अपडेट, खाता पासबुक व पिकअप अलर्ट हेतु मोबाइल जोड़ें' : 'Enter 10-digit mobile number for order receipts & pickup alerts'}
          icon={Smartphone}
          iconColor="#0f172a"
          onClose={() => !isSaving && setIsEditModalOpen(false)}
        />

        <form onSubmit={handleSaveProfile}>
          <ModalBody padding="20px">
            {updateError && (
              <AlertBanner
                type="error"
                message={updateError}
                onDismiss={() => setUpdateError('')}
              />
            )}

            <FormField label={isHindi ? 'पूरा नाम' : 'Full Name'} required>
              <Input
                type="text"
                value={fullNameInput}
                onChange={(e) => setFullNameInput(e.target.value)}
                placeholder={isHindi ? 'अपना नाम दर्ज करें' : 'Enter your name'}
                disabled={isSaving}
                autoFocus
              />
            </FormField>

            <FormField
              label={isHindi ? '10-अंकों का मोबाइल नंबर' : '10-Digit Indian Mobile Number'}
              hint={isHindi ? 'उदाहरण: 9876543210' : 'Format: 9876543210 (without +91)'}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-subtle, #e2e8f0)', backgroundColor: '#f8fafc', fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                  +91
                </span>
                <Input
                  type="tel"
                  maxLength={10}
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="9876543210"
                  disabled={isSaving}
                  style={{ flex: 1 }}
                />
              </div>
            </FormField>
          </ModalBody>

          <ModalFooter>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSaving}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f1f5f9',
                color: '#0f172a',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              {isSaving ? (isHindi ? 'सहेज रहे हैं...' : 'Saving...') : (isHindi ? 'सहेजें' : 'Save Changes')}
            </button>
          </ModalFooter>
        </form>
      </BaseModal>
    </AppLayout>
  );
};

export default CustomerProfileScreen;
