import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { reportApi } from '../../api/report.api';

const REASONS = [
  'Misleading Price / Quality',
  'Fake / Inactive Store',
  'Counterfeit Item',
  'Refused Counter OTP',
  'Offensive / Prohibited Content',
];

export const ReportModal = ({ isOpen, onClose, targetType = 'shop', targetId, targetName }) => {
  const [reason, setReason] = useState(REASONS[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Kripya brief details likhein.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await reportApi.submitReport({
        target_type: targetType,
        target_id: String(targetId),
        reason,
        description: description.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Report submit karne me dikkat aayi.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: 'var(--bg-surface, #1e293b)',
          border: '1px solid var(--border-subtle, #334155)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '480px',
          padding: '1.5rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} color="#ef4444" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
              Report {targetType === 'shop' ? 'Store' : 'Product'}
            </h3>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <CheckCircle2 size={42} color="#22c55e" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>Report Submitted</h4>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Shukriya. Hamari safety desk is report ko IT Rules 2021 ke tehat 24 ghante me review karegi.
            </p>
            <button
              onClick={handleClose}
              style={{
                padding: '8px 20px',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--color-primary, #3b82f6)',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Reporting: <strong>{targetName || targetId}</strong>
            </p>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                Select Issue Category
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                Complaint Description *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Problem ki detail likhein taaki safety team jald action le sake..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  resize: 'none',
                }}
                required
              />
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.85rem' }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: '#ef4444',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Submitting Report...' : 'Submit Grievance Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
