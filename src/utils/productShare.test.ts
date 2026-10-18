import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatProductShareText, getWhatsAppShareUrl, shareProduct } from './productShare';

describe('productShare Utility', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const sampleProduct = {
    id: 'prod-101',
    name: 'Tata Salt 1kg',
    price: 28,
    mrp: 30,
    shop_name: 'Gupta Kirana',
    shop_slug: 'gupta-kirana',
    is_price_public: true,
  };

  it('formats product share text with discount in English', () => {
    const text = formatProductShareText({
      product: sampleProduct,
      origin: 'https://shopsilo.in',
    });

    expect(text).toContain('*Tata Salt 1kg*');
    expect(text).toContain('₹28');
    expect(text).toContain('MRP: ₹30, 7% OFF');
    expect(text).toContain('Store: Gupta Kirana');
    expect(text).toContain('https://shopsilo.in/shop/gupta-kirana');
  });

  it('formats product share text in Hindi when isHindi is true', () => {
    const text = formatProductShareText({
      product: sampleProduct,
      isHindi: true,
      origin: 'https://shopsilo.in',
    });

    expect(text).toContain('*Tata Salt 1kg*');
    expect(text).toContain('कीमत: ₹28');
    expect(text).toContain('7% छूट');
    expect(text).toContain('दुकान: Gupta Kirana');
  });

  it('handles hidden price / bargain products gracefully', () => {
    const hiddenProduct = {
      ...sampleProduct,
      is_price_public: false,
    };

    const textEn = formatProductShareText({ product: hiddenProduct });
    expect(textEn).toContain('Price on Request');

    const textHi = formatProductShareText({ product: hiddenProduct, isHindi: true });
    expect(textHi).toContain('मोलभाव करें / रेट पूछें');
  });

  it('generates valid WhatsApp share url', () => {
    const url = getWhatsAppShareUrl({
      product: sampleProduct,
      origin: 'https://shopsilo.in',
    });

    expect(url.startsWith('https://wa.me/?text=')).toBe(true);
    expect(url).toContain(encodeURIComponent('Tata Salt 1kg'));
  });

  it('falls back to window.open if navigator.share is not available', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    const result = await shareProduct({
      product: sampleProduct,
      origin: 'https://shopsilo.in',
    });

    expect(result.success).toBe(true);
    expect(result.method).toBe('whatsapp');
    expect(openSpy).toHaveBeenCalled();
  });
});
