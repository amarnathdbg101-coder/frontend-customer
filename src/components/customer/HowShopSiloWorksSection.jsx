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
import { useLanguage } from '../../context/LanguageContext';

export const HowShopSiloWorksSection = () => {
  const { isHindi } = useLanguage();

  return (
    <section className="how-works-banner" aria-label={isHindi ? 'शॉपसिलो कैसे काम करता है' : 'How ShopSilo works'}>
      <div className="how-works-heading">
        <h2>{isHindi ? 'कैसे काम करता है' : 'How it works'}</h2>
        <span>{isHindi ? 'पिकअप पर भुगतान' : 'Pay at pickup'}</span>
      </div>
      <ol className="how-works-steps">
        {[
          { title: isHindi ? 'खोजें' : 'Search', detail: isHindi ? 'पास की दुकानें' : 'Nearby shops' },
          { title: isHindi ? 'तुलना करें' : 'Compare', detail: isHindi ? 'दिए गए विवरण' : 'Listed details' },
          { title: isHindi ? 'रिज़र्व करें' : 'Reserve', detail: isHindi ? 'दुकान से पिकअप' : 'Store pickup' },
        ].map((step, index) => (
          <li className="how-works-step" key={step.title}>
            <span className="how-works-step-number">{index + 1}</span>
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
