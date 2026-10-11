import React from 'react';
import { QrCode, CheckCircle2 } from 'lucide-react';
import { RealQRCode } from '../common/RealQRCode';
import { useLanguage } from '../../context/LanguageContext';
import { BaseModal, ModalHeader, ModalBody, Button } from '../ui';

export const CustomerKhataQRModal = ({ isOpen, onClose, customerPhone, customerName }) => {
  const { isHindi } = useLanguage();
  if (!isOpen) return null;

  const khataPayload = JSON.stringify({
    type: 'shopsilo_customer_khata',
    phone: customerPhone,
    name: customerName || 'Verified Customer',
    version: '1.0',
  });

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="440px">
      <ModalHeader
        title={isHindi ? 'मेरा खाता पासबुक क्यूआर' : 'My Khata Passbook QR'}
        subtitle={customerName || 'Customer ID'}
        icon={QrCode}
        onClose={onClose}
      />
      <ModalBody padding="24px" style={{ textAlign: 'center' }}>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          {isHindi
            ? 'दुकानदार से कहें कि वे अपने शॉप ऐप से इस क्यूआर को स्कैन करें ताकि आपका खाता तुरंत लिंक हो सके।'
            : 'Show this QR code to the merchant to instantly link transactions to your Digital Khata passbook.'}
        </p>

        <div
          style={{
            background: 'white',
            padding: '16px',
            borderRadius: '16px',
            display: 'inline-block',
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
            marginBottom: '1rem',
          }}
        >
          <RealQRCode
            value={khataPayload}
            size={220}
            level="H"
            includeMargin={true}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', color: '#10b981', fontWeight: 700, marginBottom: '1.25rem' }}>
          <CheckCircle2 size={16} />
          <span>{isHindi ? 'सुरक्षित एवं सत्यापित ग्राहक पहचान' : 'Secure Verified Customer Token'}</span>
        </div>

        <Button variant="primary" fullWidth={true} onClick={onClose}>
          {isHindi ? 'पूर्ण' : 'Done'}
        </Button>
      </ModalBody>
    </BaseModal>
  );
};
export default CustomerKhataQRModal;
