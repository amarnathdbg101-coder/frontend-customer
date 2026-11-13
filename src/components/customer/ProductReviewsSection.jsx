/**
 * ProductReviewsSection Component
 * 
 * Displays aggregate ratings, breakdown overview, verified buyer feedback,
 * and review submission trigger.
 */

import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AddProductReviewModal } from './AddProductReviewModal';
import { RatingStars, Button } from '../ui';

export const ProductReviewsSection = ({ product }) => {
  const { t, isHindi } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (!product?.id) return;

    setReviews([]);
    try {
      const stored = JSON.parse(localStorage.getItem(`shopsilo_reviews_${product.id}`) || '[]');
      setReviews(Array.isArray(stored) ? stored : []);
    } catch (e) {
      console.warn('Failed to load product reviews:', e);
    }
  }, [product?.id]);

  const handleReviewAdded = (newReview) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface-subtle)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        marginBottom: '16px',
      }}
    >
            {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              letterSpacing: '0.5px',
            }}
          >
            {t('products.customer_reviews')}
          </div>
          {avgRating ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 750, color: 'var(--text-primary)' }}>{avgRating}</span>
              <RatingStars rating={Number(avgRating)} size={16} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ({reviews.length} {isHindi ? 'समीक्षाएं' : 'reviews'})
              </span>
            </div>
          ) : (
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {isHindi ? 'अभी कोई समीक्षा नहीं है' : 'No reviews yet'}
            </p>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} />
          {isHindi ? 'समीक्षा लिखें' : 'Write Review'}
        </Button>
      </div>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {reviews.map((rev) => (
          <div
            key={rev.id}
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {rev.user_name}
                </span>
                {rev.verified_purchase && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', color: 'var(--color-primary)' }}>
                    <CheckCircle size={10} />
                    {isHindi ? 'सत्यापित' : 'Verified'}
                  </span>
                )}
              </div>
              <RatingStars rating={Number(rev.rating)} size={12} />
            </div>

            {rev.title && (
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                {rev.title}
              </div>
            )}

            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              "{rev.comment}"
            </p>
          </div>
        ))}
      </div>

      <AddProductReviewModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        product={product}
        onReviewAdded={handleReviewAdded}
      />
    </div>
  );
};
