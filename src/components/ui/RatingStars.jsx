import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({
  rating = 5,
  max = 5,
  size = 16,
  interactive = false,
  onChange,
  color = '#f59e0b',
  emptyColor = 'var(--border-subtle, #e2e8f0)',
  showScore = false,
  count = null,
  style = {},
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {Array.from({ length: max }).map((_, i) => {
          const starVal = i + 1;
          const isFilled = starVal <= displayRating;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => {
                if (interactive && onChange) onChange(starVal);
              }}
              onMouseEnter={() => {
                if (interactive) setHoverRating(starVal);
              }}
              onMouseLeave={() => {
                if (interactive) setHoverRating(0);
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: '1px',
                cursor: interactive ? 'pointer' : 'default',
                display: 'flex',
                color: isFilled ? color : emptyColor,
              }}
              aria-label={`${starVal} star`}
            >
              <Star
                size={size}
                fill={isFilled ? color : 'none'}
                stroke={isFilled ? color : emptyColor}
              />
            </button>
          );
        })}
      </div>

      {showScore && (
        <span
          style={{
            fontSize: `${size * 0.85}px`,
            fontWeight: 700,
            color: 'var(--text-primary, #0f172a)',
            marginLeft: '4px',
          }}
        >
          {Number(rating).toFixed(1)}
        </span>
      )}

      {count !== null && count !== undefined && (
        <span
          style={{
            fontSize: `${size * 0.78}px`,
            color: 'var(--text-muted, #94a3b8)',
          }}
        >
          ({count})
        </span>
      )}
    </div>
  );
};
