import React from 'react';
import { X, QrCode, ShieldCheck, UserCheck, Smartphone } from 'lucide-react';
import { RealQRCode } from '../common/RealQRCode';
import { useAuth } from '../../context/AuthContext';

export const CustomerKhataQRModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  if (!isOpen || !user) return null;

  const phone = user.phone || '9876543210';
  const qrData = `shopme://customer/${phone}?id=${user.id}&name=${encodeURIComponent(user.name || 'Customer')}`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(6px)',
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
          borderRadius: '24px',
          width: '100%',
          maxWidth: '420px',
          padding: '1.75rem',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '6px', borderRadius: '8px' }}>
              <QrCode size={18} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>My Personal Khata QR</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Instant 1-Tap Dukandar Scan</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '20px', padding: '20px 16px', border: '2px solid #10b981', marginBottom: '1.25rem', color: '#0f172a' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#059669', padding: '3px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '8px' }}>
            <UserCheck size={13} /> VERIFIED CUSTOMER PASSBOOK
          </div>

          <h3 style={{ margin: '0 0 2px 0', fontSize: '1.25rem', fontWeight: 800 }}>
            {user.name || 'Customer'}
          </h3>
          <p style={{ margin: '0 0 14px 0', fontSize: '0.85rem', color: '#64748b' }}>
            Tel: <strong>{phone}</strong>
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <RealQRCode
              value={qrData}
              size={200}
              logoText="KHATA"
              showDownload={true}
              downloadFilename={`my-khata-qr-${phone}`}
            />
          </div>

          <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569' }}>
            Dukan counter par yeh QR dikhayein taaki dukandar bina phone number pooche aapka ledger open kar sakein.
          </p>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '11px',
            borderRadius: '12px',
            border: 'none',
            background: 'var(--color-primary, #3b82f6)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
};
