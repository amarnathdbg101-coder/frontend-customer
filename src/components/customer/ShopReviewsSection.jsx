import React, { useState, useEffect } from 'react';
import { Star, Plus } from 'lucide-react';
import { shopApi } from '../../api/shop.api';
import { AddReviewModal } from './AddReviewModal';
import { RatingStars, Button } from '../ui';

export const ShopReviewsSection = ({ shopSlug, shopName }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await shopApi.getShopReviews(shopSlug);
      const list = Array.isArray(data?.reviews) ? data.reviews : (Array.isArray(data) ? data : []);
      setReviews(list);
    } catch (err) {
      console.warn('Reviews fetch:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopSlug) loadReviews();
  }, [shopSlug]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
    : '4.8';

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-subtle, #e2e8f0)', paddingTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>Customer Reviews</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', backgroundColor: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800, border: '1px solid #fcd34d' }}>
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            <span>{avgRating}</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #475569)', fontWeight: 600 }}>({reviews.length} reviews)</span>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            backgroundColor: '#0f172a',
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
          <span>Rate Shop</span>
        </button>
      </div>

      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: 'var(--bg-surface-subtle, #f8fafc)', borderRadius: '12px', border: '1px solid var(--border-subtle, #e2e8f0)' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary, #475569)', fontSize: '0.86rem', fontWeight: 500 }}>No reviews yet. Be the first to review! / अभी तक कोई समीक्षा नहीं है। पहली समीक्षा आप दर्ज करें!</p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Write First Review
          </button>
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
                    {rev.user_name ? rev.user_name[0].toUpperCase() : 'C'}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
                    {rev.user_name || 'Verified Customer'}
                  </span>
                </div>

                <RatingStars rating={rev.rating || 5} size={13} />
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
