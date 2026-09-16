/**
 * Reusable Shop Card Component
 * Bilingual, responsive, and accessible card with live open/closed status & GPS distance
 */

import React, { memo } from 'react';
import { Store, MapPin, Clock, Heart, Phone, ArrowRight } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';
import { calculateDistanceKm, formatDistance } from '../../utils/distance';
import { useLanguage } from '../../context/LanguageContext';

const ShopCardInner = ({
  shop,
  coords,
  isSaved = false,
  onToggleSave,
  onClick,
  onNavigate,
}) => {
  const { isHindi } = useLanguage();
  const s = shop;
  const distKm = calculateDistanceKm(coords?.lat, coords?.lng, s.latitude, s.longitude);
  const hasBanner = Array.isArray(s.banners) && s.banners.length > 0 && s.banners[0];

  return (
    <div
      className="card card-clickable shop-card"
      onClick={onClick}
      role="article"
      aria-label={`Shop: ${s.name}, ${s.is_active ? 'Open Now' : 'Closed'}`}
    >
      {/* Banner Preview */}
      {hasBanner && (
        <div className="shop-card-banner">
          <img
            src={getImageUrl(s.banners[0])}
            alt={`${s.name} banner`}
            loading="lazy"
            onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Shop Identity */}
      <div className="shop-card-identity">
        <div className="shop-card-logo">
          {s.logo_url ? (
            <img
              src={getImageUrl(s.logo_url)}
              alt={`${s.name} logo`}
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <Store size={32} aria-hidden="true" />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div>
              <h3 className="shop-card-name">{s.name}</h3>
              <div className="shop-card-tags">
                <span className="shop-card-tag-category">
                  🏪 {s.category || (isHindi ? 'दुकान' : 'General Store')}
                </span>
                <span className="shop-card-tag-verified">
                  {isHindi ? '✓ सत्यापित' : '✓ Verified'}
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave?.(s);
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
              aria-label={isSaved ? `Unsave ${s.name}` : `Save ${s.name}`}
            >
              <Heart size={20} color={isSaved ? '#ef4444' : 'var(--text-muted)'} fill={isSaved ? '#ef4444' : 'none'} />
            </button>
          </div>

          {/* Status */}
          <div className="shop-card-status-row">
            <span className={`shop-card-status ${s.is_active ? 'open' : 'closed'}`}>
              <span className="shop-card-status-dot" />
              {s.is_active ? (isHindi ? 'खुली है' : 'OPEN NOW') : (isHindi ? 'बंद है' : 'CLOSED')}
            </span>
            <span className="shop-card-timing">
              <Clock size={12} color="var(--text-muted)" aria-hidden="true" />
              {s.opening_time || '09:00'} - {s.closing_time || '21:00'}
            </span>
          </div>

          {/* Location */}
          <div className="shop-card-location">
            <MapPin size={13} color="var(--color-primary)" style={{ flexShrink: 0 }} aria-hidden="true" />
            <span className="shop-card-address">
              {[s.address, s.city].filter(Boolean).join(', ') || (isHindi ? 'स्थानीय दुकान' : 'Local Store')}
            </span>
            {distKm != null && (
              <span className="shop-card-distance">
                • {formatDistance(distKm)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="shop-card-highlights">
        <span>{isHindi ? '⚡ 30-मिनट पिकअप' : '⚡ 30-Min Counter Pickup'}</span>
        <span>•</span>
        <span>{isHindi ? '✓ लाइव स्टॉक' : '✓ Live Stock'}</span>
        {s.phone && (
          <>
            <span>•</span>
            <span>💬 WhatsApp</span>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="shop-card-actions" onClick={(e) => e.stopPropagation()}>
        {s.phone && (
          <a
            href={`tel:${s.phone}`}
            className="btn btn-secondary btn-sm shop-card-call-btn"
            aria-label={`Call ${s.name}`}
          >
            <Phone size={13} aria-hidden="true" /> {isHindi ? 'कॉल करें' : 'Call'}
          </a>
        )}
        <button
          onClick={() => onNavigate?.(`/shop/${s.slug}`)}
          className="btn btn-primary btn-sm shop-card-storefront-btn"
        >
          <span>{isHindi ? 'दुकान देखें' : 'Storefront'}</span>
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export const ShopCard = memo(ShopCardInner);
export default ShopCard;
