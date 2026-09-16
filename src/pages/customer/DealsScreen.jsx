import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Sparkles, Store, ShoppingBag } from 'lucide-react';
import { dealsApi } from '../../api/deals.api';
import { reservationApi } from '../../api/reservation.api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { ProductCard } from '../../components/cards/ProductCard';
import { ProductDetailModal } from '../../components/common/ProductDetailModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonProductGrid } from '../../components/ui/Skeleton';

export const DealsScreen = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, isHindi } = useLanguage();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const res = await dealsApi.getLiveDeals();
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setDeals(list);
    } catch (err) {
      console.error('Failed to load deals:', err);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (reservationData) => {
    try {
      await reservationApi.createReservation(reservationData);
      alert(t('checkout.reservation_success_title'));
      navigate('/reservations');
    } catch (err) {
      alert(err.response?.data?.message || (isHindi ? 'आरक्षण विफल रहा' : 'Reservation failed'));
    }
  };

  return (
    <AppLayout title={t('nav.deals')} subtitle={isHindi ? 'विशेष छूट एवं डिस्काउंट उत्पाद' : 'Exclusive discounts & discounted products'}>
      {loading ? (
        <SkeletonProductGrid count={6} />
      ) : deals.length === 0 ? (
        <EmptyState
          icon={<Tag size={48} color="var(--text-muted)" />}
          title={isHindi ? 'कोई सक्रिय ऑफर उपलब्ध नहीं है' : 'No Live Deals Available'}
          message={isHindi ? 'दुकानदारों द्वारा नए ऑफर्स जोड़े जाने पर यहाँ दिखाई देंगे।' : 'Check back later for exclusive deals from local merchants.'}
          actionLabel={t('nav.explore')}
          onAction={() => navigate('/')}
        />
      ) : (
        <div className="products-grid">
          {deals.map((deal) => (
            <ProductCard
              key={deal.id}
              product={deal}
              onClick={() => setSelectedProduct(deal)}
            />
          ))}
        </div>
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onReserve={handleReserve}
        />
      )}
    </AppLayout>
  );
};
export default DealsScreen;
