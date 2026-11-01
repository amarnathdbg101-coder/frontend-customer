import React from 'react';
import { QrCode } from 'lucide-react';
import { BaseModal, ModalHeader, ModalBody, Button } from '../ui';
import { RealQRCode } from '../common/RealQRCode';

export const KhataQrCodeModal = ({ isOpen, onClose, user, isHindi }) => {
  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="400px">
      <ModalHeader
        title={isHindi ? 'मेरा डिजिटल खाता QR कोड' : 'My Khata QR Code'}
        subtitle={isHindi ? 'दुकान के काउंटर पर यह QR कोड दिखाकर पहचान कराएं' : 'Show this QR code at merchant counter for quick identification'}
        icon={QrCode}
        onClose={onClose}
      />
      <ModalBody padding="24px" style={{ textAlign: 'center' }}>
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '16px',
            borderRadius: '16px',
            display: 'inline-block',
            margin: '8px auto 16px auto',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          }}
        >
          <RealQRCode
            value={`SHOPSILO-CUSTOMER-KHATA:${user?.phone || user?.id || ''}`}
            size={200}
            logoText="KHATA"
            showDownload={true}
            downloadFilename={`my-khata-qr-${user?.phone || ''}`}
          />
        </div>

        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
          {user?.name || user?.full_name || 'Customer'}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          {user?.phone || 'Phone verified'}
        </div>

        <Button
          variant="secondary"
          fullWidth
          onClick={onClose}
          style={{ marginTop: '20px' }}
        >
          {isHindi ? 'बंद करें' : 'Close'}
        </Button>
      </ModalBody>
    </BaseModal>
  );
};

export default KhataQrCodeModal;

