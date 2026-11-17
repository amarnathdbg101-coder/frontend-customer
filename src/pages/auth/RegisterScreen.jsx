/**
 * Customer Registration Screen
 * 100% localized (English & हिन्दी, zero passwords, zero forms)
 * Direct 1-Click Google Sign-In & Instant Onboarding
 */

import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Zap, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { sessionState } from '../../utils/sessionState';
import { useLanguage } from '../../context/LanguageContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { GoogleLoginButton } from '../../components/auth/GoogleLoginButton';
import { ShopSiloLogo } from '../../components/common/ShopSiloLogo';

export const RegisterScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle } = useAuth();
  const { isHindi, setLanguage, t } = useLanguage();

  const [error, setError] = useState('');

  const handleGoogleSuccess = useCallback(async (idToken) => {
    setError('');
    try {
      await loginWithGoogle(idToken);
      const targetRoute = sessionState.getRedirectAfterLogin() || location.state?.from?.pathname || '/';
      navigate(targetRoute, { replace: true });
    } catch (err) {
      setError(err.message || t('common.error'));
    }
  }, [loginWithGoogle, location, navigate, t]);

  return (
    <AppLayout title={t('app_name')} subtitle={isHindi ? 'नया खाता बनाएं' : 'Create Account'} hideNav={true}>
      <div style={{ paddingTop: '20px', maxWidth: '440px', margin: '0 auto', paddingBottom: '32px' }}>
        
        {/* Top Language Toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <div
            style={{
              display: 'inline-flex',
              background: 'var(--bg-surface-subtle, rgba(255,255,255,0.06))',
              border: '1px solid var(--border-subtle, #e2e8f0)',
              borderRadius: '9999px',
              padding: '3px',
              gap: '4px',
            }}
            role="radiogroup"
            aria-label="Language selection"
          >
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              style={{
                border: 'none',
                background: isHindi ? 'var(--color-primary, #4f46e5)' : 'transparent',
                color: isHindi ? '#ffffff' : 'var(--text-secondary, #64748b)',
                fontWeight: 700,
                fontSize: '0.78rem',
                padding: '4px 12px',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              style={{
                border: 'none',
                background: !isHindi ? 'var(--color-primary, #4f46e5)' : 'transparent',
                color: !isHindi ? '#ffffff' : 'var(--text-secondary, #64748b)',
                fontWeight: 700,
                fontSize: '0.78rem',
                padding: '4px 12px',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              English
            </button>
          </div>
        </div>

        {/* Brand Banner */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <ShopSiloLogo size={68} showText={false} variant="tint" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            {isHindi ? '1-क्लिक में नया खाता बनाएं' : 'Instant 1-Click Sign-Up'}
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
            {isHindi 
              ? 'कोई पासवर्ड या लंबा फॉर्म भरने की ज़रूरत नहीं। Google से तुरंत जुड़ें।' 
              : 'No passwords or forms to fill. Join instantly with your Google account.'}
          </p>
        </div>

        {/* Value Prop Benefits Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-subtle, rgba(248, 250, 252, 0.8))',
            borderRadius: '16px',
            border: '1px solid var(--border-color, #e2e8f0)',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex' }}>
              <Zap size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isHindi ? 'तुरंत खाता एक्टिवेशन' : 'Instant Activation'}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                {isHindi ? 'Google प्रोफ़ाइल से तुरंत नाम और ईमेल सेट हो जाता है' : 'Automatically gets your verified name & email'}
              </div>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-color, #e2e8f0)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(79, 70, 229, 0.12)', color: '#4f46e5', display: 'flex' }}>
              <KeyRound size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isHindi ? 'पासवर्ड याद रखने का झंझट खत्म' : 'No Password Required'}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                {isHindi ? 'हमेशा सिर्फ 1-क्लिक में सुरक्षित लॉगिन' : 'Always seamless 1-click authentication'}
              </div>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-color, #e2e8f0)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex' }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isHindi ? '100% डेटा व खाता सुरक्षा' : '100% Account Security'}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                {isHindi ? 'बैंक-ग्रेड एन्क्रिप्शन और Google OAuth' : 'Bank-grade OAuth2 and verified email protection'}
              </div>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            style={{
              backgroundColor: 'var(--color-danger-light, #fef2f2)',
              color: 'var(--color-danger, #ef4444)',
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Primary Google Sign-In Button */}
        <div style={{ marginBottom: '24px' }}>
          <GoogleLoginButton
            text="signup_with"
            onSuccess={handleGoogleSuccess}
            onError={(err) => setError(err.message || t('common.error'))}
          />
        </div>

        {/* Terms Disclaimer */}
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', marginTop: '20px', lineHeight: 1.4 }}>
          {isHindi 
            ? 'Google से जारी रखकर आप ShopSilo की सेवा शर्तों व गोपनीयता नीति से सहमत होते हैं।' 
            : 'By continuing with Google, you agree to ShopSilo\'s Terms of Service and Privacy Policy.'}
        </p>

      </div>
    </AppLayout>
  );
};

export default RegisterScreen;
