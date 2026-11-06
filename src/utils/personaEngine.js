/**
 * 🎯 Zero-Click Persona Detection & Session Affinity Engine
 * 
 * Automatically infers customer shopping intent (Women's Ethnic, Men's Wear, or Beauty/Cosmetics)
 * based on non-intrusive in-session engagement (viewed products, searched terms, category taps).
 * 
 * Zero login required. Stores private affinity scores locally in browser storage.
 */

export const PERSONA_TYPES = {
  ALL: 'ALL',
  WOMENS_ETHNIC: 'womens_ethnic',
  MENS_WEAR: 'mens_wear',
  COSMETICS: 'cosmetics',
};

export const PERSONA_META = {
  [PERSONA_TYPES.ALL]: {
    labelEn: 'All Collections',
    labelHi: 'सभी कलेक्शंस',
    icon: '✨',
  },
  [PERSONA_TYPES.WOMENS_ETHNIC]: {
    labelEn: "Women's Ethnic",
    labelHi: 'महिला एथनिक वियर',
    icon: '👗',
    keywords: ['kurti', 'suit', 'saree', 'lehenga', 'dupatta', 'palazzo', 'anarkali', 'ethnic', 'salwar', 'chunni'],
  },
  [PERSONA_TYPES.MENS_WEAR]: {
    labelEn: "Men's Wear",
    labelHi: 'मेंस वियर',
    icon: '👔',
    keywords: ['shirt', 't-shirt', 'tshirt', 'jeans', 'trouser', 'kurta', 'pant', 'blazer', 'men', 'mens'],
  },
  [PERSONA_TYPES.COSMETICS]: {
    labelEn: 'Cosmetics & Beauty',
    labelHi: 'कॉस्मेटिक्स एवं ब्यूटी',
    icon: '💄',
    keywords: ['lipstick', 'serum', 'cream', 'foundation', 'makeup', 'beauty', 'kajal', 'eyeliner', 'nail', 'perfume', 'glow', 'skin'],
  },
};

const STORAGE_KEY = 'shopsilo_persona_affinity';

/**
 * Retrieves the current user persona affinity.
 */
export function getStoredPersona() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.persona) {
        return parsed;
      }
    }
  } catch {
    // ignore parse errors
  }
  return {
    persona: PERSONA_TYPES.ALL,
    scores: {
      [PERSONA_TYPES.WOMENS_ETHNIC]: 0,
      [PERSONA_TYPES.MENS_WEAR]: 0,
      [PERSONA_TYPES.COSMETICS]: 0,
    },
    updatedAt: Date.now(),
  };
}

/**
 * Tracks customer engagement and updates persona affinity automatically.
 * Weight: Category browse = 1, Product detail click = 3, Add to cart / reserve = 5
 */
export function trackPersonaEngagement(textOrCategory, weight = 1) {
  if (!textOrCategory) return;
  const str = String(textOrCategory).toLowerCase();

  const current = getStoredPersona();
  const scores = { ...current.scores };

  let matchedPersona = null;
  for (const [personaKey, meta] of Object.entries(PERSONA_META)) {
    if (personaKey === PERSONA_TYPES.ALL) continue;
    const hasMatch = meta.keywords.some((k) => str.includes(k));
    if (hasMatch) {
      scores[personaKey] = (scores[personaKey] || 0) + weight;
      matchedPersona = personaKey;
    }
  }

  if (matchedPersona) {
    // Determine dominant persona if it has at least 3 points and dominates other categories
    let maxKey = PERSONA_TYPES.ALL;
    let maxScore = 2; // threshold of 3 points

    for (const [k, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        maxKey = k;
      }
    }

    const payload = {
      persona: maxKey,
      scores,
      updatedAt: Date.now(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
    return payload;
  }

  return current;
}

/**
 * Sets user persona explicitly (e.g. when customer taps a persona pill).
 */
export function setExplicitPersona(personaKey) {
  const current = getStoredPersona();
  const payload = {
    ...current,
    persona: personaKey,
    updatedAt: Date.now(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {}
  return payload;
}

/**
 * Stable-sorts storefront products giving a priority boost to items matching the detected persona.
 */
export function rankProductsByPersona(products, personaKey) {
  if (!Array.isArray(products) || products.length === 0) return [];
  if (!personaKey || personaKey === PERSONA_TYPES.ALL) return products;

  const meta = PERSONA_META[personaKey];
  if (!meta || !meta.keywords) return products;

  const matches = (p) => {
    const text = `${p.name || ''} ${p.category || ''} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
    return meta.keywords.some((k) => text.includes(k));
  };

  const prioritized = [];
  const others = [];

  for (const prod of products) {
    if (matches(prod)) {
      prioritized.push(prod);
    } else {
      others.push(prod);
    }
  }

  return [...prioritized, ...others];
}
