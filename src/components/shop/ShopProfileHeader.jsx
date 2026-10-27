import React, { useContext } from 'react';
import {
  Store,
  MapPin,
  Clock,
  Phone,
  Navigation,
  ShieldCheck,
  Star,
  Package,
  RefreshCw,
  Share2,
  ArrowDown,
  Info,
} from 'lucide-react';
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

  // 1. Cover Image & Logo
  const coverImage =
    s.cover_image ||
    s.banner_url ||
    (Array.isArray(s.banners) && s.banners[0]) ||
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80';

  const logoImage = s.logo_url || s.logo || s.image;
  const storeName = s.name || (isHindi ? 'गुप्ता जनरल स्टोर' : 'Gupta General Store');
  const storeType = s.category || s.store_type || (isHindi ? 'किराना और दैनिक आवश्यकताएं' : 'Groceries & Daily Essentials');
  const isVerified = s.is_verified ?? true;

  // 2. Trust Metrics
  // Distance
  let distanceText = s.distance_text;
  if (!distanceText && coords?.lat && coords?.lng && s.latitude && s.longitude) {
    const d = calculateDistanceKm(coords.lat, coords.lng, s.latitude, s.longitude);
    if (d != null) distanceText = formatDistance(d);
  }
  if (!distanceText) {
    distanceText = isHindi ? '450m दूर' : '450m Away';
  } else if (isHindi && distanceText.includes('away')) {
    distanceText = distanceText.replace('away', 'दूर');
  }

  // Open / Closed Status
  const isOpen = Boolean(s.is_currently_open ?? s.is_open ?? s.is_active ?? true);
  const openStatusText = isOpen
    ? (s.closing_time
        ? (isHindi ? `खुली है • बंद: ${s.closing_time}` : `Open Now • Closes ${s.closing_time}`)
        : (isHindi ? 'खुली है' : 'Open Now'))
    : (isHindi ? 'बंद है' : 'Closed');

  // Rating
  const ratingValue = s.rating || s.avg_rating || '4.8';
  const reviewsCount = s.reviews_count || s.rating_count || 142;

  // Products count
  const totalProducts = productsCount || s.products_count || 128;

  // Inventory Freshness
  const inventoryUpdatedText =
    s.inventory_updated_text ||
    (isHindi ? 'इन्वेंटरी 15 मिनट पहले अपडेट हुई' : 'Inventory Updated 15 mins ago');

  // 3. Quick Action URLs
  const phoneHref = s.phone ? `tel:${s.phone}` : 'tel:+919876543210';
  const directionsUrl = getDirectionsUrl(s.latitude, s.longitude, storeName, s.address || s.city);

  // 4. About Shop Description
  const aboutDescription =
    s.description ||
    s.about ||
    (isHindi
      ? 'पिछले 15 वर्षों से प्रामाणिक किराने का सामान, ताजा दैनिक आवश्यकताएं और विश्वसनीय सेवाएं प्रदान कर रहे हैं। बिना किसी अग्रिम भुगतान के 30 मिनट में काउंटर से पिकअप के लिए सामान ऑनलाइन रिज़र्व करें।'
      : 'Serving the neighborhood with 100% authentic groceries, fresh daily essentials, and trusted counter service. Reserve online with zero advance payment and collect directly from the counter.');

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
          <img
            src={getImageUrl(coverImage)}
            alt={`${storeName} Cover`}
            className="shop-profile-cover-img"
            loading="eager"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80';
            }}
          />
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
            ) : null}
            <div className="shop-profile-logo-fallback">
              <Store size={38} strokeWidth={2.2} />
            </div>
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
                  <ShieldCheck size={14} className="text-sky-600" />
                  <span>{isHindi ? 'सत्यापित' : 'Verified'}</span>
                </span>
              )}
            </div>
            <p className="shop-profile-type">{storeType}</p>
          </div>

          {/* 2. Trust Information Row (Google Maps Business Profile Style) */}
          <div className="shop-trust-pills-row" role="region" aria-label="Store Trust Indicators">
            {/* Distance */}
            <span className="shop-trust-pill distance-pill">
              <MapPin size={13} />
              <span>{distanceText}</span>
            </span>

            {/* Open / Closed */}
            <span className={`shop-trust-pill ${isOpen ? 'open-pill' : 'closed-pill'}`}>
              <Clock size={13} />
              <span>{openStatusText}</span>
            </span>

            {/* Customer Rating */}
            <span className="shop-trust-pill rating-pill">
              <Star size={13} fill="#eab308" stroke="#ca8a04" />
              <span>{ratingValue} ({reviewsCount} {isHindi ? 'समीक्षाएं' : 'reviews'})</span>
            </span>

            {/* Products Count */}
            <span className="shop-trust-pill">
              <Package size={13} color="#6366f1" />
              <span>{totalProducts} {isHindi ? 'सामान उपलब्ध' : 'Products Available'}</span>
            </span>

            {/* Inventory Freshness */}
            <span className="shop-trust-pill freshness-pill">
              <RefreshCw size={12} />
              <span>{inventoryUpdatedText}</span>
            </span>
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
            <a
              href={phoneHref}
              className="shop-action-btn-secondary"
              aria-label={isHindi ? 'दुकानदार को कॉल करें' : 'Call Shop'}
            >
              <Phone size={15} color="#16a34a" />
              <span>{isHindi ? 'कॉल करें' : 'Call Shop'}</span>
            </a>

            {/* Secondary Action: Get Directions */}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shop-action-btn-secondary"
              aria-label={isHindi ? 'दुकान का रास्ता (Google Maps) देखें' : 'Get Directions'}
            >
              <Navigation size={15} color="#2563eb" />
              <span>{isHindi ? 'दिशा-निर्देश' : 'Get Directions'}</span>
            </a>
          </div>
        </div>
      </section>

      {/* 4. About Shop Section */}
      <section className="shop-about-card" aria-label="About the Business">
        <h2 className="shop-about-title">
          <Info size={16} color="var(--color-primary, #2563eb)" />
          <span>{isHindi ? 'दुकान के बारे में' : 'About Shop'}</span>
        </h2>
        <p className="shop-about-desc">{aboutDescription}</p>

        <div className="shop-about-details-grid">
          <div className="shop-about-detail-item">
            <MapPin size={15} className="shop-about-detail-icon" />
            <span>
              <strong>{isHindi ? 'पता:' : 'Address:'}</strong>{' '}
              {s.address ? `${s.address}, ${s.city || ''}` : `${storeName}, Civil Lines, Prayagraj`}
            </span>
          </div>
          <div className="shop-about-detail-item">
            <Clock size={15} className="shop-about-detail-icon" />
            <span>
              <strong>{isHindi ? 'समय:' : 'Hours:'}</strong>{' '}
              {s.opening_time && s.closing_time
                ? `${s.opening_time} - ${s.closing_time}`
                : '8:00 AM - 10:00 PM (Daily)'}
            </span>
          </div>
        </div>
      </section>

      {/* 5. Why Trust This Shop (Google Maps / Google Guaranteed Style) */}
      <section className="shop-why-trust-card" aria-label="Why Trust This Local Shop">
        <div className="shop-why-trust-header">
          <ShieldCheck size={20} color="#16a34a" />
          <h2 className="shop-why-trust-title">
            {isHindi ? 'इस दुकान पर भरोसा क्यों करें' : 'Why Trust This Shop'}
          </h2>
        </div>

        <div className="shop-trust-grid">
          <div className="shop-trust-item">
            <span className="shop-trust-item-check" aria-hidden="true">✓</span>
            <span className="shop-trust-item-text">
              {isHindi ? 'सत्यापित स्थानीय दुकान (Verified Local Business)' : 'Verified Local Business'}
            </span>
          </div>

          <div className="shop-trust-item">
            <span className="shop-trust-item-check" aria-hidden="true">✓</span>
            <span className="shop-trust-item-text">
              {isHindi ? 'नियमित रूप से अपडेट की गई इन्वेंटरी' : 'Inventory Regularly Updated'}
            </span>
          </div>

          <div className="shop-trust-item">
            <span className="shop-trust-item-check" aria-hidden="true">✓</span>
            <span className="shop-trust-item-text">
              {isHindi ? 'काउंटर पिकअप उपलब्ध (बिना अग्रिम भुगतान)' : 'Pickup Available (Zero Prepayment)'}
            </span>
          </div>

          <div className="shop-trust-item">
            <span className="shop-trust-item-check" aria-hidden="true">✓</span>
            <span className="shop-trust-item-text">
              {isHindi ? 'शॉपसिलो पर सक्रिय पार्टनर' : 'Active On ShopSilo'}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShopProfileHeader;
