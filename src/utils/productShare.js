/**
 * Product Sharing Utility for ShopSilo Customer Web App
 * Supports Rich WhatsApp formatting and Web Share API with graceful fallback.
 * Generates exact deep links to products (/shop/:slug/product/:productId or /product/:productId)
 * and eliminates duplicate link injection in native share sheets.
 */

export function getProductShareUrl({ product, shopSlug = '', origin = '' } = {}) {
  if (!product) return '';
  const p = product;
  const baseUrl = origin || (typeof window !== 'undefined' ? window.location.origin : 'https://shopsilo.in');
  const targetSlug = shopSlug || p.shop_slug || p.shop?.slug || '';
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

  const store = shopName || p.shop_name || p.shop?.name || '';
  const storeLine = store ? (isHindi ? `🏪 दुकान: ${store}
` : `🏪 Store: ${store}
`) : '';
  const productUrl = getProductShareUrl({ product, shopSlug, origin });
  const urlLine = isHindi 
    ? `👉 ShopSilo पर देखें: ${productUrl}` 
    : `👉 View on ShopSilo: ${productUrl}`;

  const titlePrefix = `🛒 *${p.name || 'Product'}*`;
  const priceLine = isHindi ? `💰 कीमत: ${priceStr}` : `💰 Price: ${priceStr}`;

  return `${titlePrefix}
${priceLine}
${storeLine}${urlLine}`;
}

export function getWhatsAppShareUrl(options) {
  const text = formatProductShareText(options);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export async function shareProduct(options) {
  const text = formatProductShareText(options);
  const productUrl = getProductShareUrl(options);

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      // NOTE: We only pass `text` (which already includes the rich product details and single clean link).
      // If both `text` (containing the URL) and `url` are passed, mobile OS share sheets and WhatsApp
      // append `url` to the end of `text`, resulting in the exact link appearing twice!
      await navigator.share({
        title: options.product?.name || 'ShopSilo Product',
        text: text,
      });
      return { success: true, method: 'native', url: productUrl };
    } catch (err) {
      if (err?.name === 'AbortError') {
        return { success: false, method: 'cancelled', url: productUrl };
      }
      // Fallback to WhatsApp URL below if native share encounters an error
    }
  }

  if (typeof window !== 'undefined') {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    return { success: true, method: 'whatsapp', url: productUrl };
  }

  return { success: false, method: 'none', url: productUrl };
}
