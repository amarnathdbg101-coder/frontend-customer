/**
 * Product Sharing Utility for ShopSilo Customer Web App
 * Supports Rich WhatsApp formatting and Web Share API with graceful fallback.
 */

export function formatProductShareText({ product, shopName = '', shopSlug = '', isHindi = false, origin = '' }) {
  if (!product) return '';
  const p = product;
  const mrp = Number(p.compare_price || p.mrp || 0);
  const price = Number(p.price || 0);
  const isPricePublic = p.is_price_public !== false && 
                        p.isPricePublic !== false && 
                        p.attributes?.is_price_public !== false && 
                        p.attributes?.is_price_public !== 'false' && 
                        price > 0 &&
                        !p.hide_price;
  const hasDiscount = isPricePublic && mrp > price;
  const discountPct = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;

  let priceStr = '';
  if (isPricePublic) {
    priceStr = `₹${price}`;
    if (hasDiscount && discountPct > 0) {
      priceStr += isHindi ? ` (MRP: ₹${mrp}, ${discountPct}% छूट)` : ` (MRP: ₹${mrp}, ${discountPct}% OFF)`;
    }
  } else {
    priceStr = isHindi ? '🔒 मोलभाव करें / रेट पूछें' : '🔒 Price on Request';
  }

  const store = shopName || p.shop_name || '';
  const storeLine = store ? (isHindi ? `🏪 दुकान: ${store}\n` : `🏪 Store: ${store}\n`) : '';
  const baseUrl = origin || (typeof window !== 'undefined' ? window.location.origin : 'https://shopsilo.in');
  const targetSlug = shopSlug || p.shop_slug || '';
  const urlLine = targetSlug 
    ? (isHindi ? `👉 ShopSilo पर देखें: ${baseUrl}/shop/${targetSlug}` : `👉 View on ShopSilo: ${baseUrl}/shop/${targetSlug}`)
    : (isHindi ? `👉 ShopSilo: ${baseUrl}` : `👉 ShopSilo: ${baseUrl}`);

  const titlePrefix = `🛒 *${p.name || 'Product'}*`;
  const priceLine = isHindi ? `💰 कीमत: ${priceStr}` : `💰 Price: ${priceStr}`;

  return `${titlePrefix}\n${priceLine}\n${storeLine}${urlLine}`;
}

export function getWhatsAppShareUrl(options) {
  const text = formatProductShareText(options);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export async function shareProduct(options) {
  const text = formatProductShareText(options);
  const baseUrl = options.origin || (typeof window !== 'undefined' ? window.location.origin : 'https://shopsilo.in');
  const targetSlug = options.shopSlug || options.product?.shop_slug || '';
  const url = targetSlug ? `${baseUrl}/shop/${targetSlug}` : baseUrl;

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: options.product?.name || 'ShopSilo Product',
        text: text,
        url: url,
      });
      return { success: true, method: 'native' };
    } catch (err) {
      if (err?.name === 'AbortError') {
        return { success: false, method: 'cancelled' };
      }
      // Fallback to WhatsApp URL below
    }
  }

  if (typeof window !== 'undefined') {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    return { success: true, method: 'whatsapp' };
  }

  return { success: false, method: 'none' };
}
