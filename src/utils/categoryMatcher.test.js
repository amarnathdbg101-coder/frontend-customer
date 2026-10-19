import { describe, it, expect } from 'vitest';
import { isProductInCategory, isShopInCategory, getCanonicalCategoryKey } from './categoryMatcher';

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

  const flutterGroceryProduct = {
    id: 'prod-flutter-1',
    name: 'Aashirvaad Shudh Chakki Atta 10kg',
    category_name: 'Grocery & Staples',
    attributes: {
      category_name: 'Grocery & Staples',
      brand: 'Aashirvaad',
    },
  };

  const flutterDairyProduct = {
    id: 'prod-flutter-2',
    name: 'Mother Dairy Classic Curd 400g',
    category_name: 'Dairy, Bakery & Frozen',
    attributes: {
      category_name: 'Dairy, Bakery & Frozen',
    },
  };

  const flutterSnacksProduct = {
    id: 'prod-flutter-3',
    name: 'Haldiram Aloo Bhujia 200g',
    category_name: 'Snacks & Munchies',
    attributes: {
      category_name: 'Snacks & Munchies',
    },
  };

  const flutterMedicineProduct = {
    id: 'prod-flutter-4',
    name: 'Crocin Advance 500mg Tablet',
    category_name: 'Medicine & Healthcare',
    attributes: {
      category_name: 'Medicine & Healthcare',
    },
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

  it('resolves cross-platform category synonyms in 0ms (Flutter <-> Customer <-> Backend)', () => {
    // 1. Flutter "Grocery & Staples" matches customer "Kirana & Grocery" and "kirana-grocery"
    expect(isProductInCategory(flutterGroceryProduct, 'Kirana & Grocery')).toBe(true);
    expect(isProductInCategory(flutterGroceryProduct, 'kirana-grocery')).toBe(true);
    expect(isProductInCategory(flutterGroceryProduct, 'grocery')).toBe(true);
    expect(isProductInCategory(flutterGroceryProduct, 'Grocery & Staples')).toBe(true);

    // 2. Flutter "Dairy, Bakery & Frozen" matches customer "Dairy & Breakfast" and "dairy-breakfast"
    expect(isProductInCategory(flutterDairyProduct, 'Dairy & Breakfast')).toBe(true);
    expect(isProductInCategory(flutterDairyProduct, 'dairy-breakfast')).toBe(true);
    expect(isProductInCategory(flutterDairyProduct, 'dairy')).toBe(true);

    // 3. Flutter "Snacks & Munchies" matches customer "Snacks & Beverages" and "snacks-beverages"
    expect(isProductInCategory(flutterSnacksProduct, 'Snacks & Beverages')).toBe(true);
    expect(isProductInCategory(flutterSnacksProduct, 'snacks-beverages')).toBe(true);
    expect(isProductInCategory(flutterSnacksProduct, 'snacks')).toBe(true);

    // 4. Flutter "Medicine & Healthcare" matches customer "Pharmacy & Healthcare"
    expect(isProductInCategory(flutterMedicineProduct, 'Pharmacy & Healthcare')).toBe(true);
    expect(isProductInCategory(flutterMedicineProduct, 'pharmacy-healthcare')).toBe(true);

    // Negative check: wrong categories don't match
    expect(isProductInCategory(flutterGroceryProduct, 'Electronics & Appliances')).toBe(false);
    expect(isProductInCategory(flutterSnacksProduct, 'Household & Cleaning')).toBe(false);
  });

  it('getCanonicalCategoryKey normalizes various category terms to canonical master keys', () => {
    expect(getCanonicalCategoryKey('Grocery & Staples')).toBe('kirana-grocery');
    expect(getCanonicalCategoryKey('Kirana & Grocery')).toBe('kirana-grocery');
    expect(getCanonicalCategoryKey('kirana-grocery')).toBe('kirana-grocery');
    expect(getCanonicalCategoryKey('dal-pulses')).toBe('kirana-grocery');
    expect(getCanonicalCategoryKey('Dairy, Bakery & Frozen')).toBe('dairy-breakfast');
    expect(getCanonicalCategoryKey('Dairy & Breakfast')).toBe('dairy-breakfast');
    expect(getCanonicalCategoryKey('Snacks & Munchies')).toBe('snacks-beverages');
    expect(getCanonicalCategoryKey('Snacks & Beverages')).toBe('snacks-beverages');
    expect(getCanonicalCategoryKey('Medicine & Healthcare')).toBe('pharmacy-healthcare');
    expect(getCanonicalCategoryKey('Pharmacy & Healthcare')).toBe('pharmacy-healthcare');
  });

  it('matches shops correctly by shop category', () => {
    const shop = {
      name: 'Sharma Kirana Store',
      category: 'Kirana & Grocery',
      description: 'Daily milk, bread, grains and grocery',
    };

    expect(isShopInCategory(shop, 'All')).toBe(true);
    expect(isShopInCategory(shop, 'Kirana & Grocery')).toBe(true);
    expect(isShopInCategory(shop, 'Grocery & Staples')).toBe(true);
    expect(isShopInCategory(shop, 'kirana-grocery')).toBe(true);
    expect(isShopInCategory(shop, 'Clothing & Apparel')).toBe(false);
  });
});
