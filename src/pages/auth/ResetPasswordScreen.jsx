/**
 * Customer Reset Password Screen
 * 100% localized (English & हिन्दी, zero Hinglish)
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import { useLanguage } from '../../context/LanguageContext';
import { AppLayout } from '../../components/layout/AppLayout';

export const ResetPasswordScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { isHindi, setLanguage, t } = useLanguage();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError(t('auth.reset_token_missing'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('auth.invalid_password'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('auth.passwords_mismatch'));
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(token, newPassword);
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title={t('app_name')} subtitle={t('auth.reset_password_title')} hideNav={true} showBack={true}>
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
            <ShieldCheck size={36} />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
            {t('auth.reset_password_title')}
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
            {t('auth.reset_password_subtitle')}
          </p>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div
            style={{
              textAlign: 'center',
              padding: '24px',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            <CheckCircle2 size={48} color="#22c55e" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {t('auth.reset_success_title')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
              {t('auth.reset_success_subtitle')}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary btn-block btn-lg"
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {t('auth.back_to_login')} <ArrowRight size={18} />
              </span>
            </button>
          </div>
        ) : (
          <>
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

            {!token && (
              <div
                style={{
                  backgroundColor: 'rgba(234, 179, 8, 0.1)',
                  color: '#eab308',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.84rem',
                  marginBottom: '20px',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  lineHeight: 1.4,
                }}
              >
                ⚠️ {t('auth.reset_token_missing')}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">{t('auth.new_password_label')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="form-input"
                    style={{ paddingRight: '40px' }}
                    placeholder={t('auth.new_password_placeholder')}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">{t('auth.confirm_new_password_label')}</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input"
                  placeholder={t('auth.confirm_new_password_placeholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={loading || !token}
                style={{ marginTop: '8px' }}
              >
                {loading ? t('auth.waiting') : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    {t('common.save')} <ArrowRight size={18} />
                  </span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default ResetPasswordScreen;
