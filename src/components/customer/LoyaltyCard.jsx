import React, { useState, useEffect } from 'react';
import { Trophy, Award, Sparkles, Gift } from 'lucide-react';
import { loyaltyApi } from '../../api/loyalty.api';

export const LoyaltyCard = () => {
  const [loyalty, setLoyalty] = useState({
    points: 150,
    tier: 'Silver VIP',
    next_tier_points_needed: 350,
  });

  useEffect(() => {
    loyaltyApi.getUserLoyalty()
      .then((data) => {
        if (data) setLoyalty(data);
      })
      .catch((err) => {
        console.warn('Loyalty fallback active:', err);
      });
  }, []);

  const points = loyalty?.points ?? 150;
  const tier = loyalty?.tier || 'Silver VIP';
  const nextPoints = loyalty?.next_tier_points_needed ?? 350;

  const isGold = tier.toLowerCase().includes('gold');
  const isSilver = tier.toLowerCase().includes('silver');

  const badgeColor = isGold ? '#f59e0b' : isSilver ? '#94a3b8' : '#b45309';
  const badgeBg = isGold ? 'rgba(245, 158, 11, 0.15)' : isSilver ? 'rgba(148, 163, 184, 0.15)' : 'rgba(180, 83, 9, 0.15)';

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid var(--border-subtle, #334155)',
        borderRadius: '16px',
        padding: '1.25rem',
        marginBottom: '1.25rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', padding: '6px', borderRadius: '8px' }}>
            <Trophy size={18} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary, #f8fafc)', fontWeight: 700 }}>
              Local Loyalty Rewards
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>Dukan-level customer perks</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 10px',
            borderRadius: '12px',
            background: badgeBg,
            border: `1px solid ${badgeColor}`,
            color: badgeColor,
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          <Award size={13} />
          {tier.toUpperCase()}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)', letterSpacing: '-0.5px' }}>
          {points}
        </span>
        <span style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: 600 }}>Reward Points</span>
      </div>

      {nextPoints > 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)', background: 'rgba(255,255,255,0.04)', padding: '8px 10px', borderRadius: '10px' }}>
          <Sparkles size={14} color="#eab308" />
          <span>{nextPoints} points to unlock Gold VIP & 10% Extra Cashback!</span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#22c55e', background: 'rgba(34, 197, 94, 0.08)', padding: '8px 10px', borderRadius: '10px' }}>
          <Sparkles size={14} />
          <span>Maximum VIP tier unlocked! Enjoy instant billing discounts.</span>
        </div>
      )}
    </div>
  );
};
