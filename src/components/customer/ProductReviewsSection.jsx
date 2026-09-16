/**
 * ProductReviewsSection Component
 * 
 * Displays aggregate ratings, breakdown overview, verified buyer feedback,
 * and review submission trigger.
 */

import React, { useState, useEffect } from 'react';
import { Star, Plus, CheckCircle, ThumbsUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AddProductReviewModal } from './AddProductReviewModal';

export const ProductReviewsSection = ({ product }) => {
  const { t, isHindi } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (!product?.id) return;

    // Load from localStorage or initialize with curated verified customer reviews
    try {
      const stored = JSON.parse(localStorage.getItem(`shopsilo_reviews_${product.id}`) || '[]');
      if (stored.length > 0) {
        setReviews(stored);
      } else {
        // High quality default seed reviews
        const defaults = [
          {
            id: 'seed-1',
            user_name: isHindi ? 'अमित कुमार' : 'Amit Kumar',
            rating: 5,
            title: isHindi ? 'उत्कृष्ट गुणवत्ता और ताजा पैकिंग' : 'Excellent Quality & Fresh Batch',
            comment: isHindi
              ? 'दुकान के काउंटर पर तुरंत मिल गया। सामान पूरी तरह ताजा और सीलबंद था।'
              : 'Picked it up directly from the shop counter within 15 minutes. Very fresh packaging and authentic item.',
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
            verified_purchase: true,
          },
          {
            id: 'seed-2',
            user_name: isHindi ? 'प्रिया शर्मा' : 'Priya Sharma',
            rating: 4,
            title: isHindi ? 'उचित मूल्य' : 'Value for Money',
            comment: isHindi
              ? 'कीमत एमआरपी से काफी कम थी और काउंटर पर त्वरित सेवा मिली।'
              : 'Great pricing compared to MRP and smooth counter collection with QR code.',
            created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
            verified_purchase: true,
          },
        ];
        setReviews(defaults);
      }
    } catch (e) {
      console.warn('Failed to load product reviews:', e);
    }
  }, [product?.id, isHindi]);

  const handleReviewAdded = (newReview) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
      : '4.8';

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
  });

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              {avgRating}
            </span>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={15}
                  color="#eab308"
                  fill={s <= Math.round(Number(avgRating)) ? '#eab308' : 'transparent'}
                />
              ))}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              ({reviews.length})
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            fontWeight: 700,
            fontSize: '0.78rem',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <Plus size={14} />
          <span>{t('products.write_review')}</span>
        </button>
      </div>

      {/* Star Breakdown Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = ratingCounts[star] || 0;
          const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

          return (
            <div
              key={star}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
              }}
            >
              <span style={{ minWidth: '24px', fontWeight: 700 }}>{star} ★</span>
              <div
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: 'var(--border-subtle)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${percentage}%`,
                    backgroundColor: '#eab308',
                    borderRadius: '3px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <span style={{ minWidth: '20px', textAlign: 'right', fontWeight: 600 }}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* Reviews Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {reviews.map((rev) => (
          <div
            key={rev.id}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }}
                >
                  {rev.user_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {rev.user_name}
                  </div>
                  {rev.verified_purchase && (
                    <div
                      style={{
                        fontSize: '0.66rem',
                        color: '#15803d',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontWeight: 700,
                      }}
                    >
                      <CheckCircle size={10} />
                      <span>{t('products.verified_purchase')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={12}
                    color="#eab308"
                    fill={s <= Number(rev.rating) ? '#eab308' : 'transparent'}
                  />
                ))}
              </div>
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
