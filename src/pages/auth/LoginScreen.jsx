/**
 * Login Screen
 * 
 * Hinglish Hint:
 * Customer ke liye fast mobile & desktop login page:
 * - Email / Mobile & Password validation
 * - 1-Click Google Sign-In via Google Identity Services
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ArrowRight, AlertCircle, Eye, EyeOff, X, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth.api';
import { AppLayout } from '../../components/layout/AppLayout';
import { GoogleLoginButton } from '../../components/auth/GoogleLoginButton';

export const LoginScreen = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

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
      await login(identifier.trim(), password);
      // Customer app: Navigate directly to Explore Shops
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login asafal raha, kripya check karein');
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
      setError(err.message || 'Google login asafal raha, kripya dobara koshish karein.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMsg('');
    setForgotLoading(true);

    try {
      const res = await authApi.forgotPassword(forgotEmail.trim());
      setForgotMsg(res.message || 'Agar ye email registered hai, toh password reset link bhej di gayi hai.');
    } catch (err) {
      setForgotError(err.message || 'Request bhejte waqt problem aayi. Dobara koshish karein.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <AppLayout title="ShopSilo" subtitle="Apni Dukan Ka Smart App" hideNav={true}>
      <div style={{ paddingTop: '20px' }}>
        {/* Brand Banner */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Welcome Back!
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Apne account me login karke shopping karein
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            style={{
              backgroundColor: 'var(--color-danger-light)',
              color: 'var(--color-danger)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email ya Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Email ya 10-digit mobile number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
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
                Password bhool gaye?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input"
                style={{ paddingRight: '40px' }}
                placeholder="••••••••"
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
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
            style={{ marginTop: '12px' }}
          >
            {loading ? 'Kripya intezaar karein...' : (
              <>
                Login Karein <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color, #e2e8f0)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color, #e2e8f0)' }} />
        </div>

        {/* Google Sign-In Button */}
        <GoogleLoginButton
          text="continue_with"
          onSuccess={handleGoogleSuccess}
          onError={(err) => setError(err.message || 'Google login asafal raha')}
        />

        {/* Switch to Register */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Naya khata banana hai? </span>
          <Link
            to="/register"
            style={{
              color: 'var(--color-primary)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Yahan Register Karein
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
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-primary)' }}>
              🏪 क्या आप दुकानदार (Merchant) हैं?
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              POS बिलिंग व दुकान डैशबोर्ड के लिए मर्चेंट पोर्टल पर लॉगिन करें।
            </div>
          </div>
          <a
            href="https://shop.shopsilo.in/login"
            className="btn btn-sm btn-primary"
            style={{
              whiteSpace: 'nowrap',
              textDecoration: 'none',
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 800,
              borderRadius: 'var(--radius-full)',
            }}
          >
            मर्चेंट लॉगिन 👉
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
                  Password Reset Link Mangwayein
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
                    Theek Hai, Samajh Gaya
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.4 }}>
                    Apna registered email address dalein. Hum aapko password reset karne ka link bhejenge.
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
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      required
                      className="form-input"
                      placeholder="aapka@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? 'Bhej rahe hain...' : (
                      <>
                        Reset Link Bhejein <Send size={16} style={{ marginLeft: '6px' }} />
                      </>
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
