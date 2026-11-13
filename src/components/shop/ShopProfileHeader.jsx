import React, { useState, useEffect, useContext } from 'react';
import {
  Store,
  MapPin,
  Clock,
  Phone,
  Navigation,
  ShieldCheck,
  Star,
  Package,
  Share2,
  ArrowDown,
  Info,
  Tag,
  MessageCircle,
  QrCode,
  Download,
  X,
} from 'lucide-react';
import QRCode from 'qrcode';
import { getImageUrl } from '../../utils/imageUrl';
import { calculateDistanceKm, formatDistance, getDirectionsUrl } from '../../utils/distance';
import LanguageContext from '../../context/LanguageContext';

/**
 * ShopProfileHeader Component
 * 
 * Google Maps Business Profile Inspired Shop Identity & Trust Framework:
 * 1. Shop Header (Cover Image, Logo Avatar, Name, Verified Badge, Store Type)
 * 2. Trust Information (📍 Distance, 🕒 Open Status, ⭐ Rating, 📦 Products Count, 🔄 Fresh Inventory)
 * 3. Quick Actions (Primary [ Browse Products ], Secondary [ Call Shop ], Secondary [ Get Directions ])
 * 4. About Shop (Business Bio, Address, Timings)
 * 5. Why Trust This Shop (4 Google-Guaranteed Style Badges)
 */
