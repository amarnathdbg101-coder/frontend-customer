import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Search,
  MapPin,
  Store,
  Navigation,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { productApi } from '../../api/product.api';
import { shopApi } from '../../api/shop.api';
import { useLocation } from '../../context/LocationContext';
import { calculateDistanceKm, formatDistance } from '../../utils/distance';

const SUGGESTED_QUERIES = [
  'Cheapest headphones',
  'Type C Cable available nearby',
  'Pharmacy open near me',
  'Compare prices for Paracetamol',
  'In stock groceries',
];

export const CustomerCopilotModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { coords } = useLocation();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'pick',
      text: "Hi! I'm Pick, your shopping co-pilot. I search products across nearby physical shops, compare prices, check stock and opening status, and open directions. What are you looking for today?",
    },
  ]);
  const [searching, setSearching] = useState(false);

  if (!isOpen) return null;

  const handleQuery = async (queryText) => {
    const text = queryText || input;
    if (!text.trim()) return;

    // Add user message
    const userMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSearching(true);

    try {
      // Search products & shops
      const [prodRes, shopRes] = await Promise.allSettled([
        productApi.listPublicProducts({ q: text, limit: 6 }),
        shopApi.listPublicShops({ q: text, limit: 4 }),
      ]);

      const products = prodRes.status === 'fulfilled' ? prodRes.value?.products || [] : [];
      const shops = shopRes.status === 'fulfilled' ? shopRes.value?.shops || shopRes.value || [] : [];

      let responseText = '';
      if (products.length === 0 && shops.length === 0) {
        responseText = `I couldn't find any items or shops matching "${text}" near you right now. Try searching for broader terms like "mobile", "medicine", or "grocery".`;
      } else if (products.length > 0) {
        responseText = `Found ${products.length} matching product${products.length > 1 ? 's' : ''} in stock at nearby local shops:`;
      } else {
        responseText = `Found ${shops.length} shop${shops.length > 1 ? 's' : ''} matching "${text}" near you:`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'pick',
          text: responseText,
          products,
          shops: products.length === 0 ? shops : [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'pick',
          text: "Sorry, I had trouble searching nearby shops right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface, #ffffff)',
          width: '100%',
          maxWidth: '520px',
          margin: '0 auto',
          height: '85vh',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 -8px 30px rgba(0,0,0,0.25)',
          border: '1px solid var(--border-subtle, #e2e8f0)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0f172a',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              <Bot size={22} color="#0f172a" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff' }}>
                Pick Shopping Assistant <Sparkles size={14} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Your Local Shopping Assistant
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  backgroundColor: msg.sender === 'user' ? '#0f172a' : 'var(--bg-surface-subtle, #f8fafc)',
                  color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary, #0f172a)',
                  fontSize: '0.88rem',
                  lineHeight: 1.45,
                  fontWeight: 500,
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle, #e2e8f0)',
                }}
              >
                {msg.text}
              </div>

              {/* Product Cards Result */}
              {msg.products && msg.products.length > 0 && (
                <div style={{ width: '100%', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {msg.products.map((p) => {
                    const distKm = calculateDistanceKm(
                      coords?.lat,
                      coords?.lng,
                      p.shop_latitude,
                      p.shop_longitude
                    );

                    return (
                      <div
                        key={p.id}
                        className="card"
                        style={{
                          margin: 0,
                          padding: '12px',
                          borderRadius: '12px',
                          border: '1px solid var(--border-subtle, #e2e8f0)',
                          backgroundColor: 'var(--bg-surface, #ffffff)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{p.name}</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '3px' }}>
                              <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '0.95rem' }}>
                                ₹{p.price}
                              </span>
                              {p.mrp && p.mrp > p.price && (
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                                  ₹{p.mrp}
                                </span>
                              )}
                              {p.mrp && p.mrp > p.price && (
                                <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 800, backgroundColor: '#dcfce7', padding: '1px 6px', borderRadius: '4px' }}>
                                  Save ₹{p.mrp - p.price}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Store size={12} color="#0f172a" />
                              <span>{p.shop_name || 'Local Store'}</span>
                              {distKm !== null && <span>• {formatDistance(distKm)}</span>}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              navigate(`/shop/${p.shop_slug || 'store'}/product/${p.id}`, { state: { product: p } });
                            }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              backgroundColor: '#0f172a',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            View →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Shop Cards Result */}
              {msg.shops && msg.shops.length > 0 && (
                <div style={{ width: '100%', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {msg.shops.map((s) => (
                    <div
                      key={s.id || s.slug}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid var(--border-subtle, #e2e8f0)',
                        backgroundColor: 'var(--bg-surface, #ffffff)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{s.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={11} color="#0f172a" />
                          <span>{s.address || s.city || 'Local Store'}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate(`/shop/${s.slug}`);
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        Visit Store →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {searching && (
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic', fontWeight: 600 }}>
              Searching nearby stores for you...
            </div>
          )}
        </div>

        {/* Suggested Queries */}
        <div style={{ padding: '8px 16px', overflowX: 'auto', display: 'flex', gap: '6px', borderTop: '1px solid var(--border-subtle, #e2e8f0)', scrollbarWidth: 'none' }}>
          {SUGGESTED_QUERIES.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleQuery(q)}
              style={{
                whiteSpace: 'nowrap',
                padding: '5px 10px',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
                color: 'var(--text-primary, #0f172a)',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleQuery();
          }}
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-subtle, #e2e8f0)',
            display: 'flex',
            gap: '8px',
            backgroundColor: 'var(--bg-surface, #ffffff)',
          }}
        >
          <input
            type="text"
            placeholder="Ask Pick (e.g., 'In stock Paracetamol near me')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle, #e2e8f0)',
              backgroundColor: 'var(--bg-surface-subtle, #f8fafc)',
              color: 'var(--text-primary, #0f172a)',
              fontSize: '0.86rem',
              outline: 'none',
              fontWeight: 500,
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || searching}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              cursor: !input.trim() || searching ? 'not-allowed' : 'pointer',
              opacity: !input.trim() || searching ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerCopilotModal;
