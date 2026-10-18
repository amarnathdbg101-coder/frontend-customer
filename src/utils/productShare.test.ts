import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatProductShareText, getWhatsAppShareUrl, getProductShareUrl, shareProduct } from './productShare';

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

  it('generates exact product deep link with store slug', () => {
    const url = getProductShareUrl({
      product: sampleProduct,
      origin: 'https://shopsilo.in',
    });
    expect(url).toBe('https://shopsilo.in/shop/gupta-kirana/product/prod-101');
  });

  it('generates direct product link when store slug is absent', () => {
    const url = getProductShareUrl({
      product: { id: 'prod-999', name: 'Item' },
      origin: 'https://shopsilo.in',
    });
    expect(url).toBe('https://shopsilo.in/product/prod-999');
  });

  it('formats product share text with discount in English and exact product link', () => {
    const text = formatProductShareText({
      product: sampleProduct,
      origin: 'https://shopsilo.in',
    });

    expect(text).toContain('*Tata Salt 1kg*');
    expect(text).toContain('₹28');
    expect(text).toContain('MRP: ₹30, 7% OFF');
    expect(text).toContain('Store: Gupta Kirana');
    expect(text).toContain('https://shopsilo.in/shop/gupta-kirana/product/prod-101');
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
    expect(text).toContain('ShopSilo पर देखें: https://shopsilo.in/shop/gupta-kirana/product/prod-101');
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
    expect(url).toContain(encodeURIComponent('https://shopsilo.in/shop/gupta-kirana/product/prod-101'));
  });

  it('calls navigator.share with text only to prevent duplicate URL injection', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      value: shareMock,
      configurable: true,
      writable: true,
    });

    const result = await shareProduct({
      product: sampleProduct,
      origin: 'https://shopsilo.in',
    });

    expect(result.success).toBe(true);
    expect(result.method).toBe('native');
    expect(shareMock).toHaveBeenCalledWith({
      title: 'Tata Salt 1kg',
      text: expect.stringContaining('https://shopsilo.in/shop/gupta-kirana/product/prod-101'),
    });
    // Crucial: url must not be passed separately when text contains the link to prevent duplicates
    expect(shareMock.mock.calls[0][0].url).toBeUndefined();
  });

  it('falls back to window.open if navigator.share is not available', async () => {
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
      writable: true,
    });
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
