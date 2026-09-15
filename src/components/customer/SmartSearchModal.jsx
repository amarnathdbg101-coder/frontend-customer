import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Search,
  Mic,
  MicOff,
  Store,
  ArrowRight,
  Package,
  Clock,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { aiApi } from '../../api/ai.api';
import { productApi } from '../../api/product.api';
import { useLocation } from '../../context/LocationContext';
import { formatCurrency } from '../../utils/format';

const SUGGESTIONS = [
  'Khane ke baad meetha chahiye',
  'Sar dard ya bukhar ki tablet',
  'Chai patti aur doodh',
  'Cold drink aur chips party ke liye',
  'Baby soap and diapers',
];

export const SmartSearchModal = ({ isOpen, onClose, onSelectProduct }) => {
  const { coords } = useLocation();
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [results, setResults] = useState([]);
  const [searchedOnce, setSearchedOnce] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setKeywords([]);
      setResults([]);
      setSearchedOnce(false);
      setErrorMsg('');
      setIsListening(false);
    }
  }, [isOpen]);

  const handleSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Aapke browser me voice input support nahi hai. Kripya type karein.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // Hindi-India with Hinglish fallback
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript || '';
        if (transcript) {
          setQuery(transcript);
          performSmartSearch(transcript);
        }
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  const performSmartSearch = async (searchQuery) => {
    const text = (searchQuery || query).trim();
    if (!text) return;

    try {
      setIsSearching(true);
      setErrorMsg('');
      setSearchedOnce(true);

      // Call AI Semantic Search
      const aiRes = await aiApi.semanticSearch(text, coords?.lat, coords?.lng);
      const extractedKeywords = aiRes?.keywords || [];
      setKeywords(extractedKeywords);

      // Search nearby products with primary term and fallback
      const searchTerms = extractedKeywords.length > 0 ? extractedKeywords.join(' ') : text;
      const prodRes = await productApi.findNearbyProducts({
        q: searchTerms,
        lat: coords?.lat,
        lng: coords?.lng,
        radius_km: 15,
      });

      const list = Array.isArray(prodRes?.products)
        ? prodRes.products
        : (Array.isArray(prodRes?.data) ? prodRes.data : (Array.isArray(prodRes) ? prodRes : []));

      // If initial search yields no products, fallback to raw user text search
      if (list.length === 0 && searchTerms !== text) {
        const fallbackRes = await productApi.findNearbyProducts({
          q: text,
          lat: coords?.lat,
          lng: coords?.lng,
          radius_km: 20,
        });
        const fallbackList = Array.isArray(fallbackRes?.products)
          ? fallbackRes.products
          : (Array.isArray(fallbackRes?.data) ? fallbackRes.data : []);
        setResults(fallbackList);
      } else {
        setResults(list);
      }
    } catch (err) {
      console.error('Smart search error:', err);
      setErrorMsg('Smart search me dikkat aayi. Kripya doosra shabd search karein.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    performSmartSearch();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                AI Smart Search
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Apni bhasha me bolein ya likhein — AI zaroorat samajh kar saman dhundhega
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-surface-subtle)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Input Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '0 12px',
              }}
            >
              <Search size={18} color="var(--text-muted)" style={{ marginRight: '8px', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Jaise: meetha khana hai, sar dard ki tablet..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 0',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={handleSpeech}
                title={isListening ? 'Stop listening' : 'Speak in Hindi / English'}
                style={{
                  background: isListening ? '#ef4444' : 'transparent',
                  color: isListening ? '#ffffff' : 'var(--color-primary)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="btn btn-primary"
              style={{ padding: '11px 18px', fontWeight: 800, borderRadius: 'var(--radius-lg)' }}
            >
              {isSearching ? <RefreshCw size={16} className="spin" /> : 'Search'}
            </button>
          </form>

          {/* Preset Pill Suggestions */}
          {!searchedOnce && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                SUGGESTED EXAMPLES:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(sug);
                      performSmartSearch(sug);
                    }}
                    style={{
                      backgroundColor: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-full)',
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Extracted Keywords Badge */}
          {keywords.length > 0 && (
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                AI Keywords:
              </span>
              {keywords.map((kw, i) => (
                <span
                  key={i}
                  style={{
                    backgroundColor: 'rgba(99, 102, 241, 0.12)',
                    color: 'var(--color-primary)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  #{kw}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Results Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {isSearching ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <RefreshCw size={32} color="var(--color-primary)" className="spin" style={{ margin: '0 auto 12px auto' }} />
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                Aas-paas ki dukaano me dhundh rahe hain...
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                AI semantic understanding & inventory matching
              </div>
            </div>
          ) : searchedOnce ? (
            results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Package size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  Is zaroorat ka product nazdeeki dukaano me nahi mila
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Kripya general search karein ya radius badhayein
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  MATCHING ITEMS ({results.length}):
                </div>
                {results.map((prod) => {
                  const qty = Number(
                    prod.available_quantity ??
                    prod.stock_quantity ??
                    prod.inventory?.available_quantity ??
                    prod.stock ??
                    0
                  );
                  return (
                    <div
                      key={prod.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        border: '1px solid var(--border-subtle)',
                        gap: '12px',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {prod.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                          <span>{prod.brand || prod.category_name || 'Item'}</span>
                          <span>•</span>
                          <span style={{ color: qty > 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 700 }}>
                            {qty > 0 ? `${qty} in stock` : 'Out of stock'}
                          </span>
                        </div>
                        {prod.shop_name && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Store size={12} />
                            <span>{prod.shop_name}</span>
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                          {formatCurrency(prod.price)}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectProduct) onSelectProduct(prod);
                            onClose();
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ marginTop: '4px', fontSize: '0.74rem', padding: '4px 10px', gap: '4px' }}
                        >
                          <span>Select</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Upar box me apni zaroorat likhein ya mic daba kar bolein.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
