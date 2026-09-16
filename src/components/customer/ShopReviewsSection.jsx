import React, { useState, useEffect } from 'react';
import { Star, Plus } from 'lucide-react';
import { shopApi } from '../../api/shop.api';
import { AddReviewModal } from './AddReviewModal';

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
    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-subtle, #334155)', paddingTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>Customer Reviews</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', padding: '2px 8px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
            <Star size={13} fill="#eab308" />
            <span>{avgRating}</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>({reviews.length} reviews)</span>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--color-primary, #3b82f6)',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <Plus size={15} />
          Rate Shop
        </button>
      </div>

      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--bg-surface-subtle, #0f172a)', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Abhi tak koi review nahi hai. Pehla review aap dein!</p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{ background: 'none', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
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
                background: 'var(--bg-surface-subtle, #0f172a)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--color-primary, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>
                    {rev.user_name ? rev.user_name[0].toUpperCase() : 'C'}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {rev.user_name || 'Verified Customer'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={13}
                      color="#eab308"
                      fill={s <= (rev.rating || 5) ? '#eab308' : 'transparent'}
                    />
                  ))}
                </div>
              </div>

              {rev.comment && (
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
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
