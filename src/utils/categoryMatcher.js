/**
 * Unified Category Matcher for Customer Frontend
 * 
 * Hinglish Hint:
 * Yeh helper check karta hai ki koi Product ya Shop kisi selected category se match karta hai ya nahi:
 * 1. Exact & case-insensitive match (e.g. "Hair Care" vs "hair-care")
 * 2. Hyphen/Space/Symbol normalization (e.g. "clothing-apparel" === "Clothing & Apparel")
 * 3. Attributes check (product.attributes.category_name / category)
 * 4. Keywords match from ALL_CATEGORIES metadata (e.g. "Tata Salt" matches "Kirana & Grocery" or "Grocery & Staples")
 */

import { getCategoryMeta } from '../constants/categoryData';

const normalizeStr = (str) => {
  if (!str) return '';
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
};

export const isProductInCategory = (product, selectedCategory) => {
  if (!selectedCategory || selectedCategory === 'All' || selectedCategory === 'ALL') {
    return true;
  }
  if (!product) return false;

  const normSelected = normalizeStr(selectedCategory);
  if (!normSelected) return true;

  // Direct product properties
  const pCatName = product.category_name || '';
  const pAttrsCat = product.attributes?.category_name || product.attributes?.category || '';
  const pCatSlug = product.category_slug || product.category?.slug || '';
  const pCatId = product.category_id || product.category?.id || '';
  const pName = product.name || '';
  const pTags = Array.isArray(product.tags) ? product.tags.join(' ') : (product.tags || '');

  const candidates = [pCatName, pAttrsCat, pCatSlug, pCatId];

  // 1. Check direct candidates
  for (const c of candidates) {
    if (!c) continue;
    const normC = normalizeStr(c);
    if (!normC) continue;
    if (normC === normSelected || normC.includes(normSelected) || normSelected.includes(normC)) {
      return true;
    }
  }

  // 2. Check Category Metadata (nameEn, nameHi, slug, keywords)
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

  const normSelected = normalizeStr(selectedCategory);
  if (!normSelected) return true;

  const sCat = shop.category || '';
  const sName = shop.name || '';
  const sDesc = shop.description || '';

  const candidates = [sCat, sName, sDesc];
  for (const c of candidates) {
    if (!c) continue;
    const normC = normalizeStr(c);
    if (!normC) continue;
    if (normC === normSelected || normC.includes(normSelected) || normSelected.includes(normC)) {
      return true;
    }
  }

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
