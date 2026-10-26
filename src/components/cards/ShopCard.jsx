/**
 * Reusable Shop Card Component
 * Clean, modern, responsive shop card with live open/closed status,
 * live GPS travel distance, and 1-tap Google Maps directions.
 */

import React, { memo } from 'react';
import { Store, MapPin, Clock, Heart, Phone, ArrowRight, Navigation, ShieldCheck } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';
import { calculateDistanceKm, formatTravelTime, getDirectionsUrl } from '../../utils/distance';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../ui';

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
  if (!s) return null;

  const isShopOpen = Boolean(s.is_currently_open ?? s.is_open ?? s.is_active ?? true);
  const distKm = calculateDistanceKm(coords?.lat, coords?.lng, s.latitude, s.longitude);
  const travelInfo = formatTravelTime(distKm, isHindi);

  return (
    <div
      className="shop-card"
      onClick={onClick}
      role="article"
      style={{
        margin: 0,
        padding: '14px',
        borderRadius: '14px',
        border: '1px solid var(--border-subtle, #e2e8f0)',
        backgroundColor: 'var(--bg-surface, #ffffff)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '10px',
        cursor: 'pointer',
        transition: 'all 0.15s ease-in-out',
      }}
    >
      {/* Shop Identity Row */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        {/* Store Logo */}
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {s.logo_url ? (
            <img
              src={getImageUrl(s.logo_url)}
              alt={`${s.name} logo`}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <Store size={26} color="#0f172a" />
          )}
        </div>

        {/* Store Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <h3
                  style={{
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    margin: 0,
                    color: 'var(--text-primary, #0f172a)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {s.name}
                </h3>
                <ShieldCheck size={14} color="#2563eb" style={{ flexShrink: 0 }} />
              </div>

              {/* Category & Verified Tag */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginTop: '3px' }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary, #475569)',
                    backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle, #e2e8f0)',
                  }}
                >
                  {s.category || (isHindi ? 'दुकान' : 'General Store')}
                </span>
              </div>
            </div>

            {/* Favorite Bookmark */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave?.(s);
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
              aria-label={isSaved ? `Unsave ${s.name}` : `Save ${s.name}`}
            >
              <Heart size={18} color={isSaved ? '#ef4444' : '#94a3b8'} fill={isSaved ? '#ef4444' : 'none'} />
            </button>
          </div>

          {/* Status & Timings */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: isShopOpen ? '#dcfce7' : '#fee2e2',
                color: isShopOpen ? '#15803d' : '#991b1b',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isShopOpen ? '#16a34a' : '#dc2626',
                }}
              />
              {isShopOpen ? (isHindi ? 'खुली है' : 'OPEN NOW') : (isHindi ? 'बंद है' : 'CLOSED')}
            </span>

            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #64748b)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={11} color="#64748b" />
              <span>{s.opening_time || '09:00'} - {s.closing_time || '21:00'}</span>
            </span>
          </div>

          {/* Address & Travel Info */}
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary, #475569)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} color="#0f172a" style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {[s.address, s.city].filter(Boolean).join(', ') || (isHindi ? 'स्थानीय बाजार' : 'Local Market')}
            </span>
            {travelInfo?.full && (
              <strong style={{ color: '#2563eb', flexShrink: 0, marginLeft: '4px' }}>
                • {travelInfo.full}
              </strong>
            )}
          </div>
        </div>
      </div>

      {/* Highlights Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '6px 10px',
          backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
          borderRadius: '8px',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: 'var(--text-secondary, #475569)',
          alignItems: 'center',
          border: '1px solid var(--border-subtle, #e2e8f0)',
        }}
      >
        <span>{isHindi ? '⚡ 15-मिनट पिकअप' : '⚡ 15-Min Pickup'}</span>
        <span>•</span>
        <span>{isHindi ? '✓ लाइव कैटलॉग' : '✓ Live Catalog'}</span>
      </div>

      {/* Actions Row */}
      <div style={{ display: 'flex', gap: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle, #e2e8f0)' }} onClick={(e) => e.stopPropagation()}>
        {/* GPS Directions */}
        {s.latitude && s.longitude && (
          <a
            href={getDirectionsUrl(s.latitude, s.longitude, s.name)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              gap: '4px',
              fontSize: '0.76rem',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f1f5f9',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              padding: '6px 10px',
              borderRadius: '8px',
            }}
            title={isHindi ? 'गूगल मैप्स पर रास्ता देखें' : 'Directions'}
          >
            <Navigation size={13} color="#2563eb" />
            <span>{isHindi ? 'रास्ता' : 'Maps'}</span>
          </a>
        )}

        {/* Phone Call */}
        {s.phone && (
          <a
            href={`tel:${s.phone}`}
            style={{
              gap: '4px',
              fontSize: '0.76rem',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f1f5f9',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              padding: '6px 10px',
              borderRadius: '8px',
            }}
          >
            <Phone size={13} />
            <span>{isHindi ? 'कॉल' : 'Call'}</span>
          </a>
        )}

        {/* Storefront Navigation Button */}
        <button
          type="button"
          onClick={() => onNavigate?.(`/shop/${s.slug}`)}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          <span>{isHindi ? 'दुकान देखें' : 'Storefront'}</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};

export const ShopCard = memo(ShopCardInner);
export default ShopCard;
