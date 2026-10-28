/**
 * Product Sharing Utility for ShopSilo Customer Web App
 * Supports Rich WhatsApp formatting and Web Share API with graceful fallback.
 * Generates exact deep links to products (/shop/:slug/product/:productId or /product/:productId)
 * and eliminates duplicate link injection in native share sheets.
 */

function normalizeShareOptions(options) {
  if (!options) return { product: null };
  if (options.id || options.name || options.price || options.product_id) {
    return { product: options };
  }
  return options;
}

export function getProductShareUrl(options) {
  const opts = normalizeShareOptions(options);
  const p = opts?.product;
  if (!p) return opts?.origin || 'https://shopsilo.in';

  let baseUrl = opts?.origin || (typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://shopsilo.in');
  baseUrl = baseUrl.replace(/\/+$/, '');

  // If in localhost / dev / IP, prefer official production origin for clean professional links
  if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1') || baseUrl.includes('192.168.')) {
    baseUrl = 'https://shopsilo.in';
  }

  const targetSlug = opts?.shopSlug || p.shop_slug || p.shop?.slug || '';
  const productId = p.id || p.product_id || p._id || '';

  if (targetSlug && productId) {
    return `${baseUrl}/shop/${targetSlug}/product/${productId}`;
  }
  if (productId) {
    return `${baseUrl}/product/${productId}`;
  }
  if (targetSlug) {
    return `${baseUrl}/shop/${targetSlug}`;
  }
  return baseUrl;
}

export function formatProductShareText(options) {
  const opts = normalizeShareOptions(options);
  const p = opts?.product;
  if (!p) return '';

  const isHindi = Boolean(opts?.isHindi);
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

  const store = opts?.shopName || p.shop_name || p.shop?.name || '';
  const storeLine = store ? (isHindi ? `🏪 दुकान: ${store}\n` : `🏪 Store: ${store}\n`) : '';
  const productUrl = getProductShareUrl(opts);
  const urlLine = isHindi 
    ? `👉 ShopSilo पर देखें: ${productUrl}` 
    : `👉 View on ShopSilo: ${productUrl}`;

  const titlePrefix = `🛒 *${p.name || 'Product'}*`;
  const priceLine = isHindi ? `💰 कीमत: ${priceStr}` : `💰 Price: ${priceStr}`;

  return `${titlePrefix}\n${priceLine}\n${storeLine}${urlLine}`;
}

export function getWhatsAppShareUrl(options) {
  const opts = normalizeShareOptions(options);
  const text = formatProductShareText(opts);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export async function shareProduct(options) {
  const opts = normalizeShareOptions(options);
  const text = formatProductShareText(opts);
  const productUrl = getProductShareUrl(opts);

  if (!text) return { success: false, method: 'none', url: '' };

  // 1. Native Web Share API (Must be called synchronously inside user gesture)
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: opts.product?.name || 'ShopSilo Product',
        text: text,
      });
      return { success: true, method: 'native', url: productUrl };
    } catch (err) {
      if (err?.name === 'AbortError') {
        return { success: false, method: 'cancelled', url: productUrl };
      }
      // Fallback below if navigator.share fails or user gesture was lost
    }
  }

  // 2. Fallback to Clipboard Copy
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, method: 'clipboard', url: productUrl };
    } catch {
      // Fallback 3 below
    }
  }

  // 3. Fallback to WhatsApp Direct Share
  if (typeof window !== 'undefined') {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    return { success: true, method: 'whatsapp', url: productUrl };
  }

  return { success: false, method: 'none', url: productUrl };
}
