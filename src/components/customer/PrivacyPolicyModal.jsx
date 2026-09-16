import React from 'react';
import { X, Shield } from 'lucide-react';

export const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

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
          maxWidth: '540px',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '1.5rem',
          color: 'var(--text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '8px', borderRadius: '10px' }}>
              <Shield size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Privacy Policy &amp; Terms</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)', fontSize: '0.9rem' }}>1. Data Protection &amp; Security</h4>
            <p style={{ margin: 0 }}>
              ShopMe values your privacy. Your phone number, name, and address are strictly used for in-store pickup reservations and Digital Khata records with local shopkeepers.
            </p>
          </div>

          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)', fontSize: '0.9rem' }}>2. Digital Khata Passbook Rights</h4>
            <p style={{ margin: 0 }}>
              Every Udhar or Jama transaction recorded by a shopkeeper can be viewed instantly in your customer passbook. You retain the right to dispute any incorrect transaction or enable Credit OTP Protection.
            </p>
          </div>

          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)', fontSize: '0.9rem' }}>3. IT Rules 2021 Grievance Redressal</h4>
            <p style={{ margin: 0 }}>
              In accordance with Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, customers can report fake stores, incorrect prices, or counterfeit products directly to our Grievance Officer.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Last updated: September 2026 | ShopMe Hyperlocal Commerce Network
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
