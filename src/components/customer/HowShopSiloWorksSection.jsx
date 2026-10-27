/**
 * HowShopSiloWorksSection Component
 *
 * Compact, Visually Premium 3-Step Flow Guide.
 * Helps first-time users understand the complete ShopSilo experience
 * in under 5 seconds:
 * 🔍 1. Search -> Find products available nearby
 * 💰 2. Compare -> Compare multiple local shops
 * 🏪 3. Reserve -> Reserve and pickup locally
 */

import React from 'react';
import { Search, Store, Coins } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const HowShopSiloWorksSection = () => {
  const { isHindi } = useLanguage();

  const steps = [
    {
      id: 'search',
      icon: Search,
      title: isHindi ? '1. खोजें (Search)' : '1. Search',
      subtitle: isHindi ? 'आस-पास उपलब्ध सामान खोजें' : 'Find products available nearby',
      iconBg: 'rgba(37, 99, 235, 0.1)',
      iconColor: '#2563eb',
    },
    {
      id: 'compare',
      icon: Coins,
      title: isHindi ? '2. तुलना करें (Compare)' : '2. Compare',
      subtitle: isHindi ? 'विभिन्न स्थानीय दुकानों के दाम तुलना करें' : 'Compare multiple local shops',
      iconBg: 'rgba(16, 185, 129, 0.1)',
      iconColor: '#10b981',
    },
    {
      id: 'reserve',
      icon: Store,
      title: isHindi ? '3. रिज़र्व करें (Reserve)' : '3. Reserve',
      subtitle: isHindi ? 'मुफ़्त रिज़र्व करें और दुकान से लें' : 'Reserve and pickup locally',
      iconBg: 'rgba(139, 92, 246, 0.1)',
      iconColor: '#8b5cf6',
    },
  ];

  return (
    <div
      style={{
        margin: '16px auto 8px auto',
        maxWidth: '1200px',
        padding: '0 16px',
      }}
    >
      {/* Section Tag */}
      <div
        style={{
          fontSize: '0.68rem',
          fontWeight: 800,
          color: 'var(--text-muted, #94a3b8)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '8px',
        }}
      >
        {isHindi ? 'शॉपसिलो कैसे काम करता है' : 'How ShopSilo Works'}
      </div>

      {/* 3 Compact Horizontal Step Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '10px',
        }}
      >
        {steps.map((step) => {
          const IconComp = step.icon;

          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                backgroundColor: 'var(--bg-surface, #ffffff)',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: step.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconComp size={18} color={step.iconColor} />
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    color: 'var(--text-primary, #0f172a)',
                    lineHeight: 1.2,
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    fontSize: '0.73rem',
                    color: 'var(--text-secondary, #64748b)',
                    lineHeight: 1.25,
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={step.subtitle}
                >
                  {step.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HowShopSiloWorksSection;
