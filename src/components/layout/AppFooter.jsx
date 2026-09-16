/**
 * ShopSilo Ecosystem & Multi-Portal Footer Component
 * 
 * Provides search engines and users with a clear directory of:
 * 1. Customer Hyperlocal Marketplace (shopsilo.in)
 * 2. Shop Owner / Merchant OS Portal (shop.shopsilo.in)
 * 3. Super Admin Command Center (admin.shopsilo.in)
 * 4. Legal, Terms & Grievance Compliance
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Store, ShoppingBag, BookOpen, ShieldCheck, ExternalLink, Sparkles, Phone, Mail, MapPin, Tag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AppFooter = () => {
  const { isHindi } = useLanguage();

  return (
    <footer
      style={{
        background: 'var(--bg-surface, #ffffff)',
        borderTop: '1px solid var(--border-subtle, #e2e8f0)',
        marginTop: '40px',
        padding: '36px 20px 90px 20px',
        color: 'var(--text-primary, #0f172a)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Top Ecosystem Portals Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            borderRadius: '24px',
            padding: '24px',
            color: '#ffffff',
            marginBottom: '36px',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
            border: '1px solid #312e81',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ maxWidth: '640px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(79, 70, 229, 0.35)', color: '#c7d2fe', padding: '4px 10px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700, marginBottom: '8px' }}>
                <Sparkles size={13} />
                <span>{isHindi ? 'दुकानदारों के लिए विशेष तकनीक' : 'FOR LOCAL BUSINESS & SHOPKEEPERS'}</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 6px 0', color: '#ffffff' }}>
                {isHindi ? 'अपनी दुकान को ऑनलाइन लाएं और काउंटर बिलिंग शुरू करें' : 'Launch Your Free Store & High-Speed POS Counter'}
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                {isHindi
                  ? 'ShopSilo Merchant OS के साथ बारकोड POS बिलिंग, डिजिटल खाता बही (WhatsApp रिमाइंडर सहित), और रियल-टाइम स्टॉक मैनेज करें।'
                  : 'Empower your retail store with high-speed POS billing, digital customer khata ledger with WhatsApp reminders, and real-time inventory management.'}
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <a
                href="https://shop.shopsilo.in"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                }}
              >
                <Store size={16} />
                <span>{isHindi ? 'दुकानदार पोर्टल लॉगिन' : 'Shop Owner Portal'}</span>
                <ExternalLink size={13} />
              </a>

              <a
                href="https://shop.shopsilo.in/register"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#ffffff',
                  color: '#1e1b4b',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                }}
              >
                <span>{isHindi ? 'मुफ़्त में दुकान जोड़ें' : 'Register Free Shop'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Directory Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '28px',
            marginBottom: '32px',
          }}
        >
          {/* Col 1: Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                }}
              >
                S
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                ShopSilo
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 14px 0' }}>
              {isHindi
                ? 'भारत का प्रमुख हाइपरलोकल रिटेल नेटवर्क। आस-पास की दुकानों का लाइव सामान खोजें और 30 मिनट में पिकअप पाएं।'
                : 'India’s premier hyperlocal retail commerce network. Discover verified neighborhood inventory and reserve 30-minute counter pickups.'}
            </p>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              100% Verified Local Store Guarantee • Made for India 🇮🇳
            </div>
          </div>

          {/* Col 2: Customer Marketplace Links */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              {isHindi ? '🛍️ ग्राहक सेवाएँ' : '🛍️ Shoppers Portal'}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
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

          {/* Col 3: Shop Owner Portals */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              {isHindi ? '🏪 दुकानदार पोर्टल' : '🏪 Shopkeeper Portals'}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
              <li>
                <a href="https://shop.shopsilo.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>{isHindi ? 'दुकानदार मेन डैशबोर्ड' : 'Merchant OS Terminal'}</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://shop.shopsilo.in/login" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  {isHindi ? 'दुकानदार लॉगिन' : 'Store Owner Login'}
                </a>
              </li>
              <li>
                <a href="https://shop.shopsilo.in/register" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  {isHindi ? 'नई दुकान रजिस्टर करें' : 'Create Free Store'}
                </a>
              </li>
              <li>
                <a href="https://shop.shopsilo.in/staff-login" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  {isHindi ? 'कैशियर पिन लॉगिन' : 'Cashier PIN POS Login'}
                </a>
              </li>
              <li>
                <a href="https://admin.shopsilo.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  {isHindi ? 'सुपर एडमिन कंसोल' : 'Admin Control Center'}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust, Safety & Legal */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              {isHindi ? '🛡️ सुरक्षा एवं नियम' : '🛡️ Trust & Legal'}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
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
            <a href="https://shop.shopsilo.in" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>shop.shopsilo.in</a>
            <a href="https://admin.shopsilo.in" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>admin.shopsilo.in</a>
            <a href="https://api.shopsilo.in" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>api.shopsilo.in</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
