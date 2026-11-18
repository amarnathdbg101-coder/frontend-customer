import { useState, useRef, useCallback, useEffect } from 'react';
import {
  isSpeechRecognitionSupported,
  cleanVoiceTranscript,
  normalizeBilingualVoiceText,
  getFriendlySpeechErrorMessage,
} from '../utils/voiceRecognition';

/**
 * useInlineVoiceSearch
 * 
 * Provides instantaneous, zero-popup voice-to-text search directly within any search bar.
 * Captures microphone sound immediately on tap, streams interim transcript in real-time,
 * and auto-executes search on speech completion.
 *
 * @param {Object} options
 * @param {Function} options.onTranscript - Called as user speaks with live transcript (liveText, isFinal)
 * @param {Function} options.onSearch - Called when utterance completes with cleaned query
 * @param {boolean} options.isHindi - Language preference (hi-IN vs en-IN)
 * @param {Function} [options.onError] - Optional callback for user-friendly error messages
 * @param {number} [options.silenceDelayMs] - Silence debounce before auto-submitting interim speech (default 750ms)
 */
export function useInlineVoiceSearch({
  onTranscript,
  onSearch,
  isHindi = false,
  onError,
  silenceDelayMs = 750,
} = {}) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const hasFinishedRef = useRef(false);
  const latestTranscriptRef = useRef('');

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Safe ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const handleFinish = useCallback((rawText) => {
    if (hasFinishedRef.current) return;
    const text = (rawText || latestTranscriptRef.current || '').trim();
    if (!text) {
      stopListening();
      return;
    }

    hasFinishedRef.current = true;
    stopListening();

    // 1. Clean conversational stopwords (e.g. "chahiye", "dikhao", "de do")
    const clean = cleanVoiceTranscript(text);
    // 2. Bilingual dictionary normalization
    const normalized = normalizeBilingualVoiceText(clean);
    const finalQuery = normalized || clean || text;

    onTranscript?.(finalQuery, true);
    onSearch?.(finalQuery);
  }, [onSearch, onTranscript, stopListening]);

  const startListening = useCallback(async () => {
    stopListening();
    setErrorMessage('');
    setInterimTranscript('');
    latestTranscriptRef.current = '';
    hasFinishedRef.current = false;

    if (!isSpeechRecognitionSupported()) {
      const msg = isHindi
        ? 'इस ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है। कृपया लिखकर खोजें।'
        : 'Voice input is not supported in this browser. Please type to search.';
      setErrorMessage(msg);
      onError?.(msg);
      return;
    }

    // Proactively check / prompt microphone permission if getUserMedia is available
    if (typeof navigator !== 'undefined' && navigator?.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately stop all audio tracks so the SpeechRecognition engine has full control of microphone
        stream.getTracks().forEach((track) => track.stop());
      } catch (permErr) {
        console.warn('Microphone permission query:', permErr);
        if (permErr?.name === 'NotAllowedError' || permErr?.name === 'PermissionDeniedError') {
          const msg = isHindi
            ? 'माइक्रोफ़ोन की अनुमति अस्वीकृत है। कृपया ब्राउज़र में अनुमति दें।'
            : 'Microphone permission denied. Please allow microphone access in your browser.';
          setErrorMessage(msg);
          onError?.(msg);
          return;
        }
      }
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = isHindi ? 'hi-IN' : 'en-IN';
      // continuous = false ensures fast native boundary detection when user stops speaking
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
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

        const candidate = (currentFinal || currentInterim || '').trim();
        if (candidate) {
          latestTranscriptRef.current = candidate;
          setInterimTranscript(candidate);
          onTranscript?.(candidate, Boolean(currentFinal));

          if (currentFinal) {
            handleFinish(currentFinal);
            return;
          }

          // Fallback silence timer for browsers that delay isFinal
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          silenceTimerRef.current = setTimeout(() => {
            handleFinish(candidate);
          }, silenceDelayMs);
        }
      };

      recognition.onerror = (event) => {
        const err = event.error || 'unknown';
        if (err !== 'no-speech' && err !== 'aborted') {
          const friendly = getFriendlySpeechErrorMessage(err, isHindi);
          setErrorMessage(friendly);
          onError?.(friendly);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // If recognition ended naturally with captured text, trigger submission
        if (!hasFinishedRef.current && latestTranscriptRef.current) {
          handleFinish(latestTranscriptRef.current);
        }
      };

      recognition.start();
    } catch (e) {
      console.warn('Inline voice recognition start failed:', e);
      setIsListening(false);
      const msg = isHindi ? 'वॉइस सेवा शुरू नहीं हो सकी।' : 'Failed to start voice recognition.';
      setErrorMessage(msg);
      onError?.(msg);
    }
  }, [handleFinish, isHindi, onError, onTranscript, silenceDelayMs, stopListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    interimTranscript,
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
  };
}

export default useInlineVoiceSearch;
