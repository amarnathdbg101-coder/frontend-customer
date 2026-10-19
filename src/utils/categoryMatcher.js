/**
 * Unified Category Matcher for Customer Frontend
 * 
 * Hinglish Hint:
 * Yeh helper check karta hai ki koi Product ya Shop kisi selected category se match karta hai ya nahi:
 * 1. Fast Canonical Key Match (0ms in-memory resolution between "Grocery & Staples" vs "Kirana & Grocery" vs "kirana-grocery")
 * 2. Cross-platform synonym bucket resolution
 * 3. Exact & case-insensitive match (e.g. "Hair Care" vs "hair-care")
 * 4. Hyphen/Space/Symbol normalization (e.g. "clothing-apparel" === "Clothing & Apparel")
 * 5. Attributes check (product.attributes.category_name / category)
 * 6. Keywords match from ALL_CATEGORIES metadata (e.g. "Tata Salt" matches "Kirana & Grocery" or "Grocery & Staples")
 */

import { getCategoryMeta } from '../constants/categoryData';

const normalizeStr = (str) => {
  if (!str) return '';
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Maps any category identifier, UUID, slug, English name, Hindi name, or micro-category
 * into a canonical master slug key.
 */
export const getCanonicalCategoryKey = (input) => {
  if (!input) return '';
  const s = String(input).trim().toLowerCase();
  if (!s || s === 'all') return 'all';

  // Normalize punctuation and symbols to hyphens
  const clean = s
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (
    clean.includes('kirana') || clean.includes('grocery') || clean.includes('staple') ||
    clean.includes('pulses') || clean.includes('lentils') || clean.includes('atta') ||
    clean.includes('flour') || clean.includes('rice') || clean.includes('grain') ||
    clean.includes('edible-oil') || clean.includes('oil') || clean.includes('masala') ||
    clean.includes('spice') || clean.includes('sugar') || clean.includes('salt') ||
    clean.includes('packaged-food')
  ) {
    return 'kirana-grocery';
  }

  if (
    clean.includes('dairy') || clean.includes('breakfast') || clean.includes('milk') ||
    clean.includes('curd') || clean.includes('paneer') || clean.includes('butter') ||
    clean.includes('cheese') || clean.includes('egg') || clean.includes('anda')
  ) {
    return 'dairy-breakfast';
  }

  if (
    clean.includes('snack') || clean.includes('munch') || clean.includes('namkeen') ||
    clean.includes('biscuit') || clean.includes('cookie') || clean.includes('chip') ||
    clean.includes('cold-drink') || clean.includes('beverage') || clean.includes('drink') ||
    clean.includes('juice') || clean.includes('tea') || clean.includes('coffee') ||
    clean.includes('chai') || clean.includes('chocolate') || clean.includes('sweet')
  ) {
    return 'snacks-beverages';
  }

  if (
    clean.includes('bakery') || clean.includes('cake') || clean.includes('pastry') ||
    clean.includes('rusk') || clean.includes('bun') || clean.includes('bread')
  ) {
    return 'bakery-cakes';
  }

  if (
    clean.includes('fruit') || clean.includes('vegetable') || clean.includes('sabji') ||
    clean.includes('apple') || clean.includes('banana') || clean.includes('potato') ||
    clean.includes('onion') || clean.includes('tomato')
  ) {
    return 'fruits-vegetables';
  }

  if (
    clean.includes('beauty') || clean.includes('cosmetic') || clean.includes('makeup') ||
    clean.includes('lipstick') || clean.includes('perfume')
  ) {
    return 'beauty-cosmetics';
  }

  if (
    clean.includes('personal') || clean.includes('shampoo') ||
    clean.includes('bath') || clean.includes('skin') || clean.includes('oral') ||
    clean.includes('toothpaste') || clean.includes('hair') || clean.includes('soap')
  ) {
    return 'personal-care';
  }

  if (
    clean.includes('household') || clean.includes('cleaning') || clean.includes('laundry') ||
    clean.includes('detergent') || clean.includes('dishwash') || clean.includes('mop')
  ) {
    return 'household-cleaning';
  }

  if (
    clean.includes('kitchen') || clean.includes('cookware') || clean.includes('utensil') ||
    clean.includes('container')
  ) {
    return 'home-kitchen';
  }

  if (
    clean.includes('pooja') || clean.includes('puja') || clean.includes('spiritual') ||
    clean.includes('agarbatti') || clean.includes('camphor') || clean.includes('diya') ||
    clean.includes('religious')
  ) {
    return 'pooja-spiritual';
  }

  if (
    clean.includes('baby') || clean.includes('diaper') || clean.includes('wipes') ||
    clean.includes('cerelac')
  ) {
    return 'baby-care';
  }

  if (
    clean.includes('pharmacy') || clean.includes('medicine') || clean.includes('health') ||
    clean.includes('vitamin') || clean.includes('supplement') || clean.includes('medical') ||
    clean.includes('first-aid') || clean.includes('otc')
  ) {
    return 'pharmacy-healthcare';
  }

  if (
    clean.includes('electronics') || clean.includes('electronic') || clean.includes('mobile') ||
    clean.includes('appliance') || clean.includes('gadget') || clean.includes('charger') ||
    clean.includes('earphone')
  ) {
    return 'electronics-accessories';
  }

  if (
    clean.includes('clothing') || clean.includes('cloth') || clean.includes('fashion') ||
    clean.includes('apparel') || clean.includes('shirt') || clean.includes('pant') ||
    clean.includes('dress') || clean.includes('wear')
  ) {
    return 'clothing-apparel';
  }

  if (
    clean.includes('footwear') || clean.includes('shoe') || clean.includes('sandal') ||
    clean.includes('slipper') || clean.includes('chappal') || clean.includes('leather')
  ) {
    return 'footwear';
  }

  if (
    clean.includes('stationery') || clean.includes('office') || clean.includes('notebook') ||
    clean.includes('pen') || clean.includes('paper') || clean.includes('book')
  ) {
    return 'stationery-office';
  }

  if (
    clean.includes('hardware') || clean.includes('tool') || clean.includes('building') ||
    clean.includes('electrical') || clean.includes('lock') || clean.includes('automotive')
  ) {
    return 'hardware-tools';
  }

  if (
    clean.includes('sport') || clean.includes('fitness') || clean.includes('gym') ||
    clean.includes('cricket')
  ) {
    return 'sports-fitness';
  }

  if (
    clean.includes('toy') || clean.includes('game') || clean.includes('puzzle')
  ) {
    return 'toys-games';
  }

  if (
    clean.includes('pet') || clean.includes('dog') || clean.includes('cat')
  ) {
    return 'pet-care';
  }

  if (clean.includes('general') || clean.includes('service') || clean.includes('other')) {
    return 'general-store';
  }

  return clean || 'general-store';
};

export const isProductInCategory = (product, selectedCategory) => {
  if (!selectedCategory || selectedCategory === 'All' || selectedCategory === 'ALL') {
    return true;
  }
  if (!product) return false;

  // Direct product properties
  const pCatName = product.category_name || '';
  const pAttrsCat = product.attributes?.category_name || product.attributes?.category || '';
  const pCatSlug = product.category_slug || product.category?.slug || '';
  const pCatId = product.category_id || product.category?.id || '';
  const pName = product.name || '';
  const pTags = Array.isArray(product.tags) ? product.tags.join(' ') : (product.tags || '');

  const candidates = [pCatName, pAttrsCat, pCatSlug, pCatId];

  // 1. Fast Canonical Key Resolution (0ms in-memory match between synonyms)
  const canonSelected = getCanonicalCategoryKey(selectedCategory);
  if (canonSelected && canonSelected !== 'general-store') {
    for (const c of candidates) {
      if (!c) continue;
      const canonC = getCanonicalCategoryKey(c);
      if (canonC && canonC === canonSelected) {
        return true;
      }
      // Cross-bucket compatibilities
      if (
        (canonSelected === 'dairy-breakfast' && canonC === 'bakery-cakes') ||
        (canonSelected === 'bakery-cakes' && canonC === 'dairy-breakfast') ||
        (canonSelected === 'personal-care' && canonC === 'beauty-cosmetics') ||
        (canonSelected === 'household-cleaning' && canonC === 'home-kitchen')
      ) {
        return true;
      }
    }
  }

  // 2. Direct string inclusion match
  const normSelected = normalizeStr(selectedCategory);
  if (!normSelected) return true;

  for (const c of candidates) {
    if (!c) continue;
    const normC = normalizeStr(c);
    if (!normC) continue;
    if (normC === normSelected || normC.includes(normSelected) || normSelected.includes(normC)) {
      return true;
    }
  }

  // 3. Check Category Metadata (nameEn, nameHi, slug, keywords)
  const meta = getCategoryMeta(selectedCategory);
  if (meta) {
    const metaEn = normalizeStr(meta.nameEn);
    const metaSlug = normalizeStr(meta.slug);
    const metaId = normalizeStr(meta.id);

    for (const c of candidates) {
      if (!c) continue;
      const normC = normalizeStr(c);
      if (normC === metaEn || normC.includes(metaEn) || metaEn.includes(normC)) return true;
      if (normC === metaSlug || normC.includes(metaSlug) || metaSlug.includes(normC)) return true;
      if (normC === metaId || normC.includes(metaId) || metaId.includes(normC)) return true;
    }

    // Keyword match against product name, category, or tags
    if (Array.isArray(meta.keywords) && meta.keywords.length > 0) {
      const pCombinedText = `${pName} ${pCatName} ${pAttrsCat} ${pTags}`.toLowerCase();
      const hasKeyword = meta.keywords.some((kw) => {
        const kwClean = kw.toLowerCase().trim();
        if (kwClean.length < 3) return false;
        return pCombinedText.includes(kwClean);
      });
      if (hasKeyword) return true;
    }
  }

  return false;
};

export const isShopInCategory = (shop, selectedCategory) => {
  if (!selectedCategory || selectedCategory === 'All' || selectedCategory === 'ALL') {
    return true;
  }
  if (!shop) return false;

  const sCat = shop.category || '';
  const sName = shop.name || '';
  const sDesc = shop.description || '';
  const candidates = [sCat, sName, sDesc];

  // 1. Fast Canonical Key Resolution
  const canonSelected = getCanonicalCategoryKey(selectedCategory);
  if (canonSelected && canonSelected !== 'general-store') {
    for (const c of candidates) {
      if (!c) continue;
      const canonC = getCanonicalCategoryKey(c);
      if (canonC && canonC === canonSelected) {
        return true;
      }
    }
  }

  // 2. Direct string inclusion match
  const normSelected = normalizeStr(selectedCategory);
  if (!normSelected) return true;

  for (const c of candidates) {
    if (!c) continue;
    const normC = normalizeStr(c);
    if (!normC) continue;
    if (normC === normSelected || normC.includes(normSelected) || normSelected.includes(normC)) {
      return true;
    }
  }

  // 3. Category Metadata fallback
  const meta = getCategoryMeta(selectedCategory);
  if (meta) {
    const metaEn = normalizeStr(meta.nameEn);
    const metaSlug = normalizeStr(meta.slug);
    const metaId = normalizeStr(meta.id);

    for (const c of candidates) {
      if (!c) continue;
      const normC = normalizeStr(c);
      if (normC === metaEn || normC.includes(metaEn) || metaEn.includes(normC)) return true;
      if (normC === metaSlug || normC.includes(metaSlug) || metaSlug.includes(normC)) return true;
      if (normC === metaId || normC.includes(metaId) || metaId.includes(normC)) return true;
    }

    if (Array.isArray(meta.keywords) && meta.keywords.length > 0) {
      const sCombinedText = `${sName} ${sCat} ${sDesc}`.toLowerCase();
      const hasKeyword = meta.keywords.some((kw) => {
        const kwClean = kw.toLowerCase().trim();
        if (kwClean.length < 3) return false;
        return sCombinedText.includes(kwClean);
      });
      if (hasKeyword) return true;
    }
  }

  return false;
};
