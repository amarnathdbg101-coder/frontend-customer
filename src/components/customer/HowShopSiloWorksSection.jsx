/**
 * HowShopSiloWorksSection Component
 *
 * Ultra-Compact 1-Row Connected Stepper Banner (< 65px Height on Mobile).
 * Dismissible with 'X' button for zero vertical screen clutter on home page.
 */

import React, { useState } from 'react';
import { Search, Scale, Store, ShieldCheck, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const HowShopSiloWorksSection = () => {
  const { isHindi } = useLanguage();
  const [isDismissed, setIsDismissed] = useState(() => {
    return typeof window !== 'undefined' && localStorage.getItem('shopsilo_hide_how_it_works') === 'true';
  });

  if (isDismissed) return null;

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shopsilo_hide_how_it_works', 'true');
    }
  };

  return (
    <section className="how-works-banner" style={{ position: 'relative', marginTop: '10px', marginBottom: '10px' }} aria-label={isHindi ? 'शॉपसिलो कैसे काम करता है' : 'How ShopSilo works'}>
      <button
        type="button"
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: '6px',
          right: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted, #94a3b8)',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
        }}
        title={isHindi ? 'बैनर हटाएं' : 'Dismiss banner'}
      >
        <X size={14} />
      </button>

      <div className="how-works-heading" style={{ paddingRight: '24px' }}>
        <h2>{isHindi ? 'ShopSilo कैसे काम करता है' : 'How ShopSilo Works'}</h2>
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
        ].map((step) => (
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
