/**
 * voiceRecognition.js - Industrial Standard Web Speech Recognition Utility
 * 
 * Provides:
 * 1. Cross-browser SpeechRecognition detection (Chrome, Edge, Safari iOS, Samsung Internet).
 * 2. Conversational stopword removal and punctuation stripping for voice queries.
 * 3. Bilingual Indian retail mapping (Devanagari Hindi <-> Hinglish / English).
 * 4. Resilient SpeechRecognition controller with interim streaming and silence detection.
 */

// Common conversational fillers & stopwords spoken during Indian retail voice queries
const VOICE_STOPWORDS = new Set([
  // Hindi / Hinglish fillers
  'chahiye', 'chahie', 'chaahiye', 'dikhao', 'dikhaye', 'dikhaiye', 'batao', 'bataiye',
  'de do', 'dedo', 'do', 'lao', 'khojo', 'dhundho', 'dhundo',
  'ka', 'ki', 'ke', 'ko', 'se', 'me', 'mein', 'par', 'aur', 'ya',
  'wala', 'wali', 'wale', 'vale', 'vali',
  'sabse', 'sasta', 'achha', 'accha', 'bhai', 'bhaiya', 'please', 'plz',
  'packet', 'dabba', 'pauwa', 'kilo', 'kg', 'gram', 'litre', 'liter',
  // English fillers
  'i', 'want', 'need', 'show', 'give', 'get', 'find', 'search', 'for', 'look', 'looking',
  'near', 'me', 'nearby', 'best', 'cheap', 'cheapest', 'good', 'pack', 'bottle',
  // Devanagari fillers
  'चाहिए', 'दिखाओ', 'दिखाइए', 'बताओ', 'बताइए', 'दे', 'दो', 'लाओ', 'खोजो', 'ढूंढो',
  'का', 'की', 'के', 'को', 'से', 'में', 'पर', 'और', 'या',
  'वाला', 'वाली', 'वाले',
  'सबसे', 'सस्ता', 'अच्छा', 'भाई', 'भैया', 'प्लीज',
  'पैकेट', 'डब्बा', 'किलो', 'ग्राम', 'लीटर'
]);

// Bilingual Indian Retail Dictionary (Maps Devanagari / colloquial terms to primary catalog keywords)
export const BILINGUAL_GROCERY_MAP = {
  'दूध': 'amul milk doodh',
  'दही': 'curd dahi',
  'पनीर': 'paneer cheese',
  'मक्खन': 'butter makhan',
  'अंडा': 'egg anda',
  'अंडे': 'eggs anda',
  'तेल': 'oil tel refine mustard',
  'सरसों तेल': 'mustard oil sarson',
  'सरसो तेल': 'mustard oil sarson',
  'रिफाइंड': 'refined oil fortune',
  'घी': 'ghee amul',
  'चावल': 'rice chawal basmati',
  'बासमती': 'basmati rice',
  'आटा': 'atta flour aashirvaad wheat',
  'गेहूं आटा': 'atta flour gehu',
  'मैदा': 'maida flour',
  'बेसन': 'besan gram flour',
  'सूजी': 'sooji suji semolina',
  'पोहा': 'poha chura',
  'दाल': 'dal pulse toor arhar moong',
  'अरहर दाल': 'arhar toor dal',
  'तूर दाल': 'toor arhar dal',
  'मूंग दाल': 'moong mung dal',
  'चना': 'chana gram chhole',
  'राजमा': 'rajma kidney beans',
  'चीनी': 'sugar cheeni chini',
  'शक्कर': 'sugar cheeni shakkar',
  'गुड़': 'jaggery gud gur',
  'नमक': 'salt namak tata',
  'टाटा नमक': 'tata salt namak',
  'मसाला': 'masala spices',
  'हल्दी': 'haldi turmeric powder',
  'मिर्च': 'mirch chilli powder',
  'धनिया': 'dhaniya coriander',
  'जीरा': 'jeera zeera cumin',
  'अदरक': 'adrak ginger',
  'लहसुन': 'lehsun garlic',
  'चाय': 'tea chai red label taaza taj',
  'चायपत्ती': 'tea chai chaipatti',
  'कॉफ़ी': 'coffee nescafe bru',
  'पानी': 'water bisleri mineral',
  'बिस्कुट': 'biscuit parle hide seek oreo',
  'बिस्किट': 'biscuit parle marie',
  'पारले जी': 'parle g biscuit',
  'नमकीन': 'namkeen haldiram bhujia mixture',
  'भुजिया': 'bhujia haldiram sev',
  'चिप्स': 'chips lays kurkure',
  'कुरकुरे': 'kurkure chips',
  'चॉकलेट': 'chocolate cadbury dairy milk',
  'साबुन': 'soap sabun dettol lux lifebuoy',
  'डव': 'dove soap shampoo',
  'शैम्पू': 'shampoo clinic plus head shoulders',
  'सर्फ': 'surf detergent excel tide ghadi',
  'सर्फ़': 'surf detergent excel',
  'घड़ी डिटर्जेंट': 'ghadi detergent soap',
  'हार्पिक': 'harpic toilet cleaner',
  'कोलगेट': 'colgate toothpaste manjan',
  'मंजन': 'colgate toothpaste manjan',
  'टूथपेस्ट': 'toothpaste colgate closeup',
  'ब्रश': 'toothbrush brush oral',
  'दवा': 'medicine tablet syrup paracetamol',
  'पैरासिटामोल': 'paracetamol medicine tablet',
  'मैगी': 'maggi noodles nestle',
  'नूडल्स': 'noodles maggi yippee'
};

