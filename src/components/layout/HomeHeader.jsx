/**
 * ShopSilo Home Header Component
 * Search-First Small Header:
 * 1. ShopSilo Logo
 * 2. Current Location (GPS / manual location pill)
 * 3. Profile / Menu (SideDrawer trigger + Cart indicator)
 */

import React, { useState } from 'react';
import { MapPin, ChevronDown, Menu, ShoppingCart, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { ShopSiloLogo } from '../common/ShopSiloLogo';
import { SideDrawer } from './SideDrawer';

export const HomeHeader = ({
  locationName,
  isDetecting,
  onOpenLocationModal,
  rightAction = null,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { isHindi } = useLanguage();
  const { cartCount, openCart } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const displayLocation = isDetecting
    ? (isHindi ? 'लोकेशन...' : 'Detecting...')
    : (locationName || (isHindi ? 'लोकल एरिया' : 'Civil Lines, Prayagraj'));

  return (
    <>
      <header className="home-header">
        <div className="home-header-inner">
          {/* 1. ShopSilo Logo */}
          <div className="home-header-left">
            <ShopSiloLogo size={32} showText={true} variant="gradient" to="/" />
          </div>

          {/* 2. Current Location */}
          <div className="home-header-center">
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="home-location-pill"
              title={isHindi ? 'GPS लोकेशन बदलें' : 'Change Delivery Location'}
              aria-label={isHindi ? 'GPS लोकेशन बदलें' : 'Change Delivery Location'}
            >
              <div className="location-pin-circle">
                <MapPin size={13} className="location-pin-icon" />
              </div>
              <div className="location-info">
                <span className="location-label">
                  {isHindi ? 'लोकेशन' : 'Location'}
                </span>
                <span className="location-text">
                  {displayLocation}
                </span>
              </div>
              <ChevronDown size={13} className="location-chevron" />
            </button>
          </div>

          {/* 3. Profile / Menu */}
          <div className="home-header-right">
            {/* Quick Cart Trigger if items in cart */}
            {cartCount > 0 && (
              <button
                type="button"
                onClick={openCart}
                className="home-cart-btn"
                title={isHindi ? 'कार्ट देखें' : 'View Cart'}
                aria-label={isHindi ? 'कार्ट देखें' : 'View Cart'}
              >
                <ShoppingCart size={18} />
                <span className="home-cart-badge">{cartCount > 9 ? '9+' : cartCount}</span>
              </button>
            )}

            {rightAction}

            {/* Profile / Menu Drawer Trigger Button */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="home-profile-menu-btn"
              title={isHindi ? 'प्रोफ़ाइल व मेनू खोलें' : 'Open Profile & Menu'}
              aria-label={isHindi ? 'प्रोफ़ाइल व मेनू खोलें' : 'Open Profile & Menu'}
            >
              <Menu size={18} />
              <div className="home-profile-avatar">
                {isAuthenticated && user?.name ? (
                  <span>{user.name.trim().charAt(0).toUpperCase()}</span>
                ) : (
                  <User size={13} />
                )}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Side Navigation Drawer */}
      <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
};

export default HomeHeader;
