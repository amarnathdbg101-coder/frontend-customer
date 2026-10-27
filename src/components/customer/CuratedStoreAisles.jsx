/**
 * CuratedStoreAisles Component
 *
 * Groups products into thematic horizontal carousels creating visual variety
 * and replacing endless vertical grids:
 * 1. 🔥 Best Deals
 * 2. 🆕 Recently Added
 * 3. ⭐ Popular Products
 * 4. 🎉 Festival Collection
 */

import React, { useMemo } from 'react';
import { CuratedProductShelf } from './CuratedProductShelf';

export const CuratedStoreAisles = ({
  products = [],
  onOpenShelf,
  onSelectCategory,
  onSelectQuickFilter,
  onProductClick,
  isProductSaved,
  onToggleSave,
  shopName,
  shopSlug,
  isHindi = false,
}) => {
  // 1. 🔥 Best Deals (Discounts mrp > price)
  const allDeals = useMemo(() => {
    return products
      .filter((p) => {
        const mrp = Number(p.compare_price || p.mrp || 0);
        const price = Number(p.price || 0);
        return mrp > price && mrp > 0;
      })
      .sort((a, b) => {
        const discA = ((Number(a.compare_price || a.mrp) - Number(a.price)) / Number(a.compare_price || a.mrp)) * 100;
        const discB = ((Number(b.compare_price || b.mrp) - Number(b.price)) / Number(b.compare_price || b.mrp)) * 100;
        return discB - discA;
      });
  }, [products]);

  // 2. 🆕 Recently Added (Latest catalog entries)
  const allRecentlyAdded = useMemo(() => {
    return [...products].reverse();
  }, [products]);

  // 3. ⭐ Popular Products (Bestsellers & high-stock items)
  const allPopular = useMemo(() => {
    return products.filter((p) => {
      const stock = Number(p.available_quantity ?? p.stock_quantity ?? p.stock ?? 1);
      return stock > 0;
    });
  }, [products]);

  // 4. 🎉 Festival & Daily Collection (Gifts, Sweets, Apparel, Appliances)
  const allFestivalCollection = useMemo(() => {
    const keywords = [
      'sweet', 'mithai', 'snack', 'dry fruit', 'gift', 'saree', 'cloth', 'apparel',
      'cooker', 'pot', 'pan', 'appliances', 'utensil', 'decor', 'lamp', 'diya',
      'tea', 'chai', 'coffee', 'festive', 'celebration', 'fashion'
    ];
    return products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const cat = (p.category_name || p.category || '').toLowerCase();
      return keywords.some((kw) => name.includes(kw) || cat.includes(kw));
    });
  }, [products]);

  const handleOpenShelf = (shelfData) => {
    if (onOpenShelf) {
      onOpenShelf(shelfData);
    } else if (shelfData.category) {
      onSelectCategory?.(shelfData.category);
    } else if (shelfData.filterKey) {
      onSelectQuickFilter?.(shelfData.filterKey);
    }
  };

  return (
    <div className="curated-store-aisles" style={{ marginBottom: '20px' }}>
      {/* 1. 🔥 Best Deals Carousel */}
      {allDeals.length >= 2 && (
        <CuratedProductShelf
          title={isHindi ? 'बेस्ट डील्स (Best Deals)' : 'Best Deals'}
          subtitle={isHindi ? 'दुकान की सबसे बड़ी छूट और बचत' : 'Biggest savings & discounts nearby'}
          icon="🔥"
          badgeText={isHindi ? 'डील्स' : 'Deals'}
          badgeBg="#fee2e2"
          badgeColor="#dc2626"
          products={allDeals.slice(0, 10)}
          onViewAll={() =>
            handleOpenShelf({
              id: 'best_deals',
              filterKey: 'DEALS_20',
              title: isHindi ? 'बेस्ट डील्स' : 'Best Deals',
              subtitle: isHindi ? 'दुकान की सबसे बड़ी छूट और बचत' : 'Biggest savings & discounts nearby',
              icon: '🔥',
              badgeBg: '#fee2e2',
              badgeColor: '#dc2626',
              products: allDeals,
            })
          }
          onProductClick={onProductClick}
          isProductSaved={isProductSaved}
          onToggleSave={onToggleSave}
          shopName={shopName}
          shopSlug={shopSlug}
          isHindi={isHindi}
        />
      )}

      {/* 2. 🆕 Recently Added Carousel */}
      {allRecentlyAdded.length >= 2 && (
        <CuratedProductShelf
          title={isHindi ? 'हाल ही में जोड़े गए (Recently Added)' : 'Recently Added'}
          subtitle={isHindi ? 'आस-पास की दुकानों में आए नए सामान' : 'Fresh new arrivals in nearby stores'}
          icon="🆕"
          badgeText={isHindi ? 'नए' : 'New'}
          badgeBg="#eff6ff"
          badgeColor="#2563eb"
          products={allRecentlyAdded.slice(0, 10)}
          onViewAll={() =>
            handleOpenShelf({
              id: 'recently_added',
              title: isHindi ? 'हाल ही में जोड़े गए' : 'Recently Added',
              subtitle: isHindi ? 'आस-पास की दुकानों में आए नए सामान' : 'Fresh new arrivals in nearby stores',
              icon: '🆕',
              badgeBg: '#eff6ff',
              badgeColor: '#2563eb',
              products: allRecentlyAdded,
            })
          }
          onProductClick={onProductClick}
          isProductSaved={isProductSaved}
          onToggleSave={onToggleSave}
          shopName={shopName}
          shopSlug={shopSlug}
          isHindi={isHindi}
        />
      )}

      {/* 3. ⭐ Popular Products Carousel */}
      {allPopular.length >= 2 && (
        <CuratedProductShelf
          title={isHindi ? 'लोकप्रिय उत्पाद (Popular Products)' : 'Popular Products'}
          subtitle={isHindi ? 'ग्राहकों द्वारा सबसे ज्यादा पसंद किए जाने वाले' : 'Most in-demand local preferences'}
          icon="⭐"
          badgeText={isHindi ? 'पॉपुलर' : 'Popular'}
          badgeBg="#fefce8"
          badgeColor="#854d0e"
          products={allPopular.slice(0, 10)}
          onViewAll={() =>
            handleOpenShelf({
              id: 'popular_products',
              filterKey: 'ALL',
              title: isHindi ? 'लोकप्रिय उत्पाद' : 'Popular Products',
              subtitle: isHindi ? 'ग्राहकों द्वारा सबसे ज्यादा पसंद किए जाने वाले' : 'Most in-demand local preferences',
              icon: '⭐',
              badgeBg: '#fefce8',
              badgeColor: '#854d0e',
              products: allPopular,
            })
          }
          onProductClick={onProductClick}
          isProductSaved={isProductSaved}
          onToggleSave={onToggleSave}
          shopName={shopName}
          shopSlug={shopSlug}
          isHindi={isHindi}
        />
      )}

      {/* 4. 🎉 Festival & Daily Collection Carousel */}
      {allFestivalCollection.length >= 2 && (
        <CuratedProductShelf
          title={isHindi ? 'फेस्टिवल कलेक्शन (Festival Collection)' : 'Festival Collection'}
          subtitle={isHindi ? 'त्योहारों के उपहार, कपड़े व खास सामान' : 'Festive gifts, apparel, sweets & home decor'}
          icon="🎉"
          badgeText={isHindi ? 'उत्सव' : 'Festive'}
          badgeBg="#fdf4ff"
          badgeColor="#c026d3"
          products={allFestivalCollection.slice(0, 10)}
          onViewAll={() =>
            handleOpenShelf({
              id: 'festival_collection',
              title: isHindi ? 'फेस्टिवल कलेक्शन' : 'Festival Collection',
              subtitle: isHindi ? 'त्योहारों के उपहार, कपड़े व खास सामान' : 'Festive gifts, apparel, sweets & home decor',
              icon: '🎉',
              badgeBg: '#fdf4ff',
              badgeColor: '#c026d3',
              products: allFestivalCollection,
            })
          }
          onProductClick={onProductClick}
          isProductSaved={isProductSaved}
          onToggleSave={onToggleSave}
          shopName={shopName}
          shopSlug={shopSlug}
          isHindi={isHindi}
        />
      )}
    </div>
  );
};

export default CuratedStoreAisles;
