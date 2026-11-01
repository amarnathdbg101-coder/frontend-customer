import React from 'react';
import { Calendar } from 'lucide-react';
import { BaseModal, ModalHeader, ModalBody, Button } from '../ui';

export const KhataPromiseToPayModal = ({
  isOpen,
  onClose,
  selectedKhata,
  ptpDate,
  setPtpDate,
  ptpNote,
  setPtpNote,
  ptpLoading,
  onSubmit,
  isHindi,
  t,
}) => {
  if (!isOpen || !selectedKhata) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="500px">
      <ModalHeader
        title={isHindi ? 'भुगतान का वादा (Promise to Pay)' : 'Promise to Pay'}
        subtitle={isHindi ? 'दुकानदार को सूचित करें कि आप कब तक बकाया भुगतान कर देंगे।' : 'Inform the merchant when you plan to settle your credit ledger.'}
        icon={Calendar}
        onClose={onClose}
      />
      <ModalBody padding="20px">
        {/* Quick Preset Chips */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {[
            { label: isHindi ? '3 दिन बाद' : 'In 3 Days', days: 3 },
            { label: isHindi ? '1 सप्ताह बाद' : 'In 1 Week', days: 7 },
            { label: isHindi ? '15 दिन बाद' : 'In 15 Days', days: 15 },
            { label: isHindi ? 'अगले माह 1 को' : 'Next Month 1st', days: 30 },
          ].map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                const d = new Date();
                d.setDate(d.getDate() + p.days);
                setPtpDate(d.toISOString().split('T')[0]);
              }}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.78rem' }}>
              {isHindi ? 'वादा तारीख' : 'Promise Date'}
            </label>
            <input
              type="date"
              required
              className="form-input"
              value={ptpDate}
              onChange={(e) => setPtpDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.78rem' }}>
              {isHindi ? 'संदेश (वैकल्पिक)' : 'Message for Merchant (Optional)'}
            </label>
            <input
              type="text"
              placeholder={isHindi ? "उदा: सैलरी आते ही भुगतान कर दूंगा" : "e.g. Will settle on salary day"}
              className="form-input"
              value={ptpNote}
              onChange={(e) => setPtpNote(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={ptpLoading}
              loading={ptpLoading}
            >
              {t('common.confirm') || 'Confirm'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              {t('common.cancel') || 'Cancel'}
            </Button>
          </div>
        </form>
      </ModalBody>
    </BaseModal>
  );
};

export default KhataPromiseToPayModal;

