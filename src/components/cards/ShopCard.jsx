/**
 * Reusable Shop Card Component
 * Clean, modern, responsive shop card with live open/closed status state machine
 * (OPEN, CLOSING_SOON, WEEKLY_OFF, CLOSED), live GPS travel distance, 
 * WhatsApp direct chat, and 1-tap Google Maps directions.
 */

import React, { memo, useContext } from 'react';
import { Store, MapPin, Clock, Heart, Phone, ArrowRight, Navigation, ShieldCheck, MessageCircle, Star } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';
import { calculateDistanceKm, formatTravelTime, getDirectionsUrl } from '../../utils/distance';
import LanguageContext from '../../context/LanguageContext';

const ShopCardInner = ({
  shop,
  coords,
  isSaved = false,
  onToggleSave,
  onClick,
  onNavigate,
}) => {
  const langContext = useContext(LanguageContext);
  const isHindi = langContext?.isHindi ?? false;
  const s = shop;
  if (!s) return null;

  // Real-time Store Timing State Machine (OPEN, CLOSING_SOON, WEEKLY_OFF, CLOSED)
  const rawStatus = (s.live_status || '').toUpperCase();
  const isShopOpen = s.is_currently_open ?? s.is_open;
  const liveStatus = rawStatus || (isShopOpen === true ? 'OPEN' : isShopOpen === false ? 'CLOSED' : 'UNKNOWN');
  const isVerified = s.is_verified === true;

  const getStatusBadge = () => {
    switch (liveStatus) {
      case 'OPEN':
        return {
          bg: '#dcfce7',
          border: '#86efac',
          text: '#15803d',
          dot: '#16a34a',
          label: isHindi ? 'खुली है' : 'OPEN NOW',
        };
      case 'CLOSING_SOON':
        return {
          bg: '#fffbeb',
          border: '#fde68a',
          text: '#92400e',
          dot: '#f59e0b',
          label: isHindi ? 'जल्द बंद होगी' : 'CLOSING SOON',
        };
      case 'WEEKLY_OFF':
        return {
          bg: '#faf5ff',
          border: '#e9d5ff',
          text: '#6b21a8',
          dot: '#a855f7',
          label: isHindi ? 'साप्ताहिक छुट्टी' : 'WEEKLY OFF',
        };
      case 'CLOSED':
        return {
          bg: '#fee2e2',
          border: '#fca5a5',
          text: '#991b1b',
          dot: '#dc2626',
          label: isHindi ? 'बंद है' : 'CLOSED',
        };
      case 'UNKNOWN':
      default:
        return {
          bg: 'var(--bg-surface-subtle)',
          border: 'var(--border-subtle)',
          text: 'var(--text-secondary)',
          dot: 'var(--text-muted)',
          label: isHindi ? 'समय उपलब्ध नहीं' : 'Hours not listed',
        };
    }
  };

  const statusBadge = getStatusBadge();

  // Distance & Travel Time Calculation
  const distKm = s.distance_km != null && !isNaN(s.distance_km)
    ? Number(s.distance_km)
    : calculateDistanceKm(coords?.lat, coords?.lng, s.latitude, s.longitude);
  const travelInfo = formatTravelTime(distKm, isHindi);

  // WhatsApp Chat Integration
  const cleanPhone = (s.whatsapp_number || s.phone || '').replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const whatsappUrl = s.whatsapp_url || (formattedPhone ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(isHindi ? `नमस्ते ${s.name}, क्या आपका स्टोर अभी खुला है?` : `Hi ${s.name}, I found your shop on ShopSilo!`)}` : null);

  const trustScore = Number(s.trust_score || s.rating || 0);

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
                {isVerified && <ShieldCheck size={14} color="#15803d" style={{ flexShrink: 0 }} aria-label={isHindi ? 'सत्यापित दुकान' : 'Verified shop'} />}
              </div>

              {/* Category, Rating & Verified Tag */}
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
                  {s.category || (isHindi ? 'स्थानीय दुकान' : 'Local shop')}
                </span>

                {trustScore > 0 && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#854d0e',
                      backgroundColor: '#fef9c3',
                      border: '1px solid #fef08a',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <Star size={11} fill="#eab308" color="#eab308" />
                    <span>{trustScore.toFixed(1)}</span>
                  </span>
                )}
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

          {/* Status & Timings State Machine */}
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
                backgroundColor: statusBadge.bg,
                color: statusBadge.text,
                border: `1px solid ${statusBadge.border}`,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: statusBadge.dot,
                }}
              />
              {statusBadge.label}
            </span>

            {s.status_message ? (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #64748b)', fontWeight: 600 }}>
                {s.status_message}
              </span>
            ) : s.opening_time && s.closing_time ? (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #64748b)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={11} color="#64748b" />
                <span>{s.opening_time} - {s.closing_time}</span>
              </span>
            ) : null}
          </div>

          {/* Address & Travel Info */}
          {(s.address || s.city || travelInfo?.full) && (
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary, #475569)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {[s.address, s.city].filter(Boolean).join(', ')}
              </span>
              {travelInfo?.full && (
                <strong style={{ color: 'var(--text-secondary)', flexShrink: 0, marginLeft: '4px' }}>
                  • {travelInfo.full}
                </strong>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions Row */}
      <div style={{ display: 'flex', gap: '6px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle, #e2e8f0)' }} onClick={(e) => e.stopPropagation()}>
        {/* GPS Directions */}
        {s.latitude && s.longitude && (
          <a
            href={getDirectionsUrl(s.latitude, s.longitude, s.name)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              gap: '4px',
              fontSize: '0.74rem',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f1f5f9',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              padding: '6px 8px',
              borderRadius: '8px',
            }}
            title={isHindi ? 'गूगल मैप्स पर रास्ता देखें' : 'Directions'}
          >
            <Navigation size={13} color="#2563eb" />
            <span>{isHindi ? 'रास्ता' : 'Maps'}</span>
          </a>
        )}

        {/* WhatsApp Direct Chat */}
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              gap: '4px',
              fontSize: '0.74rem',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              padding: '6px 8px',
              borderRadius: '8px',
            }}
            title={isHindi ? 'व्हाट्सएप चैट' : 'WhatsApp'}
          >
            <MessageCircle size={13} color="#10b981" />
            <span>{isHindi ? 'चैट' : 'Chat'}</span>
          </a>
        )}

        {/* Phone Call */}
        {s.phone && (
          <a
            href={`tel:${s.phone}`}
            style={{
              gap: '4px',
              fontSize: '0.74rem',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f1f5f9',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              padding: '6px 8px',
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
            padding: '6px 10px',
            fontSize: '0.76rem',
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
