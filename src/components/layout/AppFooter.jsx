/**
 * Customer App Footer Component
 * 
 * Clean, lightweight, customer-focused footer with essential links,
 * customer support, and legal information.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const AppFooter = () => {
  const { isHindi } = useLanguage();

  return (
    <footer
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: 'auto',
        padding: '48px 0 24px 0',
        transition: 'background-color 0.2s ease',
      }}
    >
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        {/* Directory Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '32px',
            marginBottom: '40px',
          }}
        >
          {/* Col 1: Brand & Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                }}
              >
                S
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                ShopSilo
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 14px 0' }}>
              {isHindi
                ? 'भारत का प्रमुख हाइपरलोकल रिटेल नेटवर्क। आस-पास की दुकानों का लाइव सामान खोजें और 30 मिनट में पिकअप पाएं।'
                : 'India’s premier hyperlocal retail commerce network. Discover verified neighborhood inventory and reserve 30-minute counter pickups.'}
            </p>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              100% Verified Local Store Guarantee • Made for India 🇮🇳
            </div>
          </div>

          {/* Col 2: Customer Marketplace Links */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', color: 'var(--text-primary)' }}>
              {isHindi ? '🛍️ ग्राहक सेवाएँ' : '🛍️ Shoppers Portal'}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
              <li>
                <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  {isHindi ? 'आस-पास की दुकानें' : 'Explore Neighborhood Shops'}
                </Link>
              </li>
              <li>
                <Link to="/deals" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  {isHindi ? 'दैनिक बचत व डिस्काउंट' : 'Daily Bargains & Flash Offers'}
                </Link>
              </li>
              <li>
                <Link to="/reservations" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  {isHindi ? 'मेरी बुकिंग्स एवं पिकअप कोड' : 'My Pickups & Hold OTPs'}
                </Link>
              </li>
              <li>
                <Link to="/khata" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  {isHindi ? 'डिजिटल खाता (उधार पासबुक)' : 'Customer Khata Passbook'}
                </Link>
              </li>
              <li>
                <Link to="/saved" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  {isHindi ? 'पसंदीदा सामान व स्टोर' : 'Saved Items & Watchlist'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Trust, Safety & Legal */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', color: 'var(--text-primary)' }}>
              {isHindi ? '🛡️ सुरक्षा एवं नियम' : '🛡️ Trust & Legal'}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
              <li>
                <a href="/terms.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  {isHindi ? 'सेवा की शर्तें (Terms)' : 'Terms of Service'}
                </a>
              </li>
              <li>
                <a href="/privacy.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  {isHindi ? 'गोपनीयता नीति (Privacy)' : 'Privacy Policy'}
                </a>
              </li>
              <li>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {isHindi ? 'हेल्पलाइन: +91 7979014637' : 'Support: +91 7979014637'}
                </span>
              </li>
              <li>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  IT Rules 2021 Grievance Officer: grievance@shopsilo.in
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © 2026 <strong>ShopSilo Technologies India Pvt. Ltd.</strong> (shopsilo.in). All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="https://shopsilo.in" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>shopsilo.in</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
