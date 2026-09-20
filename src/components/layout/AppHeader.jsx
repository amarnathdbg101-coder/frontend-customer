/**
 * Customer Top App Header Component
 * Pixel-perfect match with Shopsilo Mobile OS Dark Header Card:
 * - Hamburger Menu Button (Left)
 * - Brand Logo: "🛍️ ShopSilo" + "LOCAL • COUNTER PICKUP" (Center)
 * - Orders Button: "[📦 Orders]" (Right)
 * - Location & Radius Pill Bar: "📍 5X28+M8V, Diwari ⌵" + "• 3km Radius"
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Package, MapPin, ChevronDown, Crosshair, ArrowLeft } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { SideDrawer } from './SideDrawer';

const RADIUS_OPTIONS = [
  { label: '1 km', value: 1 },
  { label: '3 km', value: 3 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: 'All', value: 999 },
];

export const AppHeader = ({ title, showBack = false }) => {
  const navigate = useNavigate();
  const { locationName, radiusKm, setRadiusKm, detectLocation, isDetecting } = useLocation();
  const { isHindi } = useLanguage();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isRadiusDropdownOpen, setIsRadiusDropdownOpen] = useState(false);

  return (
    <>
      <header
        style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '12px 16px 14px 16px',
          borderBottomLeftRadius: '24px',
          borderBottomRightRadius: '24px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        {/* Top Header Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}
        >
          {/* Left: Back button or Hamburger Menu Button */}
          {showBack ? (
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
              }}
              title="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              title={isHindi ? 'मेनू खोलें' : 'Open Menu'}
            >
              <Menu size={20} />
            </button>
          )}

          {/* Center: Brand Title & Counter Pickup Tag */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '1.2rem',
                fontWeight: 900,
                letterSpacing: '-0.4px',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>🛍️</span>
              <span style={{ background: 'linear-gradient(to right, #ffffff, #e2e8f0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ShopSilo
              </span>
            </div>
            <div
              style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                letterSpacing: '1px',
                color: '#94a3b8',
                textTransform: 'uppercase',
                marginTop: '1px',
              }}
            >
              LOCAL • COUNTER PICKUP
            </div>
          </div>

          {/* Right: Orders Button */}
          <button
            type="button"
            onClick={() => navigate('/reservations')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(96, 165, 250, 0.35)',
              color: '#60a5fa',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Package size={15} />
            <span>{isHindi ? 'ऑर्डर्स' : 'Orders'}</span>
          </button>
        </div>

        {/* Bottom Row: Location & Radius Pill Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            padding: '7px 12px',
            gap: '8px',
            position: 'relative',
          }}
        >
          {/* Location Name & GPS Trigger */}
          <div
            onClick={detectLocation}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              flex: 1,
              minWidth: 0,
            }}
            title={isHindi ? 'GPS लोकेशन अपडेट करें' : 'Update GPS Location'}
          >
            <MapPin size={15} color="#f59e0b" style={{ flexShrink: 0 }} />
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#f8fafc',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {isDetecting ? (isHindi ? 'लोकेशन खोज रहे हैं...' : 'Detecting GPS...') : (locationName || '5X28+M8V, Diwari')}
            </span>
            <ChevronDown size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
          </div>

          {/* Radius Pill Trigger */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsRadiusDropdownOpen(!isRadiusDropdownOpen)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                fontSize: '0.74rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '20px',
                cursor: 'pointer',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span>{radiusKm === 999 ? (isHindi ? 'सभी क्षेत्र' : 'All Area') : `${radiusKm}km Radius`}</span>
            </button>

            {/* Radius Options Dropdown */}
            {isRadiusDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '6px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  padding: '4px',
                  zIndex: 60,
                  minWidth: '110px',
                }}
              >
                {RADIUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setRadiusKm(opt.value);
                      setIsRadiusDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: radiusKm === opt.value ? '#4f46e5' : 'transparent',
                      color: '#ffffff',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{opt.label}</span>
                    {radiusKm === opt.value && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Side Navigation Drawer */}
      <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
};

export default AppHeader;
