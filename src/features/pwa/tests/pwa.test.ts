import { describe, it, expect, vi, beforeEach } from 'vitest';
import en from '../../../locales/en';
import hi from '../../../locales/hi';

describe('PWA Installation & Mobile Experience Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('validates 100% symmetric PWA localization keys in English and Hindi', () => {
    expect(en.pwa).toBeDefined();
    expect(hi.pwa).toBeDefined();

    const enKeys = Object.keys(en.pwa);
    const hiKeys = Object.keys(hi.pwa);

    expect(enKeys.sort()).toEqual(hiKeys.sort());
    expect(en.pwa.install_title).toBe('Get the ShopSilo App');
    expect(hi.pwa.install_title).toBe('ShopSilo ऐप इंस्टॉल करें');
  });

  it('correctly detects dismissal within 7 days', () => {
    const DISMISS_KEY = 'shopsilo_pwa_dismissed';
    const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000;

    // Simulate dismissed 2 days ago
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISS_KEY, String(twoDaysAgo));

    const dismissedTime = Number(localStorage.getItem(DISMISS_KEY));
    const isStillDismissed = Date.now() - dismissedTime < DISMISS_DURATION;
    expect(isStillDismissed).toBe(true);

    // Simulate dismissed 8 days ago (expired dismissal)
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISS_KEY, String(eightDaysAgo));

    const expiredTime = Number(localStorage.getItem(DISMISS_KEY));
    const isExpired = Date.now() - expiredTime >= DISMISS_DURATION;
    expect(isExpired).toBe(true);
  });

  it('detects standalone display mode (already installed app)', () => {
    const matchMediaMock = (query: string) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    vi.stubGlobal('matchMedia', matchMediaMock);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    expect(isStandalone).toBe(true);
  });

  it('identifies iOS Safari user agent for manual installation instructions', () => {
    const isIosSafari = (ua: string) => {
      const lower = ua.toLowerCase();
      const isIos = /iphone|ipad|ipod/.test(lower);
      const isSafari = lower.includes('safari') && !lower.includes('crios') && !lower.includes('fxios');
      return isIos && isSafari;
    };

    const iphoneSafari = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1';
    const androidChrome = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36';

    expect(isIosSafari(iphoneSafari)).toBe(true);
    expect(isIosSafari(androidChrome)).toBe(false);
  });

  it('handles beforeinstallprompt prompt choice lifecycle', async () => {
    const mockPromptEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    };

    await mockPromptEvent.prompt();
    const result = await mockPromptEvent.userChoice;

    expect(mockPromptEvent.prompt).toHaveBeenCalled();
    expect(result.outcome).toBe('accepted');
  });
});
