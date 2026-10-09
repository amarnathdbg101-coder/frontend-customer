/**
 * Customer Login Screen
 * Clean, modern, responsive, 100% localized (English & हिन्दी, zero Hinglish)
 * Features:
 * - Phone / Email & Password authentication
 * - 1-Click Google Sign-In
 * - Direct Language Selector
 * - Merchant boundary guard
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ArrowRight, AlertCircle, Eye, EyeOff, X, Send, CheckCircle2, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { authApi } from '../../api/auth.api';
import { AppLayout } from '../../components/layout/AppLayout';
import { GoogleLoginButton } from '../../components/auth/GoogleLoginButton';

export const LoginScreen = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const { isHindi, setLanguage, t } = useLanguage();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(identifier.trim(), password);
      const user = res?.user || res?.data?.user;
      if (user && (user.role === 'merchant' || user.role === 'shop')) {
        setError(t('auth.role_merchant_notice'));
        return;
      }
      navigate('/');
    } catch (err) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    setError('');
    try {
      const res = await loginWithGoogle(idToken);
      const user = res?.user || res?.data?.user;
      if (user && (user.role === 'merchant' || user.role === 'shop')) {
        setError(t('auth.role_merchant_notice'));
        return;
      }
      navigate('/');
    } catch (err) {
      setError(err.message || t('common.error'));
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMsg('');
    setForgotLoading(true);

    try {
      const res = await authApi.forgotPassword(forgotEmail.trim());
      setForgotMsg(res.message || t('auth.reset_link_sent'));
    } catch (err) {
      setForgotError(err.message || t('common.error'));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <AppLayout title={t('app_name')} subtitle={t('auth.login_title')} hideNav={true}>
      <div style={{ paddingTop: '16px', maxWidth: '440px', margin: '0 auto' }}>
        
        {/* Top Language Toggle Pill */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <div
            style={{
              display: 'inline-flex',
              background: 'var(--bg-surface-subtle, rgba(255,255,255,0.06))',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
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
                background: isHindi ? 'var(--color-primary)' : 'transparent',
                color: isHindi ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.78rem',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
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
                background: !isHindi ? 'var(--color-primary)' : 'transparent',
                color: !isHindi ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.78rem',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
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
          <div
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
            }}
          >
            <Store size={36} />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
            {t('auth.login_title')}
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
            {t('auth.login_subtitle')}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            style={{
              backgroundColor: 'var(--color-danger-light)',
              color: 'var(--color-danger)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">{t('auth.phone_label')}</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder={t('auth.phone_placeholder')}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>{t('auth.password_label')}</label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(identifier.includes('@') ? identifier : '');
                  setForgotMsg('');
                  setForgotError('');
                  setShowForgotModal(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {t('auth.forgot_password')}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input"
                style={{ paddingRight: '40px' }}
                placeholder={t('auth.password_placeholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            {loading ? t('auth.waiting') : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {t('auth.login_button')} <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color, #e2e8f0)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
            {t('auth.or_continue_with')}
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color, #e2e8f0)' }} />
        </div>

        {/* Google Sign-In Button */}
        <GoogleLoginButton
          text="continue_with"
          onSuccess={handleGoogleSuccess}
          onError={(err) => setError(err.message || t('common.error'))}
        />

        {/* Switch to Register */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{t('auth.register_cta_question')} </span>
          <Link
            to="/register"
            style={{
              color: 'var(--color-primary)',
              fontWeight: 700,
              textDecoration: 'none',
              marginLeft: '4px',
            }}
          >
            {t('auth.register_cta_link')}
          </Link>
        </div>

        {/* Merchant Portal Direct Access Banner */}
        <div
          style={{
            marginTop: '24px',
            padding: '14px 16px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
            border: '1px solid rgba(79, 70, 229, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--color-primary)' }}>
              🏪 {t('nav.merchant_link_title')}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isHindi ? 'दुकानदार लॉगिन हेतु मर्चेंट पोर्टल का उपयोग करें।' : 'For shop management & POS billing, use the Merchant App.'}
            </div>
          </div>
          <a
            href="https://shop.shopsilo.in/login"
            className="btn btn-sm btn-primary"
            style={{
              whiteSpace: 'nowrap',
              textDecoration: 'none',
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 800,
              borderRadius: 'var(--radius-full)',
            }}
          >
            {t('nav.merchant_link_action')} 👉
          </a>
        </div>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--color-surface, #1e293b)',
                color: 'var(--text-primary, #ffffff)',
                borderRadius: 'var(--radius-lg, 16px)',
                padding: '24px',
                width: '100%',
                maxWidth: '400px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                  {t('auth.forgot_password_title')}
                </h3>
                <button
                  onClick={() => setShowForgotModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted, #94a3b8)',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {forgotMsg ? (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <CheckCircle2 size={42} color="#22c55e" style={{ margin: '0 auto 10px auto' }} />
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                    {forgotMsg}
                  </p>
                  <button
                    onClick={() => setShowForgotModal(false)}
                    className="btn btn-primary btn-block"
                  >
                    {t('auth.understood')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.4 }}>
                    {t('auth.forgot_password_desc')}
                  </p>

                  {forgotError && (
                    <div
                      style={{
                        backgroundColor: 'var(--color-danger-light)',
                        color: 'var(--color-danger)',
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.82rem',
                        marginBottom: '12px',
                      }}
                    >
                      {forgotError}
                    </div>
                  )}

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">{t('auth.email_label')}</label>
                    <input
                      type="email"
                      required
                      className="form-input"
                      placeholder={t('auth.email_placeholder')}
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? t('auth.sending') : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {t('auth.send_reset_link')} <Send size={16} />
                      </span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default LoginScreen;
