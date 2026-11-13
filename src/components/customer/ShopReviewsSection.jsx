import React, { useState, useEffect, useCallback } from 'react';
import { Star, Plus } from 'lucide-react';
import { shopApi } from '../../api/shop.api';
import { AddReviewModal } from './AddReviewModal';
import { RatingStars } from '../ui';
import { useLanguage } from '../../context/LanguageContext';

export const ShopReviewsSection = ({ shopSlug, shopName }) => {
  const { isHindi } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadReviews = useCallback(async () => {
    if (!shopSlug) {
      setLoading(false);
      setReviews([]);
      return;
    }

    try {
      setLoading(true);
      setLoadError(false);
      const data = await shopApi.getShopReviews(shopSlug);
      const list = Array.isArray(data?.reviews) ? data.reviews : (Array.isArray(data) ? data : []);
      setReviews(list);
    } catch (err) {
      console.warn('Reviews fetch:', err);
      setReviews([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [shopSlug]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-subtle, #e2e8f0)', paddingTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {isHindi ? 'ग्राहक समीक्षाएं' : 'Customer reviews'}
          </h3>
          {avgRating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 700 }}>
              <Star size={13} fill="currentColor" />
              <span>{avgRating}</span>
            </div>
          )}
          {reviews.length > 0 && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              ({reviews.length} {isHindi ? 'समीक्षाएं' : 'reviews'})
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Plus size={14} />
          <span>{isHindi ? 'समीक्षा लिखें' : 'Write a review'}</span>
        </button>
      </div>

      {loading ? (
        <p role="status" style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
          {isHindi ? 'समीक्षाएं लोड हो रही हैं…' : 'Loading reviews…'}
        </p>
      ) : loadError ? (
        <div role="alert" style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <p style={{ margin: '0 0 0.75rem', color: 'var(--text-secondary)', fontSize: '0.86rem', fontWeight: 500 }}>
            {isHindi ? 'समीक्षाएं अभी लोड नहीं हो सकीं।' : 'Reviews could not be loaded right now.'}
          </p>
          <button
            type="button"
            onClick={loadReviews}
            style={{
              minHeight: '40px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--color-primary)',
              border: '1px solid var(--border-strong)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isHindi ? 'फिर से कोशिश करें' : 'Try again'}
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.86rem', fontWeight: 500 }}>
            {isHindi ? 'अभी कोई समीक्षा नहीं है।' : 'No reviews yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {reviews.map((rev, idx) => (
            <div
              key={rev.id || idx}
              style={{
                padding: '1rem',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                border: '1px solid var(--border-subtle, #e2e8f0)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 800 }}>
                    {rev.user_name ? rev.user_name[0].toUpperCase() : (isHindi ? 'ग्राहक' : 'C')}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
                    {rev.user_name || (isHindi ? 'ग्राहक' : 'Customer')}
                  </span>
                </div>

                {rev.rating != null && <RatingStars rating={Number(rev.rating)} size={13} />}
              </div>

              {rev.comment && (
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary, #475569)', lineHeight: '1.45', fontWeight: 500 }}>
                  "{rev.comment}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <AddReviewModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        shopSlug={shopSlug}
        shopName={shopName}
        onReviewAdded={loadReviews}
      />
    </div>
  );
};

export default ShopReviewsSection;
