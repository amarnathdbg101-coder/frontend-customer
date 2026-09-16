import React, { useState } from 'react';
import { X, Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import { shopApi } from '../../api/shop.api';

export const AddReviewModal = ({ isOpen, onClose, shopSlug, shopName, onReviewAdded }) => {
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
      if (onReviewAdded) onReviewAdded();
      setTimeout(() => {
        setSuccess(false);
        setComment('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Review submit karne me dikkat aayi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-surface, #1e293b)',
          border: '1px solid var(--border-subtle, #334155)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '480px',
          padding: '1.5rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>Rate {shopName}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <CheckCircle2 size={42} color="#22c55e" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>Review Submitted!</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Aapki rating shop profile par add ho gayi hai.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Aapka dukan se khareedari ka experience kaisa raha?
            </p>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', padding: '0.5rem 0' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  <Star
                    size={32}
                    color="#eab308"
                    fill={star <= rating ? '#eab308' : 'transparent'}
                  />
                </button>
              ))}
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.85rem' }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                Review / Feedback (Optional)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Product quality, dukandar ka vyavahar ya billing speed..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  resize: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--color-primary, #3b82f6)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