export const ShopProfileHeader = ({
  shop,
  productsCount = 0,
  coords = null,
  onBrowseProducts,
  onShare,
}) => {
  const langCtx = useContext(LanguageContext);
  const isHindi = langCtx?.isHindi ?? false;
  const s = shop || {};

  const [showQRModal, setShowQRModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Generate Counter QR code with UTM attribution
  useEffect(() => {
    if (s.slug) {
      const counterUrl = `https://shopsilo.in/shop/${s.slug}?utm_source=counter_qr&utm_medium=standee`;
      QRCode.toDataURL(counterUrl, { width: 250, margin: 1 })
        .then(setQrDataUrl)
        .catch(() => {});
    }
  }, [s.slug]);

  // 1. Cover Image & Logo
  const coverImage =
    s.cover_image ||
    s.banner_url ||
    (Array.isArray(s.banners) && s.banners[0]) ||
    '';

  const logoImage = s.logo_url || s.logo || s.image;
  const storeName = s.name || (isHindi ? 'स्थानीय दुकान' : 'Local shop');
  const storeType = s.category || s.store_type || '';
  const isVerified = s.is_verified === true;

  // 2. Trust Metrics
  // Distance
  let distanceText = s.distance_text;
  if (
    !distanceText &&
    coords?.lat != null &&
    coords?.lng != null &&
    s.latitude != null &&
    s.longitude != null
  ) {
    const d = calculateDistanceKm(coords.lat, coords.lng, s.latitude, s.longitude);
    if (d != null) distanceText = formatDistance(d);
  }
  if (isHindi && distanceText?.includes('away')) {
    distanceText = distanceText.replace('away', 'दूर');
  }

  // Open / Closed Status - Real-Time State Machine with Live Timing Status
  const isOpen = s.is_currently_open ?? s.is_open;
  const liveStatus = s.live_status || (isOpen === true ? 'OPEN' : isOpen === false ? 'CLOSED' : 'UNKNOWN');

  let statusBadgeColor = 'var(--text-secondary)';
  let statusBadgeBg = 'var(--bg-surface-subtle)';

  if (liveStatus === 'OPEN') {
    statusBadgeColor = 'var(--color-success-text)';
    statusBadgeBg = 'var(--color-success-light)';
  } else if (liveStatus === 'CLOSING_SOON') {
    statusBadgeColor = '#b45309';
    statusBadgeBg = '#fef3c7';
  } else if (liveStatus === 'CLOSED') {
    statusBadgeColor = '#b91c1c';
    statusBadgeBg = '#fee2e2';
  } else if (liveStatus === 'WEEKLY_OFF') {
    statusBadgeColor = '#7e22ce';
    statusBadgeBg = '#f3e8ff';
  }

  const openStatusText = s.status_message || (
    isOpen === true
      ? (s.closing_time
          ? (isHindi ? `खुली है • बंद: ${s.closing_time}` : `Open Now • Closes ${s.closing_time}`)
          : (isHindi ? 'खुली है' : 'Open Now'))
      : isOpen === false
      ? (isHindi ? 'बंद है' : 'Closed')
      : (isHindi ? 'समय उपलब्ध नहीं' : 'Hours not listed')
  );

  const phoneDigits = s.phone?.replace(/\D/g, '') || '';
  const whatsappNumber = phoneDigits.length === 10 ? `91${phoneDigits}` : phoneDigits;
  const whatsappUrl = s.whatsapp_url || (whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Namaste ${storeName}, I found your store on ShopSilo and have a question.`)}` : null);
  const standeePdfUrl = s.standee_pdf_url || null;
  const upiPaymentUrl = s.upi_payment_url || (s.upi_id ? `upi://pay?pa=${encodeURIComponent(s.upi_id)}&pn=${encodeURIComponent(storeName)}&cu=INR` : null);

  // Rating
  const rawRating = Number(s.rating ?? s.avg_rating);
  const ratingValue = Number.isFinite(rawRating) && rawRating > 0 ? rawRating : null;
  const reviewsCount = Number(s.reviews_count ?? s.rating_count) || 0;

  // Products count
  const totalProducts = Number(productsCount) > 0 ? Number(productsCount) : (Number(s.products_count) || 0);

  // Inventory Freshness
  const inventoryUpdatedText = s.inventory_updated_text || '';

  // 3. Quick Action URLs
  const phoneHref = s.phone ? `tel:${s.phone}` : null;
  const hasCoordinates =
    s.latitude != null &&
    s.longitude != null &&
    s.latitude !== '' &&
    s.longitude !== '' &&
    Number.isFinite(Number(s.latitude)) &&
    Number.isFinite(Number(s.longitude));
  const directionsUrl = hasCoordinates
    ? getDirectionsUrl(s.latitude, s.longitude, storeName, s.address || s.city)
    : null;

  // 4. About Shop Description
  const aboutDescription = s.description || s.about || '';

  const trustItems = [
    isVerified && (isHindi ? 'सत्यापित स्थानीय दुकान' : 'Verified local shop'),
    inventoryUpdatedText && (isHindi ? 'इन्वेंटरी अपडेट का समय उपलब्ध' : 'Inventory update time provided'),
    s.accepts_reservations === true && (isHindi ? 'पिकअप रिज़र्वेशन उपलब्ध' : 'Pickup reservations available'),
  ].filter(Boolean);

  const handleShareClick = (e) => {
    e.stopPropagation();
    if (onShare) {
      onShare();
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: storeName,
        text: `${storeName} on ShopSilo`,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert(isHindi ? 'दुकान का लिंक कॉपी हो गया!' : 'Shop link copied to clipboard!');
    }
  };

  return (
    <div className="shop-profile-container" aria-label={`Shop Profile for ${storeName}`}>
      {/* 1. Main Profile Card (Cover, Identity, Trust Pills & Actions) */}
      <section className="shop-profile-card">
        {/* Cover Image Box */}
        <div className="shop-profile-cover-box">
          {coverImage ? (
            <img
              src={getImageUrl(coverImage)}
              alt={`${storeName} cover`}
              className="shop-profile-cover-img"
              loading="eager"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="shop-profile-cover-placeholder" aria-hidden="true">
              <Store size={32} />
            </div>
          )}
          <div className="shop-profile-cover-overlay" />

          {/* Share Button on Cover */}
          <button
            type="button"
            onClick={handleShareClick}
            className="shop-profile-share-btn"
            title={isHindi ? 'दुकान शेयर करें' : 'Share Shop'}
            aria-label="Share Shop"
          >
            <Share2 size={16} />
          </button>
        </div>

        {/* Content Below Cover */}
        <div className="shop-profile-content">
          {/* Logo Avatar Overlapping Cover */}
          <div className="shop-profile-logo-wrap">
            {logoImage ? (
              <img
                src={getImageUrl(logoImage)}
                alt={`${storeName} Logo`}
                className="shop-profile-logo-img"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="shop-profile-logo-fallback">
                <Store size={32} strokeWidth={2} />
              </div>
            )}
          </div>

          {/* Store Name, Verified Badge & Store Type */}
          <div className="shop-profile-identity">
            <div className="shop-profile-name-row">
              <h1 className="shop-profile-name">{storeName}</h1>
              {isVerified && (
                <span
                  className="shop-profile-verified-badge"
                  title={isHindi ? 'सत्यापित स्थानीय दुकान' : 'Verified Local Store'}
                >
                  <ShieldCheck size={15} color="#10b981" />
                  <span>✓ {isHindi ? 'सत्यापित' : 'Verified'}</span>
                </span>
              )}
            </div>
            {storeType && <p className="shop-profile-type">{storeType}</p>}
          </div>

          {/* 2. Trust Information Row (Google Business Profile Style) */}
          <div className="shop-trust-pills-row" role="region" aria-label="Store Trust Indicators">
            {/* Open / Closed Status with Real-Time State Colors */}
            <span
              className={`shop-trust-pill ${isOpen === true ? 'open-pill' : isOpen === false ? 'closed-pill' : 'unknown-pill'}`}
              style={{
                backgroundColor: statusBadgeBg,
                color: statusBadgeColor,
                borderColor: statusBadgeColor + '33',
              }}
            >
              <Clock size={13} color={statusBadgeColor} />
              <span>{openStatusText}</span>
            </span>

            {/* Distance */}
            {distanceText && (
              <span className="shop-trust-pill distance-pill">
                <MapPin size={13} />
                <span>{distanceText}</span>
              </span>
            )}

            {totalProducts > 0 && (
              <span className="shop-trust-pill">
                <Package size={13} color="#4f46e5" />
                <span>{totalProducts} {isHindi ? 'उत्पाद' : 'products'}</span>
              </span>
            )}

            {Number(s.deals_count ?? s.active_deals_count) > 0 && (
              <span className="shop-trust-pill deals-count-pill">
                <Tag size={13} color="#ec4899" />
                <span>{Number(s.deals_count ?? s.active_deals_count)} {isHindi ? 'सक्रिय ऑफ़र' : 'active offers'}</span>
              </span>
            )}

            {ratingValue && (
              <span className="shop-trust-pill rating-pill">
                <Star size={13} fill="#eab308" stroke="#ca8a04" />
                <span>{ratingValue.toFixed(1)}{reviewsCount > 0 ? ` (${reviewsCount} ${isHindi ? 'समीक्षाएं' : 'reviews'})` : ''}</span>
              </span>
            )}
          </div>

          {/* 3. Quick Actions */}
          <div className="shop-profile-actions">
            {/* Primary Action: Browse Products */}
            <button
              type="button"
              onClick={onBrowseProducts}
              className="shop-action-btn-primary"
              aria-label={isHindi ? 'दुकान के सभी सामान देखें' : 'Browse Products'}
            >
              <Package size={17} />
              <span>{isHindi ? 'सामान देखें' : 'Browse Products'}</span>
              <ArrowDown size={15} />
            </button>

            {/* Secondary Action: Call Shop */}
            {phoneHref && (
              <a
                href={phoneHref}
                className="shop-action-btn-secondary"
                aria-label={isHindi ? 'दुकानदार को कॉल करें' : 'Call Shop'}
              >
                <Phone size={15} color="#15803d" />
                <span>{isHindi ? 'कॉल करें' : 'Call shop'}</span>
              </a>
            )}

            {/* Secondary Action: Get Directions */}
            {directionsUrl && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shop-action-btn-secondary"
                aria-label={isHindi ? 'दुकान का रास्ता (Google Maps) देखें' : 'Get directions'}
              >
                <Navigation size={15} color="#4f46e5" />
                <span>{isHindi ? 'दिशा-निर्देश' : 'Directions'}</span>
              </a>
            )}

            {/* Secondary Action: Direct WhatsApp Chat & Order */}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shop-action-btn-secondary"
                style={{
                  color: '#15803d',
                  borderColor: '#bbf7d0',
                  backgroundColor: '#f0fdf4',
                }}
                aria-label={isHindi ? 'व्हाट्सएप पर ऑर्डर करें' : 'Order on WhatsApp'}
              >
                <MessageCircle size={15} color="#16a34a" />
                <span>{isHindi ? 'व्हाट्सएप चैट' : 'WhatsApp'}</span>
              </a>
            )}

            {/* Secondary Action: Store Digital Counter QR & Standee */}
            {s.slug && (
              <button
                type="button"
                onClick={() => setShowQRModal(true)}
                className="shop-action-btn-secondary"
                aria-label={isHindi ? 'काउंटर QR कोड देखें' : 'Counter QR'}
              >
                <QrCode size={15} color="#4f46e5" />
                <span>{isHindi ? 'काउंटर QR' : 'Counter QR'}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 4. About Shop Section */}
      {(aboutDescription || s.address || (s.opening_time && s.closing_time)) && (
        <section className="shop-about-card" aria-label="About the Business">
          <h2 className="shop-about-title">
            <Info size={16} color="var(--color-primary)" />
            <span>{isHindi ? 'दुकान के बारे में' : 'About this shop'}</span>
          </h2>
          {aboutDescription && <p className="shop-about-desc">{aboutDescription}</p>}

          <div className="shop-about-details-grid">
            {s.address && (
              <div className="shop-about-detail-item">
                <MapPin size={15} className="shop-about-detail-icon" />
                <span>
                  <strong>{isHindi ? 'पता:' : 'Address:'}</strong>{' '}
                  {[s.address, s.city].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
            {s.opening_time && s.closing_time && (
              <div className="shop-about-detail-item">
                <Clock size={15} className="shop-about-detail-icon" />
                <span>
                  <strong>{isHindi ? 'समय:' : 'Hours:'}</strong>{' '}
                  {s.opening_time} - {s.closing_time}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {trustItems.length > 0 && (
        <section className="shop-why-trust-card" aria-label="Shop information">
          <div className="shop-why-trust-header">
            <ShieldCheck size={20} color="var(--color-success)" />
            <h2 className="shop-why-trust-title">
              {isHindi ? 'दुकान की जानकारी' : 'Shop information'}
            </h2>
          </div>

          <div className="shop-trust-grid">
            {trustItems.map((item) => (
              <div className="shop-trust-item" key={item}>
                <span className="shop-trust-item-check" aria-hidden="true">✓</span>
                <span className="shop-trust-item-text">{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Digital Counter QR & Acrylic Standee PDF Modal */}
      {showQRModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Store Digital Counter QR Code"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowQRModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              maxWidth: '380px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textAlign: 'center',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowQRModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                border: 'none',
                background: '#f1f5f9',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              aria-label="Close"
            >
              <X size={18} color="#64748b" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
              <Store size={22} color="#4f46e5" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                {storeName}
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 16px 0' }}>
              {isHindi ? 'काउंटर QR स्कैन करके सीधे स्टोर प्रोफाइल और कैटलॉग खोलें' : 'Scan counter QR for instant storefront catalog'}
            </p>

            {/* Rendered QR Image */}
            <div
              style={{
                padding: '16px',
                backgroundColor: '#ffffff',
                border: '2px dashed #cbd5e1',
                borderRadius: '16px',
                display: 'inline-block',
                marginBottom: '16px',
              }}
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`${storeName} Counter QR`}
                  style={{ width: '200px', height: '200px', display: 'block', margin: '0 auto' }}
                />
              ) : (
                <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  Generating QR...
                </div>
              )}
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6366f1', marginTop: '6px' }}>
                shopsilo.in/shop/{s.slug || 'store'}
              </div>
            </div>

            {/* UPI ID Badge */}
            {s.upi_id && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#334155',
                }}
              >
                <span>UPI: <strong>{s.upi_id}</strong></span>
                {upiPaymentUrl && (
                  <a
                    href={upiPaymentUrl}
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#4f46e5',
                      textDecoration: 'underline',
                      marginLeft: '6px',
                    }}
                  >
                    Pay App
                  </a>
                )}
              </div>
            )}

            {/* Standee PDF Download Button */}
            {standeePdfUrl && (
              <a
              href={standeePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={`${s.slug || 'store'}-standee.pdf`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                borderRadius: '14px',
                fontWeight: 700,
                fontSize: '0.88rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              }}
            >
              <Download size={16} />
              <span>{isHindi ? 'एक्रिलिक स्टैंडी (A5 PDF) डाउनलोड करें' : 'Download Acrylic Standee (PDF)'}</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopProfileHeader;
