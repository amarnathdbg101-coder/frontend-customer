/**
 * TrustBuildingSection Component
 * 
 * Clean, fintech-style onboarding and trust framework:
 * 1. How ShopSilo Works (3-step horizontal workflow)
 * 2. Why People Use ShopSilo (4 trust badges with green verified indicators)
 * 3. Live Marketplace Stats (Subtle visual hierarchy)
 * 
 * Visual Principles:
 * - Modern, minimal fintech aesthetic
 * - No gradients, no heavy marketing banners
 * - Solid crisp surfaces, soft borders, high contrast readability
 */

import React from 'react';
import {
  Search,
  Scale,
  ShoppingBag,
  CheckCircle2,
  Store,
  Tag,
  PackageCheck,
} from 'lucide-react';

export const TrustBuildingSection = ({
  productCount = 324,
  shopCount = 12,
  dealsCount = 46,
  isHindi = false,
}) => {
  const steps = [
    {
      step: '01',
      title: isHindi ? 'खोजें (Search)' : 'Search',
      text: isHindi
        ? 'पास की दुकानों में उपलब्ध सामान खोजें।'
        : 'Find products available in nearby shops.',
      icon: <Search size={20} className="step-card-icon" />,
    },
    {
      step: '02',
      title: isHindi ? 'तुलना करें (Compare)' : 'Compare',
      text: isHindi
        ? 'कई स्थानीय दुकानों की कीमतों की तुलना करें।'
        : 'Compare prices from multiple local stores.',
      icon: <Scale size={20} className="step-card-icon" />,
    },
    {
      step: '03',
      title: isHindi ? 'रिज़र्व करें (Reserve)' : 'Reserve',
      text: isHindi
        ? 'तुरंत रिज़र्व करें और सीधे दुकान से पिकअप करें।'
        : 'Reserve instantly and pickup from the shop.',
      icon: <ShoppingBag size={20} className="step-card-icon" />,
    },
  ];

  const trustBadges = [
    {
      id: 'verified_shops',
      text: isHindi ? 'वेरीफाइड लोकल दुकानें' : 'Verified Local Shops',
    },
    {
      id: 'live_inventory',
      text: isHindi ? 'लाइव इन्वेंटरी अपडेट्स' : 'Live Inventory Updates',
    },
    {
      id: 'no_advance_payment',
      text: isHindi ? 'कोई अग्रिम भुगतान ज़रूरी नहीं' : 'No Advance Payment Required',
    },
    {
      id: 'reserve_pickup_nearby',
      text: isHindi ? 'पास से रिज़र्व व पिकअप' : 'Reserve & Pickup Nearby',
    },
  ];

  // Dynamic formatting ensuring requested minimums like 324+, 12+, 46+
  const displayProducts = productCount && productCount > 324 ? `${productCount}+` : '324+';
  const displayShops = shopCount && shopCount > 12 ? `${shopCount}+` : '12+';
  const displayDeals = dealsCount && dealsCount > 46 ? `${dealsCount}+` : '46+';

  return (
    <section className="trust-building-container" aria-label="Why ShopSilo">
      {/* ====================================================================
          SECTION 1: HOW SHOPSILO WORKS (3-Step Horizontal Cards)
          ==================================================================== */}
      <div className="trust-block">
        <div className="trust-block-header">
          <span className="trust-block-pill">
            {isHindi ? 'प्रक्रिया' : 'Workflow'}
          </span>
          <h2 className="trust-block-title">
            {isHindi ? 'शॉपसिलो कैसे काम करता है' : 'How ShopSilo Works'}
          </h2>
        </div>

        <div className="steps-horizontal-grid">
          {steps.map((item) => (
            <div key={item.step} className="step-card">
              <div className="step-card-top">
                <div className="step-icon-wrapper">
                  {item.icon}
                </div>
                <span className="step-number">{item.step}</span>
              </div>
              <h3 className="step-title">{item.title}</h3>
              <p className="step-description">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ====================================================================
          SECTION 2: WHY TRUST SHOPSILO (4 Trust Badges)
          ==================================================================== */}
      <div className="trust-block">
        <div className="trust-block-header">
          <span className="trust-block-pill">
            {isHindi ? 'विश्वसनीयता' : 'Guarantees'}
          </span>
          <h2 className="trust-block-title">
            {isHindi ? 'लोग शॉपसिलो क्यों चुनते हैं' : 'Why People Use ShopSilo'}
          </h2>
        </div>

        <div className="trust-badges-grid">
          {trustBadges.map((badge) => (
            <div key={badge.id} className="trust-reason-card">
              <div className="trust-check-icon">
                <CheckCircle2 size={18} strokeWidth={2.4} />
              </div>
              <span className="trust-reason-text">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ====================================================================
          SECTION 3: LIVE MARKETPLACE STATS
          ==================================================================== */}
      <div className="trust-block">
        <div className="marketplace-stats-bar">
          <div className="stat-card">
            <div className="stat-icon-slot">
              <PackageCheck size={18} />
            </div>
            <div className="stat-meta">
              <div className="stat-number">{displayProducts}</div>
              <div className="stat-label">
                {isHindi ? 'पास में उपलब्ध सामान' : 'Products Nearby'}
              </div>
            </div>
          </div>

          <div className="stat-divider" aria-hidden="true" />

          <div className="stat-card">
            <div className="stat-icon-slot">
              <Store size={18} />
            </div>
            <div className="stat-meta">
              <div className="stat-number">{displayShops}</div>
              <div className="stat-label">
                {isHindi ? 'लोकल दुकानें' : 'Local Shops'}
              </div>
            </div>
          </div>

          <div className="stat-divider" aria-hidden="true" />

          <div className="stat-card">
            <div className="stat-icon-slot">
              <Tag size={18} />
            </div>
            <div className="stat-meta">
              <div className="stat-number">{displayDeals}</div>
              <div className="stat-label">
                {isHindi ? 'सक्रिय ऑफर्स' : 'Active Deals'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBuildingSection;
