/**
 * Customer Registration Screen
 * 100% localized (English & हिन्दी, zero Hinglish)
 * Features:
 * - Direct Language Selector
 * - Clean customer role registration
 * - Google Sign-In
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { GoogleLoginButton } from '../../components/auth/GoogleLoginButton';

export const RegisterScreen = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const { isHindi, setLanguage, t } = useLanguage();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.phone && formData.phone.length < 10) {
      setError(t('auth.invalid_phone'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.invalid_password'));
      return;
    }

    setLoading(true);

    try {
      await register({ ...formData, role: 'customer' });
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
      await loginWithGoogle(idToken);
      navigate('/');
    } catch (err) {
      setError(err.message || t('common.error'));
    }
  };

  return (
    <AppLayout title={t('app_name')} subtitle={t('auth.register_title')} hideNav={true} showBack={true}>
      <div style={{ paddingTop: '10px', maxWidth: '440px', margin: '0 auto' }}>
        
        {/* Top Language Toggle Pill */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
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

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px auto',
            }}
          >
            <UserPlus size={30} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
            {t('auth.register_title')}
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
            {t('auth.register_subtitle')}
          </p>
        </div>

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

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">{t('auth.full_name_label')}</label>
            <input
              type="text"
              name="full_name"
              required
              className="form-input"
              placeholder={t('auth.full_name_placeholder')}
              value={formData.full_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">{t('auth.phone_label')}</label>
            <input
              type="tel"
              name="phone"
              required
              className="form-input"
              placeholder={t('auth.phone_placeholder')}
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">{t('auth.email_label')}</label>
            <input
              type="email"
              name="email"
              required
              className="form-input"
              placeholder={t('auth.email_placeholder')}
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">{t('auth.password_label')}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={6}
                className="form-input"
                style={{ paddingRight: '40px' }}
                placeholder={t('auth.password_placeholder')}
                value={formData.password}
                onChange={handleChange}
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
            {loading ? t('auth.account_creating') : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {t('auth.register_button')} <ArrowRight size={18} />
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

        {/* Google Sign-In */}
        <GoogleLoginButton
          text="signup_with"
          onSuccess={handleGoogleSuccess}
          onError={(err) => setError(err.message || t('common.error'))}
        />

        {/* Already have account */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{t('auth.already_have_account')} </span>
          <Link
            to="/login"
            style={{
              color: 'var(--color-primary)',
              fontWeight: 700,
              textDecoration: 'none',
              marginLeft: '4px',
            }}
          >
            {t('nav.login')}
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default RegisterScreen;
