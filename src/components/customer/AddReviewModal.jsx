import React, { useState } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { shopApi } from '../../api/shop.api';
import { cacheEvents, CACHE_EVENTS } from '../../utils/cacheEvents.js';
import { useLanguage } from '../../context/LanguageContext';
import { BaseModal, ModalHeader, ModalBody, Button, FormField, Textarea, AlertBanner, RatingStars } from '../ui';

export const AddReviewModal = ({ isOpen, onClose, shopSlug, shopName, onReviewAdded }) => {
  const { isHindi } = useLanguage();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await shopApi.addShopReview(shopSlug, {
        rating,
        comment: comment.trim() || undefined,
      });
      setSuccess(true);
      cacheEvents.emit(CACHE_EVENTS.STOREFRONT_MUTATED, { slug: shopSlug });
      cacheEvents.emit(CACHE_EVENTS.SHOPS_MUTATED);
      if (onReviewAdded) onReviewAdded();
      setTimeout(() => {
        setSuccess(false);
        setComment('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || (isHindi ? 'समीक्षा सबमिट करने में त्रुटि हुई।' : 'Failed to submit review.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="480px">
      <ModalHeader
        title={isHindi ? 'दुकान की समीक्षा लिखें' : 'Write Shop Review'}
        subtitle={shopName}
        icon={Star}
        iconColor="#f59e0b"
        onClose={onClose}
      />
      <ModalBody padding="20px">
        {success ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <CheckCircle2 size={44} color="#10b981" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 800 }}>
              {isHindi ? 'समीक्षा दर्ज हो गई!' : 'Review Submitted!'}
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {isHindi ? 'आपकी प्रतिक्रिया के लिए धन्यवाद।' : 'Thank you for your valuable feedback.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <FormField label={isHindi ? 'रेटिंग चुनें' : 'Select Rating'}>
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

            <FormField label={isHindi ? 'अपनी टिप्पणी (वैकल्पिक)' : 'Your Feedback (Optional)'}>
              <Textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isHindi ? 'दुकान की सेवा, उत्पाद गुणवत्ता आदि के बारे में लिखें...' : 'Share your experience with store service, product quality...'}
              />
            </FormField>

            {error && <AlertBanner type="error" message={error} />}

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              fullWidth={true}
            >
              {loading
                ? (isHindi ? 'सबमिट हो रहा है...' : 'Submitting...')
                : (isHindi ? 'समीक्षा सबमिट करें' : 'Submit Review')}
            </Button>
          </form>
        )}
      </ModalBody>
    </BaseModal>
  );
};
export default AddReviewModal;
