import React from 'react';
import { HelpCircle, MessageCircle } from 'lucide-react';
import { BaseModal, ModalHeader, ModalBody, Button } from '../ui';

export const KhataDisputeModal = ({
  disputeTx,
  onClose,
  disputeReason,
  setDisputeReason,
  disputeLoading,
  onSubmit,
  shopName,
  shopPhone,
  isHindi,
  t,
}) => {
  if (!disputeTx) return null;

  const handleWhatsAppClarify = () => {
    const raw = (shopPhone || '').replace(/\D/g, '');
    const cleanPhone = raw.startsWith('91') && raw.length === 12 ? raw : (raw.length === 10 ? `91${raw}` : raw);
    const dateStr = new Date(disputeTx.created_at).toLocaleDateString('en-IN');
    const note = disputeReason ? ` (${disputeReason})` : '';
    const text = isHindi
      ? `नमस्ते ${shopName || 'दुकानदार जी'}, मेरे खाते में ₹${disputeTx.amount} की एंट्री (${dateStr}) के संबंध में बात करनी थी${note}। कृपया चेक कर लें।`
      : `Hello ${shopName || 'Shopkeeper'}, regarding the ₹${disputeTx.amount} entry on ${dateStr}${note}. Could you please verify?`;

    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <BaseModal isOpen={Boolean(disputeTx)} onClose={onClose} maxWidth="500px">
      <ModalHeader
        title={isHindi ? 'दुकानदार से पुष्टि करें' : 'Clarify Entry with Dukandar'}
        subtitle={`Amount: ₹${disputeTx.amount} • (${new Date(disputeTx.created_at).toLocaleDateString('en-IN')})`}
        icon={HelpCircle}
        iconColor="#6366f1"
        onClose={onClose}
      />
      <ModalBody padding="20px">
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
          {isHindi
            ? 'अगर इस बिल या उधारी की रकम में कोई शंका है, तो सीधे दुकानदार को WhatsApp पर संदेश भेजें या नीचे अपना संदेश लिखकर भेजें।'
            : 'If you have any discrepancy regarding this entry, message the shopkeeper on WhatsApp or leave a clarification note below.'}
        </p>

        {/* Quick Reason Chips */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {[
            isHindi ? 'सामान वापस कर दिया था' : 'Returned goods',
            isHindi ? 'रकम में शंका है' : 'Check amount',
            isHindi ? 'नकद में पहले भुगतान कर दिया था' : 'Already paid in cash',
            isHindi ? 'बिल की पर्ची चेक कर लें' : 'Please verify parchi',
          ].map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setDisputeReason(r)}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: disputeReason === r ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-surface-subtle)',
                border: disputeReason === r ? '1px solid #6366f1' : '1px solid var(--border-subtle)',
                color: disputeReason === r ? '#4f46e5' : 'var(--text-primary)',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
              {isHindi ? 'अपनी बात या स्पष्टीकरण लिखें' : 'Clarification note / reason'}
            </label>
            <textarea
              rows={3}
              required
              placeholder={isHindi ? "दुकानदार के लिए संदेश लिखें..." : "Explain your query to the shopkeeper..."}
              className="form-input"
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={disputeLoading || !disputeReason.trim()}
                loading={disputeLoading}
              >
                {isHindi ? 'दुकानदार को अनुरोध भेजें' : 'Send Clarification Note'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                {t('common.cancel') || 'Cancel'}
              </Button>
            </div>

            {/* Direct WhatsApp Clarification Button */}
            <button
              type="button"
              onClick={handleWhatsAppClarify}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '9px 14px',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: '#25D366',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(37, 211, 102, 0.25)',
              }}
            >
              <MessageCircle size={16} />
              {isHindi ? 'दुकानदार को WhatsApp पर पूछें' : 'Ask Shopkeeper on WhatsApp'}
            </button>
          </div>
        </form>
      </ModalBody>
    </BaseModal>
  );
};

export default KhataDisputeModal;