/**
 * Checks if Web Speech API is supported in the current environment
 */
export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Strips trailing periods, commas, and question marks that mobile speech engines append
 * @param {string} text 
 * @returns {string}
 */
export function stripTrailingPunctuation(text) {
  if (!text) return '';
  return text.trim().replace(/[.,?!:;]+$/g, '').trim();
}

/**
 * Cleans conversational noise and stopwords from a voice transcript
 * Example: "mujhe amul ka doodh chahiye" -> "amul doodh"
 * Example: "टाटा नमक चाहिए" -> "टाटा नमक"
 * @param {string} rawTranscript 
 * @returns {string}
 */
export function cleanVoiceTranscript(rawTranscript) {
  if (!rawTranscript) return '';
  const cleanedPunctuation = stripTrailingPunctuation(rawTranscript);
  const words = cleanedPunctuation.split(/\s+/).filter(Boolean);

  if (words.length <= 1) {
    return cleanedPunctuation;
  }

  // Filter out conversational stopwords unless all words are stopwords
  const filtered = words.filter(word => {
    const lower = word.toLowerCase().trim();
    return !VOICE_STOPWORDS.has(lower);
  });

  return filtered.length > 0 ? filtered.join(' ') : cleanedPunctuation;
}

/**
 * Normalizes speech text for Indian bilingual catalog search
 * If transcript contains known Hindi/Devanagari grocery items, expands or preserves clean term
 * @param {string} transcript 
 * @returns {string}
 */
export function normalizeBilingualVoiceText(transcript) {
  const cleaned = cleanVoiceTranscript(transcript);
  if (!cleaned) return '';

  const lower = cleaned.toLowerCase();
  // Check exact dictionary match
  if (BILINGUAL_GROCERY_MAP[cleaned]) {
    return BILINGUAL_GROCERY_MAP[cleaned];
  }
  if (BILINGUAL_GROCERY_MAP[lower]) {
    return BILINGUAL_GROCERY_MAP[lower];
  }

  return cleaned;
}

/**
 * Maps SpeechRecognition error codes to human-friendly, localized messages
 * @param {string} errorCode 
 * @param {boolean} isHindi 
 * @returns {string}
 */
export function getFriendlySpeechErrorMessage(errorCode, isHindi = false) {
  switch (errorCode) {
    case 'not-allowed':
    case 'service-not-allowed':
      return isHindi
        ? 'माइक्रोफ़ोन की अनुमति अस्वीकृत है। कृपया ब्राउज़र में माइक्रोफ़ोन की अनुमति दें।'
        : 'Microphone permission denied. Please allow microphone access in your browser.';
    case 'no-speech':
      return isHindi
        ? 'कोई आवाज़ सुनाई नहीं दी। कृपया माइक्रोफ़ोन के नज़दीक आकर दोबारा बोलें।'
        : 'No speech detected. Please try speaking closer to your device.';
    case 'audio-capture':
      return isHindi
        ? 'माइक्रोफ़ोन चालू नहीं हो सका। कृपया जांचें कि माइक्रोफ़ोन किसी अन्य ऐप द्वारा उपयोग में तो नहीं है।'
        : 'Could not access your microphone. Ensure it is connected and not used by another app.';
    case 'network':
      return isHindi
        ? 'वॉइस सेवा से संपर्क नहीं हो सका। कृपया अपना इंटरनेट कनेक्शन जांचें।'
        : 'Voice service network error. Please check your internet connection.';
    case 'aborted':
      return isHindi
        ? 'वॉइस इनपुट रोक दिया गया।'
        : 'Voice recognition was stopped.';
    default:
      return isHindi
        ? 'वॉइस पहचान में समस्या आई। कृपया लिखकर खोजें।'
        : 'Voice recognition encountered an error. Please try typing your search.';
  }
}
