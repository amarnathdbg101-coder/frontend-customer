/**
 * CuratedStoreAisles Component
 * Dynamically computes thematic aisles (shelves) from a store's catalog:
 * 1. ⚡ Super Saver Deals (Discounts >= 10%)
 * 2. 🏷️ Budget Corner (Under ₹99 / Under ₹49)
 * 3. ☕ Chai, Snacks & Refreshments
 * 4. 🧼 Home Hygiene, Soap & Care
 * 5. 🔥 Bestsellers & Top Daily Picks
 * 
 * Clicking "View All" or "See More" opens a dedicated collection page view
 * with the full list of products for that shelf.
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
  // 1. All Deals & Offers Products (Discounts >= 10%)
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

  // 2. All Budget Corner Products (Under ₹99)
  const allBudget = useMemo(() => {
    return products
      .filter((p) => {
        const price = Number(p.price || 0);
        return price > 0 && price <= 99;
      })
      .sort((a, b) => Number(a.price) - Number(b.price));
  }, [products]);

  // 3. All Snacks & Beverages Products (Chai, Biscuits, Refreshments)
  const allSnacks = useMemo(() => {
    const keywords = [
      'snack', 'biscuit', 'cookie', 'namkeen', 'chips', 'wafer', 'toast', 'rusk',
      'chai', 'tea', 'coffee', 'juice', 'beverage', 'drink', 'water', 'soda', 'cola',
      'energy', 'munchies', 'sweet', 'chikki', 'mixture', 'bhujia', 'crisp'
    ];

    return products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const cat = (p.category_name || p.category || '').toLowerCase();
      return keywords.some((kw) => name.includes(kw) || cat.includes(kw));
    });
  }, [products]);

  // 4. All Household, Hygiene & Personal Care Products
  const allHygiene = useMemo(() => {
    const keywords = [
      'soap', 'sabun', 'detergent', 'surf', 'rin', 'tide', 'shampoo', 'paste',
      'toothpaste', 'brush', 'cleaner', 'wash', 'harpic', 'dettol', 'lifebuoy',
      'sanitizer', 'disinfectant', 'cream', 'lotion', 'oil', 'hair', 'grooming',
      'face', 'hand', 'clean', 'bath', 'sponge', 'agarbatti', 'dhoop'
    ];

    return products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const cat = (p.category_name || p.category || '').toLowerCase();
      return keywords.some((kw) => name.includes(kw) || cat.includes(kw));
    });
  }, [products]);

  // 5. All Popular Bestsellers (Top in-stock items)
  const allPopular = useMemo(() => {
    return products.filter((p) => {
      const stock = Number(p.available_quantity ?? p.stock_quantity ?? p.stock ?? 1);
      return stock > 0;
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
    <div className="curated-store-aisles" style={{ marginBottom: '16px' }}>
      {/* 1. Deals Shelf */}
      {allDeals.length >= 2 && (
        <CuratedProductShelf
          title={isHindi ? 'सुपर सेवर डील्स' : 'Super Saver Deals'}
          subtitle={isHindi ? 'दुकान की सबसे बड़ी छूट और बचत' : 'Biggest savings & discounts in store'}
          icon="⚡"
          badgeText={isHindi ? 'छूट' : 'Deals'}
          badgeBg="#fef2f2"
          badgeColor="#dc2626"
          products={allDeals.slice(0, 10)}
          onViewAll={() =>
            handleOpenShelf({
              id: 'deals',
              filterKey: 'DEALS_20',
              title: isHindi ? 'सुपर सेवर डील्स' : 'Super Saver Deals',
              subtitle: isHindi ? 'दुकान की सबसे बड़ी छूट और बचत' : 'Biggest savings & discounts in store',
              icon: '⚡',
              badgeBg: '#fef2f2',
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

      {/* 2. Budget Under ₹99 Shelf */}
      {allBudget.length >= 2 && (
        <CuratedProductShelf
          title={isHindi ? 'बजट स्टोर (₹99 से कम)' : 'Budget Store (Under ₹99)'}
          subtitle={isHindi ? 'किफायती और रोजाना काम आने वाले सामान' : 'Affordable daily necessities'}
          icon="🏷️"
          badgeText="< ₹99"
          badgeBg="#ecfdf5"
          badgeColor="#059669"
          products={allBudget.slice(0, 10)}
          onViewAll={() =>
            handleOpenShelf({
              id: 'budget_under_99',
              filterKey: 'UNDER_99',
              title: isHindi ? 'बजट स्टोर (₹99 से कम)' : 'Budget Store (Under ₹99)',
              subtitle: isHindi ? 'किफायती और रोजाना काम आने वाले सामान' : 'Affordable daily necessities',
              icon: '🏷️',
              badgeBg: '#ecfdf5',
              badgeColor: '#059669',
              products: allBudget,
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

      {/* 3. Snacks & Tea Time Shelf */}
      {allSnacks.length >= 2 && (
        <CuratedProductShelf
          title={isHindi ? 'चाय, नाश्ता व रिफ्रेशमेंट' : 'Tea Time & Snacks'}
          subtitle={isHindi ? 'बिस्कुट, नमकीन, चाय और ड्रिंक्स' : 'Biscuits, namkeen, tea & refreshments'}
          icon="☕"
          badgeText={isHindi ? 'नाश्ता' : 'Snacks'}
          badgeBg="#fffbeb"
          badgeColor="#d97706"
          products={allSnacks.slice(0, 10)}
          onViewAll={() =>
            handleOpenShelf({
              id: 'tea_snacks',
              category: 'Snacks',
              title: isHindi ? 'चाय, नाश्ता व रिफ्रेशमेंट' : 'Tea Time & Snacks',
              subtitle: isHindi ? 'बिस्कुट, नमकीन, चाय और ड्रिंक्स' : 'Biscuits, namkeen, tea & refreshments',
              icon: '☕',
              badgeBg: '#fffbeb',
              badgeColor: '#d97706',
              products: allSnacks,
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

      {/* 4. Hygiene & Household Care Shelf */}
      {allHygiene.length >= 2 && (
        <CuratedProductShelf
          title={isHindi ? 'घर की सफाई व पर्सनल केयर' : 'Home Hygiene & Personal Care'}
          subtitle={isHindi ? 'साबुन, डिटर्जेंट, शैम्पू व साफ-सफाई' : 'Soaps, detergents, cleaners & grooming'}
          icon="🧼"
          badgeText={isHindi ? 'केयर' : 'Care'}
          badgeBg="#f0fdf4"
          badgeColor="#16a34a"
          products={allHygiene.slice(0, 10)}
          onViewAll={() =>
            handleOpenShelf({
              id: 'home_hygiene',
              category: 'Cleaning',
              title: isHindi ? 'घर की सफाई व पर्सनल केयर' : 'Home Hygiene & Personal Care',
              subtitle: isHindi ? 'साबुन, डिटर्जेंट, शैम्पू व साफ-सफाई' : 'Soaps, detergents, cleaners & grooming',
              icon: '🧼',
              badgeBg: '#f0fdf4',
              badgeColor: '#16a34a',
              products: allHygiene,
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

      {/* 5. Popular Bestsellers Shelf */}
      {allPopular.length >= 3 && allDeals.length < 2 && allBudget.length < 2 && (
        <CuratedProductShelf
          title={isHindi ? 'दुकान के लोकप्रिय सामान' : 'Store Bestsellers'}
          subtitle={isHindi ? 'ग्राहकों द्वारा सबसे ज्यादा पसंद किए जाने वाले' : 'Most preferred daily items'}
          icon="🔥"
          badgeText={isHindi ? 'पॉपुलर' : 'Popular'}
          badgeBg="#eff6ff"
          badgeColor="#2563eb"
          products={allPopular.slice(0, 10)}
          onViewAll={() =>
            handleOpenShelf({
              id: 'popular_items',
              filterKey: 'ALL',
              title: isHindi ? 'दुकान के लोकप्रिय सामान' : 'Store Bestsellers',
              subtitle: isHindi ? 'ग्राहकों द्वारा सबसे ज्यादा पसंद किए जाने वाले' : 'Most preferred daily items',
              icon: '🔥',
              badgeBg: '#eff6ff',
              badgeColor: '#2563eb',
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
    </div>
  );
};
