import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Store, Package } from 'lucide-react';
import { useSaved } from '../../context/SavedContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { ProductCard } from '../../components/cards/ProductCard';
import { ShopCard } from '../../components/cards/ShopCard';
import { EmptyState } from '../../components/ui/EmptyState';

export const SavedScreen = () => {
  const navigate = useNavigate();
  const { savedProducts, savedShops, toggleSaveProduct, toggleSaveShop } = useSaved();
  const { t, isHindi } = useLanguage();

  const [activeTab, setActiveTab] = React.useState('products');

  return (
    <AppLayout title={t('saved.title')} subtitle={t('saved.subtitle')}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('products')}
          className={`btn btn-sm ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Package size={14} />
          <span>{t('saved.saved_products')} ({savedProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('shops')}
          className={`btn btn-sm ${activeTab === 'shops' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Store size={14} />
          <span>{t('saved.saved_shops')} ({savedShops.length})</span>
        </button>
      </div>

      {activeTab === 'products' ? (
        savedProducts.length === 0 ? (
          <EmptyState
            icon={<Heart size={48} color="var(--text-muted)" />}
            title={t('saved.no_saved_products')}
            actionLabel={t('saved.browse_deals')}
            onAction={() => navigate('/deals')}
          />
        ) : (
          <div className="products-grid">
            {savedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isSaved={true}
                onToggleSave={() => toggleSaveProduct(p)}
                onClick={() => navigate(`/shop/${p.shop_slug || ''}`)}
              />
            ))}
          </div>
        )
      ) : (
        savedShops.length === 0 ? (
          <EmptyState
            icon={<Store size={48} color="var(--text-muted)" />}
            title={t('saved.no_saved_shops')}
            actionLabel={t('nav.explore')}
            onAction={() => navigate('/')}
          />
        ) : (
          <div className="shops-grid">
            {savedShops.map((s) => (
              <ShopCard
                key={s.id}
                shop={s}
                isSaved={true}
                onToggleSave={() => toggleSaveShop(s)}
                onClick={() => navigate(`/shop/${s.slug}`)}
                onNavigate={(path) => navigate(path)}
              />
            ))}
          </div>
        )
      )}
    </AppLayout>
  );
};
export default SavedScreen;
