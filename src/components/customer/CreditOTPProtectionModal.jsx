import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { customerKhataApi } from '../../api/khata.api';
import { useLanguage } from '../../context/LanguageContext';
import { BaseModal, ModalHeader, ModalBody, Button, AlertBanner } from '../ui';

export const CreditOTPProtectionModal = ({ isOpen, onClose, khataId, shopName, currentEnabled, onUpdated }) => {
  const { isHindi } = useLanguage();
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
      setError(err.response?.data?.message || err.message || (isHindi ? 'ओटीपी सुरक्षा अपडेट करने में त्रुटि।' : 'Failed to update OTP protection.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="460px">
      <ModalHeader
        title={isHindi ? 'उधारी ओटीपी सुरक्षा' : 'Credit OTP Protection'}
        icon={ShieldCheck}
        iconColor="#3b82f6"
        onClose={onClose}
      />
      <ModalBody padding="20px">
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 1rem 0' }}>
          {isHindi
            ? `जब यह सुरक्षा सक्रिय होगी, तब ${shopName || 'दुकानदार'} केवल 4-अंकीय ओटीपी सत्यापन के बाद ही उधारी दर्ज कर सकेंगे।`
            : `When active, ${shopName || 'the merchant'} can only add credit entries after you verify the secure 4-digit OTP.`}
        </p>

        <div
          style={{
            padding: '12px',
            borderRadius: '12px',
            background: enabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${enabled ? '#10b981' : '#ef4444'}`,
            marginBottom: '1.25rem',
          }}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: enabled ? '#059669' : '#dc2626' }}>
            {enabled
              ? (isHindi ? 'स्थिति: सुरक्षित (ओटीपी आवश्यक)' : 'Current Status: PROTECTED (OTP Required)')
              : (isHindi ? 'स्थिति: खुली (दुकानदार सीधे दर्ज कर सकते हैं)' : 'Current Status: UNLOCKED (Direct Entry Allowed)')}
          </span>
        </div>

        {error && <AlertBanner type="error" message={error} />}

        <Button
          variant={enabled ? 'danger' : 'success'}
          loading={loading}
          fullWidth={true}
          onClick={handleToggle}
        >
          {loading
            ? (isHindi ? 'अपडेट हो रहा है...' : 'Updating...')
            : enabled
              ? (isHindi ? 'सुरक्षा हटाएं' : 'Disable OTP Protection')
              : (isHindi ? 'ओटीपी सुरक्षा चालू करें (अनुशंसित)' : 'Enable OTP Protection (Recommended)')}
        </Button>
      </ModalBody>
    </BaseModal>
  );
};
export default CreditOTPProtectionModal;
