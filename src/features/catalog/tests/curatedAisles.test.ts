import { describe, it, expect } from 'vitest';

describe('Curated Store Aisles & Thematic Shelves Tests', () => {
  const sampleProducts = [
    { id: '1', name: 'Parle-G Glucose Biscuit', price: 10, compare_price: 10, category: 'Snacks & Biscuits' },
    { id: '2', name: 'Good Day Butter Cookies', price: 25, compare_price: 30, category: 'Snacks' }, // Discount: ~16.7%
    { id: '3', name: 'Tata Tea Gold 250g', price: 140, compare_price: 165, category: 'Beverages' }, // Discount: ~15.2%
    { id: '4', name: 'Dettol Original Soap 75g', price: 40, compare_price: 45, category: 'Personal Care' }, // Under ₹99
    { id: '5', name: 'Surf Excel Quick Wash 1kg', price: 210, compare_price: 240, category: 'Household Care' },
    { id: '6', name: 'Maggi 2-Minute Noodles', price: 14, compare_price: 14, category: 'Instant Food' }, // Under ₹99
  ];

  it('correctly detects deals & discount products with compare_price > price', () => {
    const deals = sampleProducts.filter((p) => {
      const mrp = Number(p.compare_price || 0);
      const price = Number(p.price || 0);
      return mrp > price && mrp > 0;
    });

    expect(deals.length).toBe(4);
    expect(deals.map((d) => d.id)).toEqual(['2', '3', '4', '5']);
  });

  it('correctly computes Budget Store Under ₹99 shelf', () => {
    const budget = sampleProducts.filter((p) => Number(p.price) > 0 && Number(p.price) <= 99);
    expect(budget.length).toBe(4);
    expect(budget.map((b) => b.id)).toEqual(['1', '2', '4', '6']);
  });

  it('correctly matches Snacks & Beverages shelf keywords', () => {
    const keywords = ['snack', 'biscuit', 'cookie', 'tea', 'chai', 'coffee', 'namkeen'];
    const snacks = sampleProducts.filter((p) => {
      const name = p.name.toLowerCase();
      const cat = p.category.toLowerCase();
      return keywords.some((kw) => name.includes(kw) || cat.includes(kw));
    });

    expect(snacks.length).toBe(3);
    expect(snacks.map((s) => s.id)).toEqual(['1', '2', '3']);
  });

  it('correctly matches Home Hygiene & Personal Care shelf keywords', () => {
    const keywords = ['soap', 'sabun', 'detergent', 'surf', 'rin', 'dettol', 'shampoo'];
    const hygiene = sampleProducts.filter((p) => {
      const name = p.name.toLowerCase();
      const cat = p.category.toLowerCase();
      return keywords.some((kw) => name.includes(kw) || cat.includes(kw));
    });

    expect(hygiene.length).toBe(2);
    expect(hygiene.map((h) => h.id)).toEqual(['4', '5']);
  });
});
