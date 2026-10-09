import React, { useState } from 'react';
import { X, HelpCircle, Phone, MessageCircle, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const HelpSupportModal = ({ isOpen, onClose }) => {
  const [openFaq, setOpenFaq] = useState(null);
  const { isHindi, t } = useLanguage();

  if (!isOpen) return null;

  const faqs = [
    {
      q: isHindi ? 'काउंटर पिकअप रिजर्वेशन कैसे काम करता है?' : 'How does counter pickup reservation work?',
      a: isHindi ? 'ऐप में किसी भी दुकान का सामान देखकर "बुक / रिज़र्व" करें। आपको 4-अंकों का पिकअप टोकन मिलेगा। दुकान पर जाकर टोकन दिखाएं और बिना प्रतीक्षा सामान प्राप्त करें।' : 'Reserve any product in the app. You receive a verified 4-digit pickup token to show at the store counter for zero-wait collection.'
    },
    {
      q: isHindi ? 'डिजिटल खाता बही क्या है?' : 'What is the Digital Khata Ledger?',
      a: isHindi ? 'नियमित स्थानीय दुकानों से आपका संपूर्ण उधारी व भुगतान रिकॉर्ड खाता अनुभाग में पारदर्शी रूप से उपलब्ध रहता है। आप रसीद देख सकते हैं, आपत्ति दर्ज कर सकते हैं अथवा यूपीआई से भुगतान कर सकते हैं।' : 'A real-time, transparent ledger of credit balances with neighborhood merchants. View receipts, raise disputes, or settle balances via UPI.'
    },
    {
      q: t('help_support.q_bargain'),
      a: t('help_support.a_bargain')
    },
    {
      q: t('help_support.q_wrong_bill'),
      a: t('help_support.a_wrong_bill')
    }
  ];

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
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                {t('help_support.title')}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {isHindi ? 'शॉपसिलो ग्राहकों हेतु 24x7 सहायता' : '24x7 Assistant for ShopSilo Shoppers'}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <a
            href="https://wa.me/919876543210"
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
            {t('help_support.chat_support')}
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
            {t('help_support.call_support')}
          </a>
        </div>

        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          {t('help_support.faq_title')}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {faqs.map((faq, idx) => (
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
          <span>Grievance Officer: grievance@shopsilo.in | IT Rules 2021 Compliance</span>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportModal;
