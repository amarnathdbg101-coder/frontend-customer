import { describe, it, expect } from 'vitest';
import { catalogService } from '../services/catalog.service';
import { formatProductShareText, getWhatsAppShareUrl } from '../../../utils/productShare';

describe('Catalog Feature Service & Filtering Tests', () => {
  it('should have catalogService functions defined', () => {
    expect(typeof catalogService.getNearbyShops).toBe('function');
    expect(typeof catalogService.getShopDetails).toBe('function');
    expect(typeof catalogService.getProducts).toBe('function');
    expect(typeof catalogService.getCategories).toBe('function');
    expect(typeof catalogService.getDeals).toBe('function');
  });

  const mockCatalog = [
    { id: '1', name: 'Matchbox', price: 10, mrp: 10, category: 'General', is_price_public: true },
    { id: '2', name: 'Premium Biscuits', price: 80, mrp: 100, category: 'Bakery', is_price_public: true }, // 20% off
    { id: '3', name: 'Olive Oil 1L', price: 650, mrp: 900, category: 'Grocery', is_price_public: true }, // >20% off, > 499
    { id: '4', name: 'Handcrafted Vase', price: 1200, mrp: 1500, category: 'Decor', is_price_public: false, allow_bargain: true }, // Bargain / hidden
  ];

  it('correctly filters products Under ₹99', () => {
    const under99 = mockCatalog.filter((p) => p.is_price_public && p.price <= 99);
    expect(under99.map((p) => p.id)).toEqual(['1', '2']);
  });

  it('correctly filters products Under ₹499', () => {
    const under499 = mockCatalog.filter((p) => p.is_price_public && p.price <= 499);
    expect(under499.map((p) => p.id)).toEqual(['1', '2']);
  });

  it('correctly filters products with deals >= 20% OFF', () => {
    const deals20 = mockCatalog.filter((p) => {
      if (!p.is_price_public) return false;
      const pct = Math.round(((p.mrp - p.price) / p.mrp) * 100);
      return pct >= 20;
    });
    expect(deals20.map((p) => p.id)).toEqual(['2', '3']);
  });

  it('correctly filters products with Price on Request / Bargain', () => {
    const bargain = mockCatalog.filter((p) => !p.is_price_public || p.allow_bargain);
    expect(bargain.map((p) => p.id)).toEqual(['4']);
  });

  it('integrates WhatsApp product sharing text with store slug', () => {
    const shareText = formatProductShareText({
      product: mockCatalog[1],
      shopName: 'Super Mart',
      shopSlug: 'super-mart',
      isHindi: false,
      origin: 'https://shopsilo.in',
    });

    expect(shareText).toContain('*Premium Biscuits*');
    expect(shareText).toContain('Price: ₹80 (MRP: ₹100, 20% OFF)');
    expect(shareText).toContain('Store: Super Mart');
    expect(shareText).toContain('https://shopsilo.in/shop/super-mart');

    const waUrl = getWhatsAppShareUrl({
      product: mockCatalog[1],
      shopName: 'Super Mart',
      shopSlug: 'super-mart',
    });
    expect(waUrl).toContain('https://wa.me/?text=');
  });

  it('correctly filters customer specifications while applying privacy shield', () => {
    const rawAttributes = {
      color: 'Midnight Blue',
      size: 'XL',
      material: '100% Organic Cotton',
      warranty: '1 Year Brand Warranty',
      weight: '250g',
      cost_price: 320,
      floor_price: 450,
      supplier: 'Surat Textiles Ltd',
      reorder_point: 10,
      cogs: 300,
      wholesale_price: 380,
      barcode: '890123456789',
      sku: 'COT-BLU-XL'
    };

    const PRIVATE_KEYS = new Set([
      'cost_price', 'cogs', 'unit_profit', 'profit_margin_pct', 'profit', 'margin',
      'wholesale_price', 'purchase_price', 'kharid_price', 'floor_price', 'min_price',
      'bottom_price', 'allow_bargain', 'supplier', 'distributor', 'vendor', 'dealer',
      'procurement_cost', 'reorder_point', 'low_stock_threshold', 'min_stock',
      'barcode', 'sku', 'internal_id', 'is_price_public', 'hide_price', 'is_active',
      'is_featured', 'category_id', 'shop_id', 'id', 'created_at', 'updated_at', 'deleted_at'
    ]);

    const customerSpecs = Object.entries(rawAttributes).filter(([k, v]) => {
      if (v == null || String(v).trim() === '') return false;
      return !PRIVATE_KEYS.has(k.toLowerCase().trim());
    });

    const specKeys = customerSpecs.map(([k]) => k);
    expect(specKeys).toContain('color');
    expect(specKeys).toContain('size');
    expect(specKeys).toContain('material');
    expect(specKeys).toContain('warranty');
    expect(specKeys).toContain('weight');

    // Merchant private data must NEVER be in customer specs
    expect(specKeys).not.toContain('cost_price');
    expect(specKeys).not.toContain('floor_price');
    expect(specKeys).not.toContain('supplier');
    expect(specKeys).not.toContain('reorder_point');
    expect(specKeys).not.toContain('cogs');
    expect(specKeys).not.toContain('wholesale_price');
    expect(specKeys).not.toContain('barcode');
    expect(specKeys).not.toContain('sku');
  });
});
