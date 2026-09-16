import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Globe,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Award,
  BookOpen,
  FileText,
} from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ThemeLanguageBar } from '../../components/common/ThemeLanguageBar';
import { AddressesModal } from '../../components/customer/AddressesModal';
import { ReportModal } from '../../components/customer/ReportModal';
import { PrivacyPolicyModal } from '../../components/customer/PrivacyPolicyModal';
import { getImageUrl } from '../../utils/imageUrl';

export const CustomerProfileScreen = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { t, isHindi } = useLanguage();

  const [showAddresses, setShowAddresses] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <AppLayout title={t('profile.my_profile')}>
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <User size={48} color="var(--text-muted)" />
          <h3 style={{ margin: '16px 0 8px 0' }}>{t('auth.login_title')}</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{t('auth.login_subtitle')}</p>
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            {t('nav.login')}
          </button>
        </div>
      </AppLayout>
    );
  }

  const handleLogout = () => {
    if (window.confirm(t('auth.logout_confirm'))) {
      logout();
      navigate('/login');
    }
  };

  return (
    <AppLayout title={t('profile.my_profile')} subtitle={t('profile.manage_account')}>
      {/* Profile Card */}
      <div style={{ backgroundColor: 'var(--bg-card, var(--bg-surface))', borderRadius: '16px', border: '1px solid var(--border-subtle)', padding: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.4rem', overflow: 'hidden' }}>
          {user.avatar_url ? (
            <img src={getImageUrl(user.avatar_url)} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            (user.name || user.full_name || 'U').charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>{user.full_name || user.name}</h3>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{user.phone || user.email}</div>
          <span className="badge badge-primary" style={{ marginTop: '6px' }}>{isHindi ? 'सत्यापित ग्राहक' : 'Verified Customer'}</span>
        </div>
      </div>

      {/* Settings Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Theme and Language */}
        <ThemeLanguageBar compact={false} />

        {/* Saved Addresses */}
        <div style={{ backgroundColor: 'var(--bg-card, var(--bg-surface))', borderRadius: '16px', border: '1px solid var(--border-subtle)', padding: '6px' }}>
          <button
            onClick={() => setShowAddresses(true)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MapPin size={18} color="var(--color-primary)" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t('profile.saved_addresses')}</span>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>
        </div>

        {/* Compliance & Legal */}
        <div style={{ backgroundColor: 'var(--bg-card, var(--bg-surface))', borderRadius: '16px', border: '1px solid var(--border-subtle)', padding: '6px' }}>
          <button
            onClick={() => setShowReport(true)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldAlert size={18} color="#dc2626" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t('profile.grievance_redressal')}</span>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>

          <button
            onClick={() => setShowPrivacy(true)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText size={18} color="var(--color-primary)" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t('profile.privacy_policy')}</span>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{ width: '100%', color: 'var(--color-danger)', fontWeight: 800, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <LogOut size={16} />
          <span>{t('nav.logout')}</span>
        </button>

        <div style={{ textAlign: 'center', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          {t('profile.app_version')}
        </div>
      </div>

      {/* Modals */}
      {showAddresses && <AddressesModal isOpen={showAddresses} onClose={() => setShowAddresses(false)} />}
      {showReport && <ReportModal isOpen={showReport} onClose={() => setShowReport(false)} />}
      {showPrivacy && <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />}
    </AppLayout>
  );
};
export default CustomerProfileScreen;
