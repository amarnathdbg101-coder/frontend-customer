/**
 * Dedicated Customer Profile Screen
 * 
 * Professional English localization.
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
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { uploadApi } from '../../api/upload.api';
import { AppLayout } from '../../components/layout/AppLayout';
import { getImageUrl } from '../../utils/imageUrl';
import { ThemeLanguageBar } from '../../components/common/ThemeLanguageBar';

export const CustomerProfileScreen = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB.');
      return;
    }

    try {
      setAvatarUploading(true);
      const data = await uploadApi.uploadUserAvatar(file);
      updateUser({ avatar_url: data.avatar_url });
      alert('Profile photo updated successfully!');
    } catch (err) {
      console.error('Avatar upload error:', err);
      alert('Failed to upload avatar: ' + (err.message || 'Error'));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <AppLayout title="My Account">
      <div className="profile-container" style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
        
        {/* User Card */}
        <div className="card profile-user-card" style={{ padding: '1.5rem', textAlign: 'center', marginBottom: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }}>
          <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 1rem auto' }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '2rem',
              fontWeight: 700,
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
            }}>
              {user?.avatar_url ? (
                <img 
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
                background: '#2563eb',
                color: 'white',
                padding: '6px',
                borderRadius: '50%',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Change profile photo"
            >
              <Camera size={16} />
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
            <p style={{ fontSize: '0.8rem', color: '#60a5fa', marginBottom: '0.5rem' }}>Uploading photo...</p>
          )}

          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
            {user?.name || 'Customer'}
          </h2>
          <span style={{ 
            display: 'inline-block', 
            background: 'rgba(59, 130, 246, 0.15)', 
            color: '#60a5fa', 
            fontSize: '0.75rem', 
            padding: '2px 10px', 
            borderRadius: '12px',
            fontWeight: 500,
            marginBottom: '1rem'
          }}>
            Customer (Buyer)
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', padding: '0.85rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <Phone size={16} style={{ color: '#3b82f6' }} />
              <span>{user?.phone || 'No phone number linked'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <Mail size={16} style={{ color: '#3b82f6' }} />
              <span>{user?.email || 'No email address'}</span>
            </div>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          
          <div 
            onClick={() => navigate('/khata')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              background: 'var(--bg-surface)',
              borderRadius: '14px',
              cursor: 'pointer',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(217, 119, 6, 0.15)', color: '#d97706', padding: '8px', borderRadius: '10px' }}>
                <BookOpen size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700 }}>My Ledger &amp; Credit Passbook</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Store credit balance, UPI payments &amp; QR code</p>
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
              padding: '1rem',
              background: 'var(--bg-surface)',
              borderRadius: '14px',
              cursor: 'pointer',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '8px', borderRadius: '10px' }}>
                <ShoppingBag size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>My Store Reservations &amp; Pickups</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Items held for store pickup with OTP codes</p>
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
              padding: '1rem',
              background: 'var(--bg-surface)',
              borderRadius: '14px',
              cursor: 'pointer',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '8px', borderRadius: '10px' }}>
                <Store size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>Nearby Stores</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Browse certified local stores in your area</p>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>

        </div>

        {/* Theme & Language Preferences Card */}
        <div style={{ marginBottom: '1.5rem' }}>
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
            padding: '0.9rem',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
            transition: 'all 0.2s'
          }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>

      </div>
    </AppLayout>
  );
};
