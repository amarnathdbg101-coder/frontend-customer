import { describe, it, expect } from 'vitest';
import { isProductInCategory, isShopInCategory } from './categoryMatcher';

describe('categoryMatcher Utility', () => {
  const sampleProduct = {
    id: 'prod-123',
    name: 'Amul Taaza Homogenised Toned Milk 1L',
    category_id: '9d165c11-1abe-45d2-aa7f-0e4f49f2ce89',
    category_name: 'Dairy & Breakfast',
    category_slug: 'dairy-breakfast',
    attributes: {
      category_name: 'Dairy & Breakfast',
      brand: 'Amul',
    },
  };

  const sampleClothing = {
    id: 'prod-456',
    name: 'Men Slim Fit Cotton Shirt Blue',
    category_id: 'd0f75113-37ff-415b-ab22-c86b4e0267df',
    category_name: 'Clothing & Apparel',
    category_slug: 'clothing-apparel',
    attributes: {
      category: 'clothing-apparel',
    },
  };

  const sampleGeneralProduct = {
    id: 'prod-789',
    name: 'Tata Salt Vacuum Evaporated 1kg',
    category_name: 'Kirana & Grocery',
    attributes: {},
  };

  it('returns true when category is All or undefined', () => {
    expect(isProductInCategory(sampleProduct, 'All')).toBe(true);
    expect(isProductInCategory(sampleProduct, 'ALL')).toBe(true);
    expect(isProductInCategory(sampleProduct, undefined)).toBe(true);
    expect(isProductInCategory(sampleProduct, '')).toBe(true);
  });

  it('matches product by slug and hyphenated category ID', () => {
    expect(isProductInCategory(sampleProduct, 'dairy-breakfast')).toBe(true);
    expect(isProductInCategory(sampleProduct, 'clothing-apparel')).toBe(false);
  });

  it('matches product by english name with ampersand and spaces', () => {
    expect(isProductInCategory(sampleProduct, 'Dairy & Breakfast')).toBe(true);
    expect(isProductInCategory(sampleClothing, 'Clothing & Apparel')).toBe(true);
    expect(isProductInCategory(sampleClothing, 'clothing-apparel')).toBe(true);
  });

  it('matches product by category ID UUID', () => {
    expect(isProductInCategory(sampleProduct, '9d165c11-1abe-45d2-aa7f-0e4f49f2ce89')).toBe(true);
    expect(isProductInCategory(sampleClothing, 'd0f75113-37ff-415b-ab22-c86b4e0267df')).toBe(true);
  });

  it('matches product by keyword', () => {
    expect(isProductInCategory(sampleGeneralProduct, 'Kirana & Grocery')).toBe(true);
    expect(isProductInCategory(sampleGeneralProduct, 'kirana-grocery')).toBe(true);
  });

  it('matches shops correctly by shop category', () => {
    const shop = {
      name: 'Sharma Kirana Store',
      category: 'Kirana & Grocery',
      description: 'Daily milk, bread, grains and grocery',
    };

    expect(isShopInCategory(shop, 'All')).toBe(true);
    expect(isShopInCategory(shop, 'Kirana & Grocery')).toBe(true);
    expect(isShopInCategory(shop, 'kirana-grocery')).toBe(true);
    expect(isShopInCategory(shop, 'Clothing & Apparel')).toBe(false);
  });
});
