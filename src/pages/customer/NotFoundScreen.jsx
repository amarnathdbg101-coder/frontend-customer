import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ShoppingBag, ArrowLeft, Tag, BookOpen } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { usePageSeo } from '../../hooks/usePageSeo';

export const NotFoundScreen = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  usePageSeo({
    title: '404 - Page Not Found | ShopSilo',
    description: 'The product, store or page you requested could not be found on ShopSilo Hyperlocal Marketplace.',
  });

  return (
    <div style={{
      minHeight: '75vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      textAlign: 'center',
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        background: 'var(--surface, #ffffff)',
        border: '1px solid var(--border, #e2e8f0)',
        borderRadius: '1.25rem',
        padding: '2.5rem 1.75rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
      }}>
        {/* 404 Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.1)',
          color: '#4f46e5',
          marginBottom: '1.25rem',
        }}>
          <Compass size={36} />
        </div>

        <h1 style={{
          fontSize: '2rem',
          fontWeight: '800',
          color: 'var(--text-primary, #0f172a)',
          marginBottom: '0.5rem',
        }}>
          404 - {t('common.not_found') || 'Page Not Found'}
        </h1>

        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary, #64748b)',
          lineHeight: '1.6',
          marginBottom: '2rem',
        }}>
          Aap jis link ya product par click kiye hain, shayad wo expire ho chuka hai ya hata diya gaya hai.
          Neeche diye gaye vikalpo se aage badhein:
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.85rem 1.25rem',
              background: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <ShoppingBag size={18} />
            {t('nav.explore') || 'Explore Neighborhood Shops'}
          </button>

          <button
            onClick={() => navigate('/deals')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.85rem 1.25rem',
              background: 'rgba(234, 88, 12, 0.08)',
              color: '#ea580c',
              border: '1px solid rgba(234, 88, 12, 0.2)',
              borderRadius: '0.75rem',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <Tag size={18} />
            {t('nav.deals') || "Today's Flash Deals"}
          </button>

          <button
            onClick={() => navigate('/khata')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.85rem 1.25rem',
              background: 'var(--surface-muted, #f8fafc)',
              color: 'var(--text-primary, #1e293b)',
              border: '1px solid var(--border, #cbd5e1)',
              borderRadius: '0.75rem',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <BookOpen size={18} />
            {t('nav.khata') || 'My Digital Khata Ledger'}
          </button>

          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.75rem 1.25rem',
              background: 'transparent',
              color: 'var(--text-secondary, #64748b)',
              border: 'none',
              fontSize: '0.9rem',
              cursor: 'pointer',
              marginTop: '0.25rem',
            }}
          >
            <ArrowLeft size={16} />
            {t('nav.back') || 'Go Back'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundScreen;

