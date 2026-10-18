/**
 * Product Details & Specification Parser Helper
 *
 * Normalizes, extracts, and enriches complete product specifications,
 * descriptions, and merchant store information with strict Enterprise Privacy Shield (Rule 15).
 */

// Strict Private Merchant Blocklist (Zero leakage of internal business metrics)
export const PRIVATE_MERCHANT_KEYS = new Set([
  'cost_price', 'costprice', 'cost', 'unit_profit', 'profit_margin_pct', 'profit',
  'margin', 'wholesale_price', 'wholesaleprice', 'purchase_price', 'kharid_price', 'cogs', 'markup',
  'floor_price', 'floorprice', 'min_price', 'bottom_price', 'allow_bargain', 'is_bargain_allowed',
  'supplier', 'supplier_name', 'distributor', 'distributor_name', 'vendor',
  'dealer', 'dealer_name', 'dealer_phone', 'wholesaler',
  'reorder_point', 'reorder_qty', 'threshold', 'stock_alert_threshold',
  'low_stock_threshold', 'min_stock', 'inventory',
  'barcode', 'sku', 'id', 'uuid', 'shop_id', 'user_id', 'internal_code',
  'is_price_public', 'ispricepublic', 'hide_price', 'price_public', 'is_public', 'is_active', 'is_featured',
  'category_id', 'category_slug'
]);

/**
 * Clean & normalize human-readable specification label
 */
