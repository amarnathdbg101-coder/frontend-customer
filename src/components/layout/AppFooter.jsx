/**
 * Customer App Footer Component
 * 
 * Ultra-Compact, Mobile-First Accordion Footer.
 * Reduces total vertical footprint by over 70% while providing
 * instant expandable access to Shopper Portal, Trust & Legal, and Support.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ShieldCheck, ExternalLink, Phone, Mail, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ShopSiloLogo } from '../common/ShopSiloLogo';

export const AppFooter = () => {
  const { isHindi } = useLanguage();
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (sectionKey) => {
    setOpenSection((prev) => (prev === sectionKey ? null : sectionKey));
  };

  return (
    <footer
      className="app-footer-container"
      style={{
        backgroundColor: 'var(--bg-surface, #ffffff)',
        borderTop: '1px solid var(--border-subtle, #e2e8f0)',
        marginTop: 'auto',
        padding: '16px 0 16px 0',
        fontSize: '0.8rem',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px' }}>
        {/* Brand Header */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShopSiloLogo size={22} showText={true} variant="gradient" />
          </div>
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 600,
              color: 'var(--text-secondary, #64748b)',
              marginTop: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ShieldCheck size={13} color="#10b981" />
            <span>{isHindi ? 'सत्यापित स्थानीय व्यापार नेटवर्क' : 'Verified local commerce network.'}</span>
          </div>
        </div>

        {/* Compact Accordion Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          {/* Section 1: Shopper Portal */}
          <div
            style={{
              border: '1px solid var(--border-subtle, #e2e8f0)',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={() => toggleSection('shopper')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.82rem',
                color: 'var(--text-primary, #0f172a)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>🛍️ {isHindi ? 'ग्राहक सेवाएँ (Shopper Portal)' : 'Shopper Portal'}</span>
              {openSection === 'shopper' ? (
                <ChevronUp size={16} color="var(--color-primary, #2563eb)" />
              ) : (
                <ChevronDown size={16} color="var(--text-muted, #94a3b8)" />
              )}
            </button>

            {openSection === 'shopper' && (
              <div style={{ padding: '4px 12px 12px 12px', borderTop: '1px solid var(--border-subtle, #e2e8f0)' }}>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '0.78rem',
                  }}
                >
                  <li>
                    <Link to="/" style={{ color: 'var(--color-primary, #2563eb)', textDecoration: 'none', fontWeight: 600 }}>
                      • {isHindi ? 'आस-पास की दुकानें देखें' : 'Explore Neighborhood Shops'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/deals" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                      • {isHindi ? 'दैनिक बचत व डिस्काउंट' : 'Daily Bargains & Flash Offers'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/reservations" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                      • {isHindi ? 'मेरी बुकिंग्स एवं पिकअप कोड' : 'My Pickups & Hold OTPs'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/khata" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                      • {isHindi ? 'डिजिटल खाता पासबुक' : 'Customer Khata Passbook'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/saved" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                      • {isHindi ? 'पसंदीदा सामान व स्टोर' : 'Saved Items & Watchlist'}
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Section 2: Trust & Legal */}
          <div
            style={{
              border: '1px solid var(--border-subtle, #e2e8f0)',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={() => toggleSection('trust')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.82rem',
                color: 'var(--text-primary, #0f172a)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>🛡️ {isHindi ? 'सुरक्षा एवं नियम (Trust & Legal)' : 'Trust & Legal'}</span>
              {openSection === 'trust' ? (
                <ChevronUp size={16} color="var(--color-primary, #2563eb)" />
              ) : (
                <ChevronDown size={16} color="var(--text-muted, #94a3b8)" />
              )}
            </button>

            {openSection === 'trust' && (
              <div style={{ padding: '4px 12px 12px 12px', borderTop: '1px solid var(--border-subtle, #e2e8f0)' }}>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '0.78rem',
                  }}
                >
                  <li>
                    <a
                      href="/terms.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      • {isHindi ? 'सेवा की शर्तें' : 'Terms of Service'} <ExternalLink size={10} />
                    </a>
                  </li>
                  <li>
                    <a
                      href="/privacy.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      • {isHindi ? 'गोपनीयता नीति' : 'Privacy Policy'} <ExternalLink size={10} />
                    </a>
                  </li>
                  <li style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                    • IT Rules 2021 Grievance Officer: <strong>grievance@shopsilo.in</strong>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Section 3: Support */}
          <div
            style={{
              border: '1px solid var(--border-subtle, #e2e8f0)',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={() => toggleSection('support')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.82rem',
                color: 'var(--text-primary, #0f172a)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>💬 {isHindi ? 'सहायता एवं सपोर्ट (Support)' : 'Support'}</span>
              {openSection === 'support' ? (
                <ChevronUp size={16} color="var(--color-primary, #2563eb)" />
              ) : (
                <ChevronDown size={16} color="var(--text-muted, #94a3b8)" />
              )}
            </button>

            {openSection === 'support' && (
              <div style={{ padding: '4px 12px 12px 12px', borderTop: '1px solid var(--border-subtle, #e2e8f0)' }}>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '0.78rem',
                  }}
                >
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={12} color="var(--color-primary, #2563eb)" />
                    <a href="tel:+917979014637" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 700 }}>
                      +91 7979014637
                    </a>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageCircle size={12} color="#16a34a" />
                    <a
                      href="https://wa.me/917979014637?text=Hello%20ShopSilo%20Support"
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 700 }}
                    >
                      Instant WhatsApp Help
                    </a>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={12} color="var(--text-muted)" />
                    <a href="mailto:support@shopsilo.in" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                      support@shopsilo.in
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Minimalist Bottom Bar */}
        <div
          style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted, #94a3b8)',
            textAlign: 'center',
            paddingTop: '6px',
            borderTop: '1px dashed var(--border-subtle, #e2e8f0)',
          }}
        >
          © 2026 <strong>ShopSilo Technologies India Pvt. Ltd.</strong> • shopsilo.in
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
