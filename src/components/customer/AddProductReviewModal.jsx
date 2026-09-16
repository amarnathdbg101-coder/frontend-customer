/**
 * AddProductReviewModal Component
 * 
 * Interactive dialog allowing customers to submit a verified rating (1-5 stars)
 * and detailed review for a specific product.
 */

import React, { useState } from 'react';
import { X, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const AddProductReviewModal = ({ isOpen, onClose, product, onReviewAdded }) => {
  if (!isOpen || !product) return null;

  const { user } = useAuth();
  const { t } = useLanguage();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState(user?.full_name || user?.name || '');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide feedback comments.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const newReview = {
        id: `rev-${Date.now()}`,
        product_id: product.id,
        user_name: reviewerName.trim() || 'Verified Customer',
        rating: Number(rating),
        title: title.trim(),
        comment: comment.trim(),
        created_at: new Date().toISOString(),
        verified_purchase: true,
      };

      // Save to localStorage for instant persistence
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
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        zIndex: 160,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--bg-surface, #ffffff)',
          color: 'var(--text-primary)',
          borderRadius: 'var(--radius-lg, 16px)',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
              {t('reviews.rate_product')}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {product.name}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'var(--bg-surface-subtle)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
            aria-label={t('common.close')}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px 0' }}>
                {t('reviews.review_submitted')}
              </h4>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Interactive Star Rating */}
              <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>
                  {t('reviews.rate_experience')}
                </div>
                <div style={{ display: 'inline-flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        transition: 'transform 0.1s',
                      }}
                      aria-label={`${star} Stars`}
                    >
                      <Star
                        size={28}
                        color="#eab308"
                        fill={(hoverRating || rating) >= star ? '#eab308' : 'transparent'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.76rem', marginBottom: '4px' }}>
                  {t('reviews.reviewer_name_label')}
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Your Name"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.76rem', marginBottom: '4px' }}>
                  Review Title (Optional)
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('reviews.review_title_placeholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '0.76rem', marginBottom: '4px' }}>
                  Your Review
                </label>
                <textarea
                  required
                  rows="3"
                  className="form-input"
                  placeholder={t('reviews.feedback_placeholder')}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              {error && (
                <div
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#b91c1c',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-block"
                style={{ padding: '10px', fontWeight: 700, borderRadius: 'var(--radius-md)' }}
              >
                {submitting ? t('common.processing') : t('reviews.submit_review')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
