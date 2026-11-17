/**
 * Customer Login Screen - Pure 1-Tap Google Sign-In
 * Clean, modern, responsive, 100% localized (English & हिन्दी, zero passwords, zero forms)
 * Features:
 * - 1-Click Google Sign-In (Google Identity Services)
 * - Zero form filling & zero forgotten passwords
 * - Direct Language Selector
 * - Merchant Portal Link
 */

import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Store, Zap, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { sessionState } from '../../utils/sessionState';
import { useLanguage } from '../../context/LanguageContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { GoogleLoginButton } from '../../components/auth/GoogleLoginButton';
import { ShopSiloLogo } from '../../components/common/ShopSiloLogo';

export const LoginScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle } = useAuth();
  const { isHindi, setLanguage, t } = useLanguage();

  const [error, setError] = useState('');

  const handleGoogleSuccess = useCallback(async (idToken) => {
    setError('');
    try {
      const res = await loginWithGoogle(idToken);
      const user = res?.user || res?.data?.user;
      if (user && (user.role === 'merchant' || user.role === 'shop')) {
        setError(t('auth.role_merchant_notice'));
        return;
      }
      const targetRoute = sessionState.getRedirectAfterLogin() || location.state?.from?.pathname || '/';
      navigate(targetRoute, { replace: true });
    } catch (err) {
      setError(err.message || t('common.error'));
    }
  }, [loginWithGoogle, location, navigate, t]);

  return (
    <AppLayout title={t('app_name')} subtitle={t('auth.login_title')} hideNav={true}>
      <div style={{ paddingTop: '20px', maxWidth: '440px', margin: '0 auto', paddingBottom: '32px' }}>
        
        {/* Top Language Toggle Pill */}
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
            {isHindi ? 'ShopSilo में आपका स्वागत है' : 'Welcome to ShopSilo'}
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
            {isHindi 
              ? 'पासवर्ड याद रखने का झंझट खत्म। 1-क्लिक में Google से तुरंत लॉगिन करें।' 
              : 'No passwords to remember. 1-click instant secure login with Google.'}
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
                {isHindi ? '1-क्लिक तुरंत लॉगिन' : '1-Click Instant Sign-In'}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                {isHindi ? 'बिना कोई लंबा फॉर्म भरे सीधे शुरू करें' : 'Zero form filling or manual registration'}
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
                {isHindi ? 'पासवर्ड का झंझट खत्म' : 'Zero Password Hassle'}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                {isHindi ? 'पासवर्ड भूलने या रीसेट करने की कोई चिंता नहीं' : 'No forgotten passwords to reset or recover'}
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
                {isHindi ? '100% Google सुरक्षित' : 'Bank-Grade Google Security'}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                {isHindi ? 'Google द्वारा सुरक्षित और वेरिफाइड प्रोफ़ाइल' : 'Official Google Identity Services protection'}
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
            text="continue_with"
            onSuccess={handleGoogleSuccess}
            onError={(err) => setError(err.message || t('common.error'))}
          />
        </div>

        {/* Merchant Portal Direct Access Banner */}
        <div
          style={{
            marginTop: '16px',
            padding: '14px 16px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
            border: '1px solid rgba(79, 70, 229, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--color-primary, #4f46e5)' }}>
              🏪 {t('nav.merchant_link_title')}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isHindi ? 'दुकानदार लॉगिन हेतु मर्चेंट पोर्टल का उपयोग करें।' : 'For shop management & POS billing, use the Merchant App.'}
            </div>
          </div>
          <a
            href="https://merchant.shopsilo.in"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'var(--color-primary, #4f46e5)',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.76rem',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            {isHindi ? 'खोलें' : 'Open'}
          </a>
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

export default LoginScreen;
