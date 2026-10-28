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
    <div
      style={{
        margin: '10px 0 6px 0',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
      aria-label="How ShopSilo Works Guide"
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface, #ffffff)',
          border: '1.5px solid var(--border-subtle, #e2e8f0)',
          borderRadius: '14px',
          padding: '10px 12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}
      >
        {/* Micro Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-primary, #4f46e5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {isHindi ? '💡 शॉपसिलो कैसे काम करता है (3 आसान स्टेप्स)' : '💡 How ShopSilo Works (3 Easy Steps)'}
          </span>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#15803d', backgroundColor: '#dcfce7', padding: '1px 6px', borderRadius: '4px' }}>
            {isHindi ? '0-अग्रिम भुगतान जोखिम' : '0-Risk Pickup'}
          </span>
        </div>

        {/* 1-Row 3 Connected Flow Steps */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
          {/* Step 1: Search */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#f0f4ff',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.72rem',
                flexShrink: 0,
              }}
            >
              1
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isHindi ? '🔍 खोजें' : '🔍 Search'}
              </div>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-muted, #64748b)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isHindi ? 'पास में उपलब्ध' : 'Nearby products'}
              </div>
            </div>
          </div>

          {/* Connected Arrow */}
          <span style={{ color: 'var(--border-strong, #cbd5e1)', fontWeight: 800, fontSize: '0.78rem', flexShrink: 0 }}>›</span>

          {/* Step 2: Compare */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#f0fdf4',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.72rem',
                flexShrink: 0,
              }}
            >
              2
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isHindi ? '⚡ तुलना करें' : '⚡ Compare'}
              </div>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-muted, #64748b)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isHindi ? 'स्थानीय दुकानें' : 'Local stores'}
              </div>
            </div>
          </div>

          {/* Connected Arrow */}
          <span style={{ color: 'var(--border-strong, #cbd5e1)', fontWeight: 800, fontSize: '0.78rem', flexShrink: 0 }}>›</span>

          {/* Step 3: Reserve */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#fdf4ff',
                color: '#c026d3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.72rem',
                flexShrink: 0,
              }}
            >
              3
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isHindi ? '🏪 रिज़र्व करें' : '🏪 Reserve'}
              </div>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-muted, #64748b)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isHindi ? 'काउंटर पिकअप' : 'Counter pickup'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowShopSiloWorksSection;
