import React from 'react';
import { Shield } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { BaseModal, ModalHeader, ModalBody } from '../ui';

export const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  const { isHindi } = useLanguage();
  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="540px">
      <ModalHeader
        title={isHindi ? 'गोपनीयता नीति एवं नियम' : 'Privacy Policy & Terms'}
        icon={Shield}
        iconColor="#10b981"
        onClose={onClose}
      />
      <ModalBody padding="20px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: 700 }}>
              {isHindi ? '1. डेटा सुरक्षा एवं गोपनीयता' : '1. Data Protection & Security'}
            </h4>
            <p style={{ margin: 0 }}>
              {isHindi
                ? 'ShopSilo आपकी गोपनीयता का सम्मान करता है। आपका फोन नंबर, नाम और पता केवल स्थानीय दुकानदारों के साथ इन-स्टोर पिकअप और डिजिटल खाता पासबुक के लिए ही उपयोग किया जाता है।'
                : 'ShopSilo values your privacy. Your phone number, name, and address are strictly used for in-store pickup reservations and Digital Khata records with local shopkeepers.'}
            </p>
          </div>

          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: 700 }}>
              {isHindi ? '2. डिजिटल खाता बही अधिकार' : '2. Digital Khata Passbook Rights'}
            </h4>
            <p style={{ margin: 0 }}>
              {isHindi
                ? 'दुकानदार द्वारा दर्ज किया गया प्रत्येक लेन-देन आपकी ग्राहक पासबुक में तुरंत देखा जा सकता है। आप किसी भी गलत प्रविष्टि पर आपत्ति दर्ज कर सकते हैं अथवा ओटीपी सुरक्षा सक्रिय कर सकते हैं।'
                : 'Every credit or payment transaction recorded by a merchant can be viewed instantly in your customer ledger passbook. You retain the right to dispute any incorrect transaction or enable Credit OTP Protection.'}
            </p>
          </div>

          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)', fontSize: '0.92rem', fontWeight: 700 }}>
              {isHindi ? '3. IT Rules 2021 शिकायत निवारण' : '3. IT Rules 2021 Grievance Redressal'}
            </h4>
            <p style={{ margin: 0 }}>
              {isHindi
                ? 'सूचना प्रौद्योगिकी (मध्यवर्ती दिशानिर्देश और डिजिटल मीडिया आचार संहिता) नियम, 2021 के अनुसार, ग्राहक किसी भी फर्जी दुकान या गलत मूल्य की रिपोर्ट सीधे हमारे शिकायत अधिकारी को कर सकते हैं।'
                : 'In accordance with IT Rules 2021, customers can report fake stores, incorrect prices, or counterfeit products directly to our Grievance Officer.'}
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface-subtle)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Last updated: September 2026 | ShopSilo Hyperlocal Commerce Network
            </span>
          </div>
        </div>
      </ModalBody>
    </BaseModal>
  );
};
export default PrivacyPolicyModal;