export function formatSpecLabel(rawKey = '', isHindi = false) {
  const clean = String(rawKey).trim().toLowerCase().replace(/[_\s-]+/g, ' ');

  const labelMap = {
    brand: isHindi ? 'ब्रांड (Brand)' : 'Brand',
    unit: isHindi ? 'इकाई (Unit)' : 'Unit',
    volume: isHindi ? 'मात्रा (Volume)' : 'Volume',
    'net vol': isHindi ? 'मात्रा (Net Volume)' : 'Net Volume',
    'net quantity': isHindi ? 'मात्रा (Net Quantity)' : 'Net Quantity',
    'net qty': isHindi ? 'मात्रा (Net Qty)' : 'Net Qty',
    exp: isHindi ? 'एक्सपायरी / शेल्फ लाइफ' : 'Expiry / Shelf Life',
    expiry: isHindi ? 'एक्सपायरी' : 'Expiry',
    'shelf life': isHindi ? 'शेल्फ लाइफ' : 'Shelf Life',
    'key ingredient': isHindi ? 'मुख्य घटक' : 'Key Ingredients',
    'key ingredients': isHindi ? 'मुख्य घटक' : 'Key Ingredients',
    ingredients: isHindi ? 'सामग्री (Ingredients)' : 'Ingredients',
    material: isHindi ? 'सामग्री (Material)' : 'Material',
    size: isHindi ? 'आकार (Size)' : 'Size',
    color: isHindi ? 'रंग (Color)' : 'Color',
    weight: isHindi ? 'वजन (Weight)' : 'Net Weight',
    flavor: isHindi ? 'स्वाद (Flavor)' : 'Flavor',
    warranty: isHindi ? 'वारंटी (Warranty)' : 'Warranty',
    model: isHindi ? 'मॉडल (Model)' : 'Model',
    'age group': isHindi ? 'उम्र वर्ग' : 'Age Group',
    type: isHindi ? 'प्रकार (Type)' : 'Product Type',
    country: isHindi ? 'मूल देश' : 'Country of Origin',
    'country of origin': isHindi ? 'मूल देश' : 'Country of Origin',
  };

  if (labelMap[clean]) return labelMap[clean];

  // Capitalize words
  return clean
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Parses raw description to separate narrative text from pipe-delimited or key-value specifications.
 * E.g.: "Ayurvedic shampoo for hair fall. | Brand: Kesh King | Exp: 3 Year | Volume: 200ml"
 */
export function extractDescriptionSpecs(rawDescription = '') {
  if (!rawDescription || typeof rawDescription !== 'string') {
    return { cleanDescription: '', extractedSpecs: {} };
  }

  const trimmed = rawDescription.trim();
  const narrativeParts = [];
  const extractedSpecs = {};

  // Split on pipes or newlines
  const segments = trimmed
    .split(/[|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const seg of segments) {
    const colonIdx = seg.indexOf(':');
    if (colonIdx > 0 && colonIdx < seg.length - 1) {
      const key = seg.slice(0, colonIdx).trim();
      const val = seg.slice(colonIdx + 1).trim();

      // Check if key looks like a spec attribute (not a full sentence)
      if (key.length <= 30 && !key.includes('.') && val) {
        extractedSpecs[key] = val;
        continue;
      }
    }
    narrativeParts.push(seg);
  }

  const cleanDescription = narrativeParts.join(' ').trim();
  return { cleanDescription, extractedSpecs };
}

/**
 * Parses, cleans, and merges all specifications for a product.
 * Returns safe specifications array [[label, value]], clean description, brand, categoryName, etc.
 */
export function parseProductDetails(product, isHindi = false) {
  if (!product || typeof product !== 'object') {
    return {
      cleanDescription: '',
      specifications: [],
      brand: '',
      categoryName: isHindi ? 'सामान्य (General)' : 'General',
      unit: '',
      weightLabel: '',
      tags: [],
    };
  }

  const p = product;

  // 1. Parse raw attributes (can be JSON string or Object)
  let rawAttrs = p.attributes || {};
  if (typeof rawAttrs === 'string') {
    try {
      rawAttrs = JSON.parse(rawAttrs);
    } catch {
      rawAttrs = {};
    }
  }
  if (!rawAttrs || typeof rawAttrs !== 'object') {
    rawAttrs = {};
  }

  // 2. Parse description to extract pipe/colon embedded specs
  const rawDesc = String(p.description || '').trim();
  const { cleanDescription, extractedSpecs } = extractDescriptionSpecs(rawDesc);

  // 3. Combine explicit attributes + extracted specs
  const combined = { ...extractedSpecs, ...rawAttrs };

  // Explicit top-level fallback fields
  if (p.brand && !combined.brand) combined.brand = p.brand;
  if (p.unit && !combined.unit) combined.unit = p.unit;
  if (p.color && !combined.color) combined.color = p.color;
  if (p.size && !combined.size) combined.size = p.size;
  if (p.flavor && !combined.flavor) combined.flavor = p.flavor;
  if (p.material && !combined.material) combined.material = p.material;
  if (p.warranty && !combined.warranty) combined.warranty = p.warranty;
  if (p.model && !combined.model) combined.model = p.model;

  // Resolve Category Name
  let categoryName = '';
  if (typeof p.category === 'object' && p.category?.name) {
    categoryName = p.category.name;
  } else if (p.category_name) {
    categoryName = p.category_name;
  } else if (combined.category_name) {
    categoryName = combined.category_name;
  } else if (combined.category) {
    categoryName = combined.category;
  } else if (typeof p.category === 'string' && p.category && !p.category.includes('-') && p.category.length < 30) {
    categoryName = p.category;
  }

  // Clean brand and unit
  const brand = String(combined.brand || combined.Brand || p.brand || '').trim();
  const unit = String(combined.unit || combined.Unit || combined.Volume || combined.volume || p.unit || '').trim();

  // Format Weight
  let weightLabel = '';
  const numWeight = Number(p.weight || combined.weight || 0);
  if (numWeight > 0) {
    weightLabel = numWeight >= 1 ? `${numWeight} kg` : `${Math.round(numWeight * 1000)} g`;
  }

  // Extract Tags
  let tags = [];
  if (Array.isArray(p.tags)) {
    tags = p.tags.filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim());
  } else if (typeof p.tags === 'string' && p.tags) {
    try {
      const parsed = JSON.parse(p.tags);
      if (Array.isArray(parsed)) tags = parsed.filter(Boolean);
    } catch {
      tags = p.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
  }

  // Build safe customer-facing specification pairs
  const seenKeys = new Set(['brand', 'category_name', 'category']);
  const specifications = [];

  for (const [key, val] of Object.entries(combined)) {
    if (val === null || val === undefined || val === '') continue;
    if (typeof val === 'boolean') continue;

    const lowerKey = key.toLowerCase().trim();
    if (PRIVATE_MERCHANT_KEYS.has(lowerKey)) continue;
    if (seenKeys.has(lowerKey)) continue;

    seenKeys.add(lowerKey);
    specifications.push({
      key: lowerKey,
      label: formatSpecLabel(key, isHindi),
      value: String(val).trim(),
    });
  }

  return {
    cleanDescription: cleanDescription || rawDesc,
    specifications,
    brand,
    categoryName,
    unit,
    weightLabel,
    tags,
  };
}
