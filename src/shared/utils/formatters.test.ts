import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  parseSafeDate,
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
} from './formatters';

describe('Shared Formatters Utility Tests', () => {
  it('should format currency accurately in Indian Rupee representation (INR)', () => {
    expect(formatCurrency(0)).toContain('0');
    expect(formatCurrency(250)).toContain('250');
    expect(formatCurrency(12500)).toContain('12,500');
  });

  it('should parse safe date string and handle invalid date inputs gracefully', () => {
    expect(parseSafeDate('')).toBeNull();
    expect(parseSafeDate(undefined)).toBeNull();
    expect(parseSafeDate('invalid-date')).toBeNull();

    const validDate = parseSafeDate('2026-10-18T10:30:00Z');
    expect(validDate).toBeInstanceOf(Date);
    expect(validDate?.getFullYear()).toBe(2026);
  });

  it('should format date and time strings accurately', () => {
    const formattedDate = formatDate('2026-10-18T10:30:00Z');
    expect(formattedDate).toContain('2026');
    expect(formattedDate).toContain('Oct');

    const formattedTime = formatTime('2026-10-18T10:30:00Z');
    expect(formattedTime).not.toBe('');

    const formattedDateTime = formatDateTime('2026-10-18T10:30:00Z');
    expect(formattedDateTime).toContain('Oct');
  });

  it('should format relative time in minutes, hours or date', () => {
    const now = new Date();
    const twoMinsAgo = new Date(now.getTime() - 2 * 60 * 1000).toISOString();
    const twoHoursAgo = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();

    expect(formatRelativeTime(now.toISOString())).toBe('Just now');
    expect(formatRelativeTime(twoMinsAgo)).toBe('2m ago');
    expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
  });
});
