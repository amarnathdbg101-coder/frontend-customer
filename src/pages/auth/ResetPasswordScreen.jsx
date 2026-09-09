import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import { AppLayout } from '../../components/layout/AppLayout';

export const ResetPasswordScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

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
      setError('Password reset link invalid ya expire ho chuki hai. Kripya naya link mangwayein.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password kam se kam 6 characters ka hona chahiye.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Dono password aapas me match nahi kar rahe hain.');
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(token, newPassword);
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || 'Password reset asafal raha. Ho sakta hai token expire ho gaya ho.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="ShopMe" subtitle="Reset Password" hideNav={true}>
      <div style={{ paddingTop: '20px' }}>
        {/* Banner */}
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
            <ShieldCheck size={36} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Naya Password Banayein
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Apne account ke liye ek surakshit aur mazboot password chunein
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
              Password Kamyabi Se Badal Gaya!
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Aapka naya password save ho gaya hai. Ab aap naye password se login kar sakte hain.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary btn-block btn-lg"
            >
              Ab Login Karein <ArrowRight size={18} />
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
                  padding: '12px',
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
                  fontSize: '0.85rem',
                  marginBottom: '20px',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                }}
              >
                ⚠️ Reset token missing hai. Agar aapne forgot password request kiya tha, toh link me diya gaya poora URL paste karein.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Naya Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="form-input"
                    style={{ paddingRight: '40px' }}
                    placeholder="Kam se kam 6 akshar"
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
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Naya Password Dobara Dalein (Confirm)</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input"
                  placeholder="Dobara wahi password dalein"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={loading || !token}
                style={{ marginTop: '12px' }}
              >
                {loading ? 'Kripya intezaar karein...' : (
                  <>
                    Password Update Karein <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem' }}>
              <Link
                to="/login"
                style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                }}
              >
                ← Wapas Login Par Jayein
              </Link>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};
