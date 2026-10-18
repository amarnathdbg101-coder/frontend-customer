import { describe, it, expect } from 'vitest';
import {
  extractDescriptionSpecs,
  formatSpecLabel,
  parseProductDetails,
  PRIVATE_MERCHANT_KEYS,
} from './productDetailsHelper';

describe('productDetailsHelper', () => {
  it('extracts pipe-delimited specifications from product description', () => {
    const desc = 'Medicinal ayurvedic hair oil effective for hair fall control and hair growth. | Brand: Kesh King | Exp: 3 Year | Volume: 100ml | Key Ingredient: Bhringraj, Amla, Brahmi';
    const { cleanDescription, extractedSpecs } = extractDescriptionSpecs(desc);

    expect(cleanDescription).toBe('Medicinal ayurvedic hair oil effective for hair fall control and hair growth.');
    expect(extractedSpecs).toEqual({
      Brand: 'Kesh King',
      Exp: '3 Year',
      Volume: '100ml',
      'Key Ingredient': 'Bhringraj, Amla, Brahmi',
    });
  });

  it('handles clean narrative when no pipe-delimited specs exist', () => {
    const desc = 'Fresh organic cow milk delivered daily morning directly from local farm.';
    const { cleanDescription, extractedSpecs } = extractDescriptionSpecs(desc);

    expect(cleanDescription).toBe(desc);
    expect(extractedSpecs).toEqual({});
  });

  it('parses complete product details with Privacy Shield guarantees', () => {
    const product = {
      id: 'prod-123',
      name: 'Kesh King Ayurvedic Hair Oil',
      description: 'Medicinal hair oil for nourishment. | Brand: Kesh King | Exp: 3 Year | Volume: 100ml',
      weight: 0.25,
      category_name: 'Hair Care',
      tags: ['ayurvedic', 'hairfall', 'cooling'],
      attributes: {
        cost_price: 80, // SENSITIVE
        floor_price: 110, // SENSITIVE
        cogs: 75, // SENSITIVE
        supplier: 'Gupta Traders', // SENSITIVE
        barcode: '890123456789', // SENSITIVE
        sku: 'KK-OIL-100', // SENSITIVE
        Origin: 'India',
        Skin_Type: 'All Hair Types',
      },
    };

    const details = parseProductDetails(product, false);

    expect(details.brand).toBe('Kesh King');
    expect(details.categoryName).toBe('Hair Care');
    expect(details.unit).toBe('100ml');
    expect(details.weightLabel).toBe('250 g');
    expect(details.cleanDescription).toBe('Medicinal hair oil for nourishment.');
    expect(details.tags).toEqual(['ayurvedic', 'hairfall', 'cooling']);

    // Check that private keys are completely omitted from specifications
    const specKeys = details.specifications.map((s) => s.key);
    expect(specKeys).not.toContain('cost_price');
    expect(specKeys).not.toContain('floor_price');
    expect(specKeys).not.toContain('cogs');
    expect(specKeys).not.toContain('supplier');
    expect(specKeys).not.toContain('barcode');
    expect(specKeys).not.toContain('sku');

    // Check that public specs are present
    expect(specKeys).toContain('origin');
    expect(specKeys).toContain('skin_type');
    expect(specKeys).toContain('exp');
    expect(specKeys).toContain('volume');
  });

  it('formats bilingual labels in Hindi and English', () => {
    expect(formatSpecLabel('brand', false)).toBe('Brand');
    expect(formatSpecLabel('brand', true)).toContain('ब्रांड');
    expect(formatSpecLabel('exp', true)).toContain('एक्सपायरी');
    expect(formatSpecLabel('key_ingredient', false)).toBe('Key Ingredients');
  });

  it('handles empty or malformed product gracefully', () => {
    const details = parseProductDetails(null);
    expect(details.specifications).toEqual([]);
    expect(details.cleanDescription).toBe('');
  });
});
