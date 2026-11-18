import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useInlineVoiceSearch } from './useInlineVoiceSearch';

describe('useInlineVoiceSearch Hook', () => {
  let mockRecognition;
  let mockGetUserMedia;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockRecognition = {
      lang: '',
      continuous: false,
      interimResults: false,
      maxAlternatives: 1,
      start: vi.fn(function () {
        this.onstart && this.onstart();
      }),
      abort: vi.fn(function () {
        this.onend && this.onend();
      }),
      onstart: null,
      onresult: null,
      onerror: null,
      onend: null,
    };

    window.SpeechRecognition = vi.fn().mockImplementation(() => mockRecognition);
    window.webkitSpeechRecognition = window.SpeechRecognition;

    mockGetUserMedia = vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    });
    navigator.mediaDevices = {
      getUserMedia: mockGetUserMedia,
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
  });

  it('initializes with default non-listening state', () => {
    const { result } = renderHook(() => useInlineVoiceSearch());
    expect(result.current.isListening).toBe(false);
    expect(result.current.interimTranscript).toBe('');
    expect(result.current.errorMessage).toBe('');
  });

  it('starts listening immediately when toggleListening is invoked', async () => {
    const { result } = renderHook(() =>
      useInlineVoiceSearch({ isHindi: false })
    );

    await act(async () => {
      result.current.toggleListening();
    });

    expect(result.current.isListening).toBe(true);
    expect(mockRecognition.lang).toBe('en-IN');
    expect(mockRecognition.continuous).toBe(false);
    expect(mockRecognition.interimResults).toBe(true);
  });

  it('configures Hindi language when isHindi is true', async () => {
    const { result } = renderHook(() =>
      useInlineVoiceSearch({ isHindi: true })
    );

    await act(async () => {
      result.current.toggleListening();
    });

    expect(mockRecognition.lang).toBe('hi-IN');
  });

  it('streams interim transcript and auto-searches immediately on final speech result', async () => {
    const onTranscript = vi.fn();
    const onSearch = vi.fn();

    const { result } = renderHook(() =>
      useInlineVoiceSearch({ onTranscript, onSearch, isHindi: false })
    );

    await act(async () => {
      result.current.toggleListening();
    });

    // Simulate interim event
    act(() => {
      mockRecognition.onresult({
        results: [
          [{ transcript: 'amul' }],
        ],
      });
    });

    expect(onTranscript).toHaveBeenCalledWith('amul', false);
    expect(result.current.interimTranscript).toBe('amul');

    // Simulate final event
    act(() => {
      const finalResultItem = [{ transcript: 'amul doodh chahiye' }];
      finalResultItem.isFinal = true;
      mockRecognition.onresult({
        results: [finalResultItem],
      });
    });

    // Stop words cleaned ("chahiye" removed)
    expect(onSearch).toHaveBeenCalledWith('amul doodh');
    expect(result.current.isListening).toBe(false);
  });

  it('auto-searches after silence threshold if isFinal is delayed', async () => {
    const onSearch = vi.fn();

    const { result } = renderHook(() =>
      useInlineVoiceSearch({ onSearch, silenceDelayMs: 500 })
    );

    await act(async () => {
      result.current.toggleListening();
    });

    act(() => {
      mockRecognition.onresult({
        results: [
          [{ transcript: 'fortune oil' }],
        ],
      });
    });

    expect(onSearch).not.toHaveBeenCalled();

    // Fast-forward past silence delay
    act(() => {
      vi.advanceTimersByTime(550);
    });

    expect(onSearch).toHaveBeenCalledWith('fortune oil');
    expect(result.current.isListening).toBe(false);
  });

  it('toggles off when already listening', async () => {
    const { result } = renderHook(() => useInlineVoiceSearch());

    await act(async () => {
      result.current.toggleListening();
    });
    expect(result.current.isListening).toBe(true);

    act(() => {
      result.current.toggleListening();
    });
    expect(result.current.isListening).toBe(false);
  });
});
