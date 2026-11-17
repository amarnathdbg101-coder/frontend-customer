import { describe, it, expect } from 'vitest';
import {
  isSpeechRecognitionSupported,
  stripTrailingPunctuation,
  cleanVoiceTranscript,
  normalizeBilingualVoiceText,
  getFriendlySpeechErrorMessage,
} from './voiceRecognition';

describe('Voice Recognition Utility Suite', () => {
  it('detects SpeechRecognition availability safely in test environment', () => {
    // In node/vitest window.SpeechRecognition is undefined unless polyfilled
    expect(typeof isSpeechRecognitionSupported()).toBe('boolean');
  });

  it('strips trailing punctuation from speech results', () => {
    expect(stripTrailingPunctuation('Tata Salt.')).toBe('Tata Salt');
    expect(stripTrailingPunctuation('Amul doodh?')).toBe('Amul doodh');
    expect(stripTrailingPunctuation('Fortune refined oil! ')).toBe('Fortune refined oil');
    expect(stripTrailingPunctuation('टाटा नमक...')).toBe('टाटा नमक');
    expect(stripTrailingPunctuation('')).toBe('');
  });

  it('cleans conversational stopwords and fillers', () => {
    expect(cleanVoiceTranscript('amul ka doodh chahiye')).toBe('amul doodh');
    expect(cleanVoiceTranscript('sabse sasta tel dikhao')).toBe('tel');
    expect(cleanVoiceTranscript('i want surf excel')).toBe('surf excel');
    expect(cleanVoiceTranscript('show me fortune oil')).toBe('fortune oil');
    expect(cleanVoiceTranscript('टाटा नमक चाहिए')).toBe('टाटा नमक');
  });

  it('preserves single-word queries without stripping them away', () => {
    expect(cleanVoiceTranscript('doodh')).toBe('doodh');
    expect(cleanVoiceTranscript('tel')).toBe('tel');
    expect(cleanVoiceTranscript('दूध')).toBe('दूध');
  });

  it('normalizes bilingual grocery terms for catalog matching', () => {
    expect(normalizeBilingualVoiceText('दूध')).toContain('milk');
    expect(normalizeBilingualVoiceText('टाटा नमक')).toContain('tata salt');
    expect(normalizeBilingualVoiceText('मैगी')).toContain('maggi');
  });

  it('returns friendly localized error messages', () => {
    expect(getFriendlySpeechErrorMessage('not-allowed', true)).toContain('माइक्रोफ़ोन की अनुमति अस्वीकृत');
    expect(getFriendlySpeechErrorMessage('not-allowed', false)).toContain('Microphone permission denied');
    expect(getFriendlySpeechErrorMessage('no-speech', true)).toContain('कोई आवाज़ सुनाई नहीं दी');
    expect(getFriendlySpeechErrorMessage('no-speech', false)).toContain('No speech detected');
    expect(getFriendlySpeechErrorMessage('network', true)).toContain('इंटरनेट कनेक्शन');
  });
});
