import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { BaseModal, ModalHeader, ModalBody, Button } from '../ui';

export const HelpSupportModal = ({ isOpen, onClose }) => {
  const { isHindi, t } = useLanguage();
  const [openFaq, setOpenFaq] = useState(null);

  if (!isOpen) return null;

  const faqs = [
    {
      q: isHindi ? 'काउंटर पिकअप कैसे काम करता है?' : 'How does 30-Min Counter Pickup work?',
      a: isHindi
        ? 'दुकान से सामान चुनें, होल्ड अवधि तय करें और 4-अंकीय पिकअप कोड के साथ दुकान पर जाकर सीधे भुगतान व सामान प्राप्त करें। लाइन में खड़े रहने की आवश्यकता नहीं।'
        : 'Choose items online, reserve a hold window, and pick up directly at the counter using your secure 4-digit pickup code. No queues, instant hand-off.'
    },
    {
      q: isHindi ? 'डिजिटल खाता बही क्या है?' : 'What is the Digital Khata Ledger?',
      a: isHindi
        ? 'नियमित स्थानीय दुकानों से आपका संपूर्ण उधारी व भुगतान रिकॉर्ड खाता अनुभाग में पारदर्शी रूप से उपलब्ध रहता है। आप रसीद देख सकते हैं, आपत्ति दर्ज कर सकते हैं अथवा यूपीआई से भुगतान कर सकते हैं।'
        : 'A real-time, transparent ledger of credit balances with neighborhood merchants. View receipts, raise disputes, or settle balances via UPI.'
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
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="540px">
      <ModalHeader
        title={t('help_support.title')}
        subtitle={t('help_support.subtitle')}
        icon={HelpCircle}
        onClose={onClose}
      />
      <ModalBody padding="20px">
        {/* Quick Contact Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.25rem' }}>
          <Button
            variant="whatsapp"
            icon={MessageCircle}
            onClick={() => window.open('https://wa.me/919876543210?text=Hello%20ShopSilo%20Support', '_blank')}
          >
            {isHindi ? 'व्हाट्सएप सहायता' : 'WhatsApp Desk'}
          </Button>

          <Button
            variant="secondary"
            icon={Phone}
            onClick={() => window.open('tel:18001234567')}
          >
            {isHindi ? 'हेल्पलाइन कॉल' : 'Toll-Free Call'}
          </Button>
        </div>

        {/* FAQs Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {isHindi ? 'अक्सर पूछे जाने वाले सवाल (FAQs)' : 'Frequently Asked Questions'}
          </span>

          {faqs.map((faq, idx) => (
            <div
              key={idx}
              style={{
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-subtle)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
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
      </ModalBody>
    </BaseModal>
  );
};

export default HelpSupportModal;
