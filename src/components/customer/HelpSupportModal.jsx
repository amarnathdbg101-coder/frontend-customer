import React, { useState } from 'react';
import { X, HelpCircle, Phone, MessageCircle, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

const FAQS = [
  {
    q: 'Counter Pickup Reservation kaise kaam karta hai?',
    a: 'App me kisi bhi dukan ka item dekh kar "Hold / Reserve" karein. Aapko 4-digit pickup OTP milega. Dukan par jakar OTP dikhayein aur bina kisi wait ke item le lein.'
  },
  {
    q: 'Digital Khata Udhar Passbook kya hai?',
    a: 'Aap jis dukan se regular samaan lete hain, unka digital udhar ledger aapke Khata tab me dikhta hai. Aap transaction history dekh sakte hain, dispute raise kar sakte hain aur direct UPI se pay kar sakte hain.'
  },
  {
    q: 'Bargaining (Bhav-Taav) kaise karein?',
    a: 'Product detail page par "Bhav-Taav Karein" button dabayein. AI instant aapke offer ko calculate karke dukan ke allowed margin ke hisaab se accept ya counter-offer karta hai.'
  },
  {
    q: 'Agar dukan par galat bill ban gaya to kya karein?',
    a: 'Khata passbook me transaction ke samne "Dispute" button dabayein aur reason likhein. Dukaandaar ko instant notification jayegi.'
  }
];

export const HelpSupportModal = ({ isOpen, onClose }) => {
  const [openFaq, setOpenFaq] = useState(null);

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
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.5rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '8px', borderRadius: '10px' }}>
              <HelpCircle size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>Customer Support &amp; Help Desk</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>24x7 Assistant for ShopMe Shoppers</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <a
            href="https://wa.me/919876543210?text=Namaste%20ShopMe%20Support%20mujhe%20madad%20chahiye"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: '#25D366',
              color: 'white',
              padding: '10px 14px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            <MessageCircle size={16} />
            WhatsApp Help
          </a>

          <a
            href="tel:+919876543210"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'var(--color-primary, #3b82f6)',
              color: 'white',
              padding: '10px 14px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            <Phone size={16} />
            Call Helpline
          </a>
        </div>

        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Frequently Asked Questions</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid var(--border-subtle, #334155)',
                borderRadius: '12px',
                background: 'var(--bg-surface-subtle, #0f172a)',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                style={{
                  width: '100%',
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openFaq === idx && (
                <div style={{ padding: '0 12px 12px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '10px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <ShieldCheck size={16} color="#3b82f6" />
          <span>Grievance Officer: support@shopme.in | IT Rules 2021 Compliance</span>
        </div>
      </div>
    </div>
  );
};
