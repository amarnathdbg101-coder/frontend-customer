import React from 'react';
import { AlertCircle } from 'lucide-react';
import { BaseModal, ModalHeader, ModalBody, Button } from '../ui';

export const KhataDisputeModal = ({
  disputeTx,
  onClose,
  disputeReason,
  setDisputeReason,
  disputeLoading,
  onSubmit,
  isHindi,
  t,
}) => {
  if (!disputeTx) return null;

  return (
    <BaseModal isOpen={Boolean(disputeTx)} onClose={onClose} maxWidth="500px">
      <ModalHeader
        title={isHindi ? 'लेन-देन विवाद दर्ज करें' : 'Dispute Transaction'}
        subtitle={`Amount: ₹${disputeTx.amount} (${new Date(disputeTx.created_at).toLocaleDateString('en-IN')})`}
        icon={AlertCircle}
        iconColor="#ef4444"
        onClose={onClose}
      />
      <ModalBody padding="20px">
        {/* Quick Reason Chips */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {[
            isHindi ? 'सामान वापस कर दिया था' : 'Returned goods',
            isHindi ? 'रकम गलत जोड़ी गई' : 'Incorrect amount',
            isHindi ? 'नकद में पहले भुगतान कर दिया था' : 'Already paid in cash',
            isHindi ? 'मैंने यह सामान नहीं खरीदा' : 'Did not purchase this item',
          ].map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setDisputeReason(r)}
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
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.78rem' }}>
              {isHindi ? 'विवाद का कारण' : 'Reason for dispute'}
            </label>
            <textarea
              rows={3}
              required
              placeholder={isHindi ? "विवाद का कारण बताएं..." : "Explain why this transaction is incorrect..."}
              className="form-input"
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <Button
              type="submit"
              variant="danger"
              fullWidth
              disabled={disputeLoading || !disputeReason.trim()}
              loading={disputeLoading}
            >
              {isHindi ? 'विवाद दर्ज करें' : 'Submit Dispute'}
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

export default KhataDisputeModal;

