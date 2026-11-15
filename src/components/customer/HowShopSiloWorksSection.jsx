/**
 * HowShopSiloWorksSection Component
 *
 * Ultra-Compact 1-Row Connected Stepper Banner (< 65px Height on Mobile).
 * Communicates ShopSilo's 3-step value proposition with zero vertical clutter:
 * 1. 🔍 Search (Nearby products)
 * 2. ⚡ Compare (Local stores)
 * 3. 🏪 Reserve (Counter pickup)
 */

import React from 'react';
import { Search, Scale, Store, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const HowShopSiloWorksSection = () => {
  const { isHindi } = useLanguage();

  return (
    <section className="how-works-banner" aria-label={isHindi ? 'शॉपसिलो कैसे काम करता है' : 'How ShopSilo works'}>
      <div className="how-works-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <h2>{isHindi ? 'ShopSilo कैसे काम करता है' : 'How ShopSilo Works'}</h2>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={12} />
          {isHindi ? '0% अग्रिम भुगतान' : 'Pay at pickup'}
        </span>
      </div>
      <ol className="how-works-steps">
        {[
          {
            icon: <Search size={14} />,
            title: isHindi ? 'खोजें' : 'Search',
            detail: isHindi ? 'पास की दुकानें' : 'Nearby shops',
          },
          {
            icon: <Scale size={14} />,
            title: isHindi ? 'तुलना करें' : 'Compare',
            detail: isHindi ? 'दाम व दूरी' : 'Price & distance',
          },
          {
            icon: <Store size={14} />,
            title: isHindi ? 'पिकअप' : 'Pickup',
            detail: isHindi ? 'दुकान से लें' : 'Store pickup',
          },
        ].map((step, index) => (
          <li className="how-works-step" key={step.title}>
            <span className="how-works-step-number">
              {step.icon}
            </span>
            <span className="how-works-step-copy">
              <strong>{step.title}</strong>
              <small>{step.detail}</small>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default HowShopSiloWorksSection;
