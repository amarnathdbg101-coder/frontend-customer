import React, { useState } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { cacheEvents, CACHE_EVENTS } from '../../utils/cacheEvents.js';
import { BaseModal, ModalHeader, ModalBody, Button, FormField, Input, Textarea, AlertBanner, RatingStars } from '../ui';

export const AddProductReviewModal = ({
  isOpen,
  onClose,
  product,
  onReviewAdded,
}) => {
  const { isHindi, t } = useLanguage();
  const [rating, setRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError(isHindi ? 'कृपया अपनी समीक्षा लिखें।' : 'Please provide feedback comments.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const newReview = {
        id: `rev-${Date.now()}`,
        product_id: product.id,
        user_name: reviewerName.trim() || (isHindi ? 'सत्यापित ग्राहक' : 'Verified Customer'),
        rating: Number(rating),
        title: title.trim(),
        comment: comment.trim(),
        created_at: new Date().toISOString(),
        verified_purchase: true,
      };

      try {
        const stored = JSON.parse(localStorage.getItem(`shopsilo_reviews_${product.id}`) || '[]');
        localStorage.setItem(`shopsilo_reviews_${product.id}`, JSON.stringify([newReview, ...stored]));
      } catch (e) {
        console.warn('Review storage:', e);
      }

      setSuccess(true);
      if (onReviewAdded) {
        onReviewAdded(newReview);
      }

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="480px">
      <ModalHeader
        title={t('reviews.rate_product')}
        subtitle={product.name}
        icon={Star}
        iconColor="#f59e0b"
        onClose={onClose}
      />
      <ModalBody padding="20px">
        {success ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle2 size={46} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
              {t('reviews.review_submitted')}
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {isHindi ? 'आपकी समीक्षा सहेज ली गई है।' : 'Your review has been saved.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <FormField label={t('reviews.rate_experience')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RatingStars
                  rating={rating}
                  interactive={true}
                  onChange={setRating}
                  size={26}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b' }}>
                  {rating}/5
                </span>
              </div>
            </FormField>

            <FormField label={t('reviews.reviewer_name_label')} required={true}>
              <Input
                required
                placeholder={isHindi ? 'आपका नाम' : 'Your Name'}
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
              />
            </FormField>

            <FormField label={isHindi ? 'शीर्षक (वैकल्पिक)' : 'Review Title (Optional)'}>
              <Input
                placeholder={t('reviews.review_title_placeholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </FormField>

            <FormField label={isHindi ? 'आपकी समीक्षा *' : 'Your Review *'} required={true}>
              <Textarea
                required
                rows={3}
                placeholder={t('reviews.feedback_placeholder')}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </FormField>

            {error && <AlertBanner type="error" message={error} />}

            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              fullWidth={true}
            >
              {submitting ? t('common.processing') : t('reviews.submit_review')}
            </Button>
          </form>
        )}
      </ModalBody>
    </BaseModal>
  );
};
export default AddProductReviewModal;
