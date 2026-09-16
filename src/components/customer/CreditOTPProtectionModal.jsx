import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle } from 'lucide-react';
import { customerKhataApi } from '../../api/khata.api';

export const CreditOTPProtectionModal = ({ isOpen, onClose, khataId, shopName, currentEnabled, onUpdated }) => {
  const [enabled, setEnabled] = useState(currentEnabled ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleToggle = async () => {
    try {
      setLoading(true);
      setError('');
      const targetState = !enabled;
      await customerKhataApi.setCreditOTPProtection(khataId, targetState);
      setEnabled(targetState);
      if (onUpdated) onUpdated(targetState);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'OTP protection update karne me error.');
    } finally {
      setLoading(false);
    }
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
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-surface, #1e293b)',
          border: '1px solid var(--border-subtle, #334155)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '460px',
          padding: '1.5rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} color="#3b82f6" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>Credit OTP Protection</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 1rem 0' }}>
          Jab yeh feature ON hoga, tab <strong>{shopName}</strong> aapke naam par koi naya Udhar tabhi add kar sakenge jab aap unhe SMS/App me aaya 4-digit OTP bataenge.
        </p>

        <div style={{ padding: '12px', borderRadius: '12px', background: enabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${enabled ? '#22c55e' : '#ef4444'}`, marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: enabled ? '#22c55e' : '#ef4444' }}>
            Current Status: {enabled ? 'PROTECTED (OTP Required)' : 'UNLOCKED (Dukandar Direct Add Kar Sakte Hain)'}
          </span>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleToggle}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            background: enabled ? '#ef4444' : '#22c55e',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Updating...' : enabled ? 'Disable OTP Protection' : 'Enable OTP Protection (Recommended)'}
        </button>
      </div>
    </div>
  );
};
