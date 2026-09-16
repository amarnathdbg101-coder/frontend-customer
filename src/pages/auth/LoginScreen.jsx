import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, Phone, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { GoogleLoginButton } from '../../components/auth/GoogleLoginButton';
import { ThemeLanguageBar } from '../../components/common/ThemeLanguageBar';

export const LoginScreen = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t, isHindi } = useLanguage();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier || identifier.trim().length < 4) {
      setError(t('auth.invalid_phone'));
      return;
    }
    if (!password) {
      setError(t('auth.invalid_password'));
      return;
    }

    setLoading(true);
    try {
      await login({ identifier: identifier.trim(), password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || (isHindi ? 'लॉगिन विफल रहा' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo" style={{ margin: '0 auto 12px auto' }}>
            <Store size={28} />
          </div>
          <h2 className="auth-title">{t('auth.login_title')}</h2>
          <p className="auth-subtitle">{t('auth.login_subtitle')}</p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">{t('auth.phone_label')}</label>
            <div className="form-input-wrapper">
              <Phone size={18} className="form-input-icon" />
              <input
                type="text"
                className="form-input"
                placeholder={t('auth.phone_placeholder')}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">{t('auth.password_label')}</label>
              <Link to="/reset-password" style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                {t('auth.forgot_password')}
              </Link>
            </div>
            <div className="form-input-wrapper">
              <Lock size={18} className="form-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder={t('auth.password_placeholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="form-password-toggle"
                aria-label="Toggle password"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary auth-submit-btn"
          >
            {loading ? t('common.processing') : t('auth.login_button')}
          </button>
        </form>

        {/* Google OAuth & Register Switch */}
        <div style={{ marginTop: '20px' }}>
          <GoogleLoginButton onSuccess={() => navigate('/')} />
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
          <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
            {t('auth.dont_have_account')}
          </Link>
        </div>

        <div style={{ marginTop: '20px' }}>
          <ThemeLanguageBar compact={false} />
        </div>
      </div>
    </div>
  );
};
export default LoginScreen;
