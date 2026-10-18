import React, { useState } from 'react';
import {
  Store,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getImageUrl } from '../../utils/imageUrl';
import { calculateDistanceKm, formatDistance, formatTravelTime, getDirectionsUrl } from '../../utils/distance';
import { BaseModal, ModalHeader, ModalBody, Button, Badge, AlertBanner, Card } from '../ui';

export const ShopDetailModal = ({ shop, coords, onClose }) => {
  const navigate = useNavigate();
  const { isHindi } = useLanguage();
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedBannerIdx, setSelectedBannerIdx] = useState(0);

  if (!shop) return null;

  const isShopOpen = Boolean(shop.is_currently_open ?? shop.is_open ?? shop.is_active);
  const distKm = calculateDistanceKm(coords?.lat, coords?.lng, shop.latitude, shop.longitude);
  const travelInfo = formatTravelTime(distKm, isHindi);

  const banners = Array.isArray(shop.banners) && shop.banners.length > 0
    ? shop.banners
    : (shop.banner_url ? [shop.banner_url] : []);

  const handleShare = async () => {
    const url = `${window.location.origin}/shop/${shop.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: shop.name,
          text: `${shop.name} - ${shop.category || 'Local Store'} on ShopSilo`,
          url,
        });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Share error:', err);
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      alert(url);
    }
  };

  const handleOpenStorefront = () => {
    onClose();
    navigate(`/shop/${shop.slug}`);
  };

  return (
    <BaseModal isOpen={Boolean(shop)} onClose={onClose} maxWidth="560px" maxHeight="90vh">
      <ModalHeader
        title={shop.name}
        subtitle={shop.category || (isHindi ? 'स्थानीय दुकान' : 'Local Neighborhood Store')}
        icon={Store}
        onClose={onClose}
        actions={
          <button
            type="button"
            onClick={handleShare}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted, #94a3b8)',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
            }}
            title={isHindi ? 'दुकान शेयर करें' : 'Share Store'}
          >
            <Share2 size={18} />
          </button>
        }
      />

      <ModalBody padding="16px">
        {copiedLink && (
          <AlertBanner
            type="success"
            message={isHindi ? 'दुकान का लिंक क्लिपबोर्ड पर कॉपी हो गया!' : 'Store link copied to clipboard!'}
          />
        )}

        {/* Shop Hero Banner & Photos */}
        <div
          style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: '#1e1b4b',
            minHeight: '140px',
            marginBottom: '16px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          }}
        >
          {banners.length > 0 ? (
            <img
              loading="lazy"
              decoding="async"
              src={getImageUrl(banners[selectedBannerIdx] || banners[0])}
              alt={shop.name}
              style={{ width: '100%', height: '180px', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div
              style={{
                height: '140px',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.2)',
              }}
            >
              <Store size={64} />
            </div>
          )}

          {banners.length > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '6px',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: '4px 8px',
                borderRadius: '12px',
              }}
            >
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedBannerIdx(i)}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: i === selectedBannerIdx ? '#ffffff' : 'rgba(255,255,255,0.4)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  aria-label={`Photo ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Logo & Badges Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                backgroundColor: 'white',
                padding: '3px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {shop.logo_url ? (
                <img
                  src={getImageUrl(shop.logo_url)}
                  alt={shop.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '11px' }}
                />
              ) : (
                <Store size={26} color="var(--color-primary)" />
              )}
            </div>
          </div>
        </div>

        {/* Status, Category & Travel Time Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
          <Badge variant={isShopOpen ? 'success' : 'danger'}>
            {isShopOpen ? (isHindi ? 'खुली है (OPEN)' : 'OPEN NOW') : (isHindi ? 'बंद है (CLOSED)' : 'CLOSED')}
          </Badge>

          <Badge variant="primary" icon={ShieldCheck}>
            {isHindi ? 'सत्यापित पार्टनर' : 'Verified Partner'}
          </Badge>

          {travelInfo && (
            <Badge variant="info">
              {travelInfo.full}
            </Badge>
          )}
        </div>

        {/* Address & Timings Card */}
        <Card padding="14px" style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <MapPin size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1, minWidth: 0, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
              <div>{[shop.address, shop.city, shop.pincode].filter(Boolean).join(', ') || (isHindi ? 'स्थानीय बाजार' : 'Local Market')}</div>
              {shop.landmark && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {isHindi ? 'लैंडमार्क: ' : 'Near: '} {shop.landmark}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            <Clock size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
            <span>
              {isHindi ? 'दुकान खुलने का समय: ' : 'Operating Timings: '}
              <strong>{shop.opening_time || '09:00'} - {shop.closing_time || '21:00'}</strong>
              {shop.weekly_off && (
                <span style={{ color: '#ef4444', marginLeft: '6px' }}>({isHindi ? `साप्ताहिक अवकाश: ${shop.weekly_off}` : `Closed on ${shop.weekly_off}`})</span>
              )}
            </span>
          </div>
        </Card>

        {/* Direct Contact Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {shop.whatsapp_number || shop.phone ? (
            <Button
              variant="whatsapp"
              icon={MessageCircle}
              onClick={() => {
                const num = (shop.whatsapp_number || shop.phone).replace(/[^0-9]/g, '');
                window.open(`https://wa.me/91${num.slice(-10)}?text=Hello%20${encodeURIComponent(shop.name)}`, '_blank');
              }}
            >
              {isHindi ? 'व्हाट्सएप चैट' : 'WhatsApp'}
            </Button>
          ) : null}

          {shop.phone ? (
            <Button
              variant="secondary"
              icon={Phone}
              onClick={() => window.open(`tel:${shop.phone}`)}
            >
              {isHindi ? 'कॉल करें' : 'Call Store'}
            </Button>
          ) : null}
        </div>

        {/* Directions on Google Maps (High Visibility) */}
        {shop.latitude && shop.longitude && (
          <button
            type="button"
            onClick={() => window.open(getDirectionsUrl(shop.latitude, shop.longitude, shop.name), '_blank')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#f1f5f9',
              color: '#0f172a',
              border: '1.5px solid #cbd5e1',
              borderRadius: '12px',
              padding: '12px 18px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              marginBottom: '16px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            }}
          >
            <Navigation size={18} color="#2563eb" strokeWidth={2.5} />
            <span>{isHindi ? 'गूगल मैप्स पर रास्ता देखें (GPS Directions)' : 'Get Live Directions on Google Maps'}</span>
          </button>
        )}

        {/* Visit Live Storefront CTA */}
        <Button
          variant="primary"
          size="lg"
          iconRight={ArrowRight}
          fullWidth={true}
          onClick={handleOpenStorefront}
        >
          {isHindi ? 'दुकान के प्रोडक्ट्स देखें (Storefront)' : 'Browse Store Catalog & Deals'}
        </Button>
      </ModalBody>
    </BaseModal>
  );
};
export default ShopDetailModal;
