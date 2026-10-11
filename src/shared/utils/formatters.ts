/**
 * Shared Formatting Utilities for ShopSilo Customer Web App
 * Guarantees standard Indian Rupee representations and accurate 12-hour local time formatting.
 */

export const formatCurrency = (amount: number = 0): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
};

export const parseSafeDate = (dateString?: string): Date | null => {
  if (!dateString) return null;
  try {
    let str = String(dateString).trim();
    if (!str.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(str)) {
      str = str.replace(' ', 'T') + 'Z';
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  const d = parseSafeDate(dateString);
  if (!d) return dateString;
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
};

export const formatTime = (dateString?: string): string => {
  if (!dateString) return '';
  const d = parseSafeDate(dateString);
  if (!d) return dateString;
  try {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '';
  const d = parseSafeDate(dateString);
  if (!d) return dateString;
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return dateString;
  }
};

export const formatRelativeTime = (dateString?: string): string => {
  if (!dateString) return '';
  const date = parseSafeDate(dateString);
  if (!date) return dateString;
  try {
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
};
