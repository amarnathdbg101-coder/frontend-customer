import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, X, Volume2, Search, RotateCcw, AlertCircle, Sparkles } from 'lucide-react';
import {
  isSpeechRecognitionSupported,
  stripTrailingPunctuation,
  cleanVoiceTranscript,
  normalizeBilingualVoiceText,
  getFriendlySpeechErrorMessage,
} from '../../utils/voiceRecognition';

const QUICK_SUGGESTIONS = {
  'hi-IN': ['टाटा नमक', 'अमूल दूध', 'फॉर्च्यून तेल', 'सर्फ एक्सेल', 'आशीर्वाद आटा', 'मैगी'],
  'en-IN': ['Tata Salt', 'Amul Milk', 'Fortune Oil', 'Surf Excel', 'Aashirvaad Atta', 'Maggi'],
};

export const VoiceSearchModal = ({
  isOpen = false,
  onClose,
  onSearch,
  isHindi = false,
}) => {
  const [selectedLang, setSelectedLang] = useState(isHindi ? 'hi-IN' : 'en-IN');
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorCode, setErrorCode] = useState(null);

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const hasSubmittedRef = useRef(false);

  // Sync default language when isHindi prop changes
  useEffect(() => {
    setSelectedLang(isHindi ? 'hi-IN' : 'en-IN');
  }, [isHindi]);

  const stopRecognition = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Safe ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const handleSubmit = useCallback((queryToSubmit) => {
    if (hasSubmittedRef.current) return;
    const raw = (queryToSubmit || finalText || interimText || '').trim();
    if (!raw) return;

    hasSubmittedRef.current = true;
    stopRecognition();

    const clean = cleanVoiceTranscript(raw);
    const normalized = normalizeBilingualVoiceText(clean);

    onSearch?.(normalized || clean);
    onClose?.();
  }, [finalText, interimText, onClose, onSearch, stopRecognition]);

  // Start speech recognition instance
  const startRecognition = useCallback((langToUse = selectedLang) => {
    stopRecognition();
    setErrorCode(null);
    setInterimText('');
    setFinalText('');
    hasSubmittedRef.current = false;

    if (!isSpeechRecognitionSupported()) {
      setErrorCode('not-supported');
      setStatusMessage(
        isHindi
          ? 'इस ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है। कृपया लिखकर खोजें।'
          : 'Voice input is not supported in this browser. Please type to search.'
      );
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = langToUse;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 2;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage(
          langToUse === 'hi-IN'
            ? 'सुन रहे हैं... बोलिए (उदा. "अमूल दूध", "टाटा नमक")'
            : 'Listening... Speak now (e.g. "Amul Milk", "Tata Salt")'
        );
      };

      recognition.onresult = (event) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          const transcript = res[0]?.transcript || '';
          if (res.isFinal) {
            currentFinal += (currentFinal ? ' ' : '') + transcript;
          } else {
            currentInterim += (currentInterim ? ' ' : '') + transcript;
          }
        }

        const combinedText = (currentFinal || currentInterim || '').trim();
        if (combinedText) {
          setInterimText(currentInterim);
          setFinalText(currentFinal || combinedText);

          // Reset silence auto-submit timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          // If speech is detected, auto-submit after 1.4 seconds of silence
          silenceTimerRef.current = setTimeout(() => {
            handleSubmit(combinedText);
          }, 1400);
        }
      };

      recognition.onerror = (event) => {
        const err = event.error || 'unknown';
        // 'no-speech' is non-fatal if user is just thinking, but if continuous fails, show retry
        if (err === 'no-speech') {
          setStatusMessage(
            langToUse === 'hi-IN'
              ? 'आवाज़ सुनाई नहीं दी। कृपया माइक्रोफ़ोन के पास आकर दोबारा बोलें।'
              : 'Didn\'t catch that. Please speak closer to the mic.'
          );
        } else {
          setErrorCode(err);
          setStatusMessage(getFriendlySpeechErrorMessage(err, isHindi));
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Voice recognition initialization error:', e);
      setErrorCode('init-error');
      setStatusMessage(
        isHindi
          ? 'वॉइस सेवा शुरू करने में समस्या आई। पुनः प्रयास करें।'
          : 'Could not initialize voice search. Please try again.'
      );
      setIsListening(false);
    }
  }, [handleSubmit, isHindi, selectedLang, stopRecognition]);

  // Auto-start when modal opens; cleanup on close
  useEffect(() => {
    if (isOpen) {
      startRecognition(selectedLang);
    } else {
      stopRecognition();
      setInterimText('');
      setFinalText('');
      setErrorCode(null);
      hasSubmittedRef.current = false;
    }

    return () => {
      stopRecognition();
    };
  }, [isOpen, selectedLang, startRecognition, stopRecognition]);

  if (!isOpen) return null;

  const currentDisplay = finalText || interimText;
  const isHindiActive = selectedLang === 'hi-IN';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isHindi ? 'वॉइस सर्च' : 'Voice Search'}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopRecognition();
          onClose?.();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px 12px 20px',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          {/* Language Toggle Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f1f5f9',
              borderRadius: '999px',
              padding: '3px',
              gap: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setSelectedLang('hi-IN');
                startRecognition('hi-IN');
              }}
              style={{
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                padding: '5px 12px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                backgroundColor: isHindiActive ? '#ffffff' : 'transparent',
                color: isHindiActive ? '#2563eb' : '#64748b',
                boxShadow: isHindiActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              🇮🇳 हिन्दी
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedLang('en-IN');
                startRecognition('en-IN');
              }}
              style={{
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                padding: '5px 12px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                backgroundColor: !isHindiActive ? '#ffffff' : 'transparent',
                color: !isHindiActive ? '#2563eb' : '#64748b',
                boxShadow: !isHindiActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              English
            </button>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={() => {
              stopRecognition();
              onClose?.();
            }}
            aria-label="Close voice search"
            style={{
              background: '#f8fafc',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'background-color 0.15s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Animated Glowing Mic Circle */}
          <div
            style={{
              position: 'relative',
              width: '100px',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
            }}
          >
            {/* Outer Ripple 1 */}
            {isListening && (
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(37, 99, 235, 0.25)',
                  animation: 'voiceRipple 1.6s cubic-bezier(0, 0.2, 0.8, 1) infinite',
                }}
              />
            )}
            {/* Outer Ripple 2 */}
            {isListening && (
              <span
                style={{
                  position: 'absolute',
                  inset: '-12px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(37, 99, 235, 0.15)',
                  animation: 'voiceRipple 1.6s cubic-bezier(0, 0.2, 0.8, 1) infinite 0.4s',
                }}
              />
            )}

            {/* Mic Center Button */}
            <button
              type="button"
              onClick={() => {
                if (isListening) {
                  stopRecognition();
                } else {
                  startRecognition(selectedLang);
                }
              }}
              style={{
                position: 'relative',
                zIndex: 2,
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                backgroundColor: isListening ? '#2563eb' : (errorCode ? '#ef4444' : '#f1f5f9'),
                color: isListening || errorCode ? '#ffffff' : '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isListening
                  ? '0 10px 25px -5px rgba(37, 99, 235, 0.5)'
                  : '0 4px 12px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              title={isListening ? 'रोकने के लिए टैप करें' : 'बोलने के लिए टैप करें'}
            >
              {isListening ? (
                <Mic size={32} />
              ) : errorCode ? (
                <RotateCcw size={30} />
              ) : (
                <Mic size={32} />
              )}
            </button>
          </div>

          {/* Status Label */}
          <div style={{ minHeight: '26px', marginBottom: '12px' }}>
            {errorCode ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#dc2626',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  justifyContent: 'center',
                }}
              >
                <AlertCircle size={16} />
                <span>{statusMessage}</span>
              </div>
            ) : (
              <p
                style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: isListening ? '#2563eb' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                {isListening && <Volume2 size={16} className="animate-pulse" />}
                {statusMessage || (isHindiActive ? 'सुन रहे हैं... बोलिए' : 'Listening... Speak now')}
              </p>
            )}
          </div>

          {/* Live Transcript Display Box */}
          <div
            style={{
              width: '100%',
              minHeight: '80px',
              backgroundColor: '#f8fafc',
              border: currentDisplay ? '1.5px solid #93c5fd' : '1.5px dashed #cbd5e1',
              borderRadius: '16px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
              marginBottom: '18px',
              transition: 'border 0.2s ease',
            }}
          >
            {currentDisplay ? (
              <div style={{ width: '100%' }}>
                <span
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    lineHeight: 1.3,
                    wordBreak: 'break-word',
                  }}
                >
                  "{currentDisplay}"
                </span>
                {isListening && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: '3px',
                      height: '1.2rem',
                      backgroundColor: '#2563eb',
                      marginLeft: '4px',
                      verticalAlign: 'middle',
                      animation: 'blink 1s infinite',
                    }}
                  />
                )}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#94a3b8', fontStyle: 'italic' }}>
                {isHindiActive
                  ? 'उदा. "टाटा नमक", "अमूल दूध", "फॉर्च्यून तेल"...'
                  : 'Say "Tata Salt", "Amul Milk", "Fortune Oil"...'}
              </p>
            )}
          </div>

          {/* Quick Clickable Suggestions */}
          <div style={{ width: '100%', marginBottom: '18px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#64748b',
                marginBottom: '8px',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={13} color="#f59e0b" />
              <span>{isHindiActive ? 'सुझाव (क्लिक करें):' : 'Try saying / click:'}</span>
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                justifyContent: 'center',
              }}
            >
              {(QUICK_SUGGESTIONS[selectedLang] || QUICK_SUGGESTIONS['hi-IN']).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSubmit(item)}
                  style={{
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    padding: '5px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                    e.currentTarget.style.borderColor = '#93c5fd';
                    e.currentTarget.style.color = '#1d4ed8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.color = '#334155';
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            {currentDisplay && (
              <button
                type="button"
                onClick={() => handleSubmit(currentDisplay)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '12px 20px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  transition: 'background-color 0.15s',
                }}
              >
                <Search size={18} />
                <span>{isHindiActive ? 'अभी खोजें' : 'Search Now'}</span>
              </button>
            )}

            {errorCode && (
              <button
                type="button"
                onClick={() => startRecognition(selectedLang)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '12px 20px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={18} />
                <span>{isHindiActive ? 'दोबारा प्रयास करें' : 'Try Again'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes voiceRipple {
          0% {
            transform: scale(0.9);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default VoiceSearchModal;
