import React from 'react';
import { BaseModal, ModalHeader, ModalBody } from '../ui';

export const KhataParchiViewerModal = ({ isOpen, onClose, viewParchiUrl, isHindi }) => {
  if (!isOpen || !viewParchiUrl) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="90vw"
      maxHeight="85vh"
    >
      <ModalHeader
        title={isHindi ? 'भौतिक पर्ची / रसीद' : 'Physical Parchi / Receipt'}
        onClose={onClose}
      />
      <ModalBody padding="8px" style={{ backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          loading="lazy"
          decoding="async"
          src={viewParchiUrl}
          alt="Physical Parchi Slip"
          style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', display: 'block' }}
        />
      </ModalBody>
    </BaseModal>
  );
};

export default KhataParchiViewerModal;

