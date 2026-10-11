import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { reportApi } from '../../api/report.api';
import { useLanguage } from '../../context/LanguageContext';
import { BaseModal, ModalHeader, ModalBody, Button, FormField, Select, Textarea, AlertBanner } from '../ui';

const REASONS = [
  'Misleading Price / Quality',
  'Fake / Inactive Store',
  'Counterfeit Item',
  'Refused Counter OTP',
  'Offensive / Prohibited Content',
];

export const ReportModal = ({ isOpen, onClose, targetType = 'shop', targetId, targetName }) => {
  const { isHindi } = useLanguage();
  const [reason, setReason] = useState(REASONS[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError(isHindi ? 'कृपया विवरण दर्ज करें।' : 'Please provide incident details.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await reportApi.submitReport({
        target_type: targetType,
        target_id: String(targetId),
        reason,
        description: description.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || (isHindi ? 'रिपोर्ट दर्ज करने में त्रुटि हुई।' : 'Failed to submit report.'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} maxWidth="480px">
      <ModalHeader
        title={isHindi ? 'शिकायत दर्ज करें' : `Report ${targetType === 'shop' ? 'Store' : 'Product'}`}
        icon={ShieldAlert}
        iconColor="#ef4444"
        onClose={handleClose}
      />
      <ModalBody padding="20px">
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <CheckCircle2 size={44} color="#10b981" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 800 }}>
              {isHindi ? 'शिकायत सफलतापूर्वक दर्ज हो गई' : 'Report Submitted'}
            </h4>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {isHindi
                ? 'धन्यवाद। हमारी सुरक्षा टीम IT Rules 2021 के तहत 24 घंटे में इसकी समीक्षा करेगी।'
                : 'Thank you. Our safety desk will review this incident within 24 hours under IT Rules 2021.'}
            </p>
            <Button variant="primary" onClick={handleClose}>
              {isHindi ? 'पूर्ण' : 'Done'}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <p style={{ margin: '0 0 14px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {isHindi ? 'विषय: ' : 'Reporting: '} <strong>{targetName || targetId}</strong>
            </p>

            <FormField label={isHindi ? 'समस्या का प्रकार' : 'Select Issue Category'}>
              <Select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                options={REASONS.map(r => ({ value: r, label: r }))}
              />
            </FormField>

            <FormField label={isHindi ? 'शिकायत का विवरण *' : 'Complaint Description *'}>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isHindi ? 'समस्या की पूरी जानकारी लिखें...' : 'Please describe the incident in detail...'}
                required
              />
            </FormField>

            {error && <AlertBanner type="error" message={error} />}

            <Button
              type="submit"
              variant="danger"
              loading={loading}
              fullWidth={true}
            >
              {loading
                ? (isHindi ? 'दर्ज हो रहा है...' : 'Submitting Report...')
                : (isHindi ? 'शिकायत सबमिट करें' : 'Submit Grievance Report')}
            </Button>
          </form>
        )}
      </ModalBody>
    </BaseModal>
  );
};
export default ReportModal;
