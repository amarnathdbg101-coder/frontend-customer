import React from 'react';
import { QrCode, ExternalLink } from 'lucide-react';
import { BaseModal, ModalHeader, ModalBody, Button } from '../ui';
import { RealQRCode } from '../common/RealQRCode';

export const KhataUpiPaymentModal = ({
  isOpen,
  onClose,
  selectedKhata,
  upiAmount,
  setUpiAmount,
  upiUtr,
  setUpiUtr,
  upiNote,
  setUpiNote,
  upiLoading,
  getShopUpiUri,
  onSubmit,
  isHindi,
  t,
}) => {
  if (!isOpen || !selectedKhata) return null;

  const shopVpa = (
    selectedKhata?.shop_upi_id ||
    selectedKhata?.shop?.upi_id ||
    selectedKhata?.shop_vpa ||
    selectedKhata?.shop?.vpa ||
    selectedKhata?.shop_upi ||
    ''
  ).trim();
  const upiUri = getShopUpiUri ? getShopUpiUri() : '';

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="500px"
      maxHeight="90vh"
    >
      <ModalHeader
        title={isHindi ? 'UPI से भुगतान करें' : 'Pay via UPI'}
        subtitle={`To: ${selectedKhata?.shop_name || selectedKhata?.shop?.name || ''}`}
        icon={QrCode}
        onClose={onClose}
      />
      <ModalBody padding="20px">
        <div
          style={{
            textAlign: 'center',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '16px',
          }}
        >
          {!shopVpa ? (
            <div style={{ padding: '14px', backgroundColor: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a', color: '#92400e', fontSize: '0.82rem', textAlign: 'left' }}>
              <div style={{ fontWeight: 800, marginBottom: '4px' }}>
                {isHindi ? '⚠️ दुकानदार का डायरेक्ट UPI ID सेट नहीं है' : '⚠️ Direct UPI ID is not configured by merchant'}
              </div>
              <div>
                {isHindi
                  ? 'दुकान पर भुगतान करने के बाद, पेमेंट रसीद/मेसेज का 12-अंकों का UTR Ref Number नीचे डालकर प्रूफ सबमिट करें।'
                  : 'After completing payment in-store, enter the 12-digit UTR reference number from your payment receipt to submit proof.'}
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                SCAN WITH ANY UPI APP (GPay / PhonePe / Paytm / BHIM)
              </div>
              <RealQRCode value={upiUri} size={180} logoText="UPI" showDownload={true} downloadFilename={`upi-pay-${selectedKhata?.shop_name || 'store'}`} />

              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>UPI ID:</span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{shopVpa}</strong>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(shopVpa);
                    alert(`UPI ID copied: ${shopVpa}`);
                  }}
                  style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Copy
                </button>
              </div>

              <a
                href={upiUri}
                className="btn btn-success btn-block"
                style={{ marginTop: '12px', gap: '6px', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ExternalLink size={16} />
                <span>{isHindi ? 'UPI ऐप खोलें (GPay / PhonePe / Paytm)' : 'Pay via UPI App (GPay / PhonePe / Paytm)'}</span>
              </a>
            </>
          )}
        </div>

        <form onSubmit={onSubmit}>
          {/* Quick Amount Chips */}
          {selectedKhata && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700 }}>
                {t('khata.upi_quick_amounts', 'Quick Amounts')}:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {Number(selectedKhata.current_balance || selectedKhata.balance || 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => setUpiAmount(String(selectedKhata.current_balance || selectedKhata.balance))}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      backgroundColor: upiAmount === String(selectedKhata.current_balance || selectedKhata.balance) ? 'var(--color-primary)' : 'rgba(99, 102, 241, 0.1)',
                      color: upiAmount === String(selectedKhata.current_balance || selectedKhata.balance) ? '#ffffff' : 'var(--color-primary)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {t('khata.upi_full_balance', 'Full Dues: ₹{{amount}}').replace('{{amount}}', Number(selectedKhata.current_balance || selectedKhata.balance).toLocaleString('en-IN'))}
                  </button>
                )}

                {Number(selectedKhata.current_balance || selectedKhata.balance || 0) >= 200 && (
                  <button
                    type="button"
                    onClick={() => setUpiAmount(String(Math.round(Number(selectedKhata.current_balance || selectedKhata.balance) / 2)))}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      backgroundColor: upiAmount === String(Math.round(Number(selectedKhata.current_balance || selectedKhata.balance) / 2)) ? 'var(--color-primary)' : 'rgba(99, 102, 241, 0.1)',
                      color: upiAmount === String(Math.round(Number(selectedKhata.current_balance || selectedKhata.balance) / 2)) ? '#ffffff' : 'var(--color-primary)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {t('khata.upi_half_balance', 'Half: ₹{{amount}}').replace('{{amount}}', Math.round(Number(selectedKhata.current_balance || selectedKhata.balance) / 2).toLocaleString('en-IN'))}
                  </button>
                )}

                {[500, 1000, 2000].map((amt) => {
                  if (amt >= Number(selectedKhata.current_balance || selectedKhata.balance || 0)) return null;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setUpiAmount(String(amt))}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '16px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        backgroundColor: upiAmount === String(amt) ? 'var(--color-primary)' : 'rgba(0, 0, 0, 0.05)',
                        color: upiAmount === String(amt) ? '#ffffff' : 'var(--text-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.78rem' }}>
              {isHindi ? 'भुगतान राशि (₹)' : 'Payment Amount (₹)'}
            </label>
            <input
              type="number"
              step="0.01"
              required
              className="form-input"
              value={upiAmount}
              onChange={(e) => setUpiAmount(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.78rem' }}>
              {isHindi ? '12-अंकों का UPI UTR / Ref No.' : '12-Digit UPI UTR / Reference No.'}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 423589123456"
              className="form-input"
              value={upiUtr}
              onChange={(e) => setUpiUtr(e.target.value)}
            />
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {t('khata.upi_utr_hint', 'Enter 12-digit transaction ID from GPay / PhonePe / Paytm')}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.78rem' }}>
              {isHindi ? 'टिप्पणी (वैकल्पिक)' : 'Optional Note'}
            </label>
            <input
              type="text"
              placeholder={isHindi ? "उदा: GPay से ₹500 भेजा" : "e.g. Paid ₹500 via GPay"}
              className="form-input"
              value={upiNote}
              onChange={(e) => setUpiNote(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={upiLoading || !upiUtr.trim()}
              loading={upiLoading}
            >
              {t('common.submit') || 'Submit'}
            </Button>
          </div>
        </form>
      </ModalBody>
    </BaseModal>
  );
};

export default KhataUpiPaymentModal;

